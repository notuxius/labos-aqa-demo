// Controlled k6 smoke coverage for the representative order-read endpoint.
import http from 'k6/http';
import { check, sleep } from 'k6';

const iterationPauseSeconds = Number(__ENV.ITERATION_PAUSE_SECONDS ?? 0.1);

if (!Number.isFinite(iterationPauseSeconds) || iterationPauseSeconds < 0) {
  throw new Error('ITERATION_PAUSE_SECONDS must be a non-negative number');
}

export const options = {
  scenarios: {
    orders_smoke: {
      executor: 'constant-vus',
      vus: Number(__ENV.VUS ?? 5),
      duration: __ENV.DURATION ?? '30s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const baseUrl = __ENV.LABOS_API_BASE_URL;
  const orderId = __ENV.LABOS_ORDER_ID;
  if (!baseUrl || !orderId) {
    throw new Error('LABOS_API_BASE_URL and LABOS_ORDER_ID are required');
  }

  const response = http.get(`${baseUrl}/api/v1/orders/${orderId}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${__ENV.LABOS_API_TOKEN ?? ''}`,
    },
    tags: { endpoint: 'get-order' },
  });

  check(response, {
    'status is 200': (result) => result.status === 200,
  });

  if (iterationPauseSeconds > 0) {
    sleep(iterationPauseSeconds);
  }
}
