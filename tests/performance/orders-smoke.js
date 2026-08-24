// Controlled k6 smoke coverage for the representative order-read endpoint.
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

import { createK6SummaryOutputs } from '../support/reporting/k6_report.mjs';
import {
  buildRequestHeaders,
  createOrdersSmokeConfig,
  normalizeBaseUrl,
} from '../support/performance/k6_config.mjs';

const config = createOrdersSmokeConfig(__ENV);
const requestDurationJitter = new Trend('http_req_duration_jitter', true);
let previousRequestDuration;

export const options = {
  scenarios: {
    orders_smoke: {
      executor: 'constant-vus',
      vus: config.vus,
      duration: config.duration,
      gracefulStop: '5s',
    },
  },
  thresholds: {
    checks: [{ threshold: 'rate==1', abortOnFail: true, delayAbortEval: '5s' }],
    'http_req_failed{endpoint:get-order}': ['rate<0.01'],
    'http_req_duration{endpoint:get-order}': ['p(95)<500'],
  },
};

export default function () {
  const baseUrl = normalizeBaseUrl(__ENV.LABOS_API_BASE_URL);
  const orderId = __ENV.LABOS_ORDER_ID;
  if (!orderId) {
    throw new Error('LABOS_ORDER_ID is required');
  }

  const response = http.get(`${baseUrl}/api/v1/orders/${encodeURIComponent(orderId)}`, {
    headers: buildRequestHeaders(__ENV.LABOS_API_TOKEN),
    tags: { endpoint: 'get-order' },
  });

  if (previousRequestDuration !== undefined) {
    requestDurationJitter.add(Math.abs(response.timings.duration - previousRequestDuration));
  }
  previousRequestDuration = response.timings.duration;

  let responseBody;
  try {
    responseBody = response.json();
  } catch {
    responseBody = undefined;
  }

  check(response, {
    'status is 200': (result) => result.status === 200,
    'content type is JSON': (result) =>
      Object.entries(result.headers).some(
        ([name, value]) =>
          name.toLowerCase() === 'content-type' &&
          String(value).toLowerCase().includes('application/json'),
      ),
    'response contains requested order': () => responseBody?.id === orderId,
  });

  if (config.iterationPauseSeconds > 0) {
    sleep(config.iterationPauseSeconds);
  }
}

export function handleSummary(data) {
  return createK6SummaryOutputs(data, __ENV.K6_REPORT_DIRECTORY);
}
