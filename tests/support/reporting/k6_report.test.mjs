import assert from "node:assert/strict"
import test from "node:test"

import {
  createK6SummaryOutputs,
  formatDurationMs,
  formatPercentage,
  renderK6Report,
  renderK6TextSummary
} from "./k6_report.mjs"

const summary = {
  state: { testRunDurationMs: 1250 },
  metrics: {
    checks: { values: { rate: 0.25, passes: 1, fails: 3 } },
    http_req_failed: {
      values: { rate: 0, passes: 0, fails: 4 },
      thresholds: { "rate<0.01": { ok: true } }
    },
    http_reqs: { values: { count: 4, rate: 3.2 } },
    iterations: { values: { count: 4, rate: 3.2 } },
    http_req_duration: {
      values: { avg: 0.75, med: 0.8, min: 0.25, max: 1.2, "p(90)": 1, "p(95)": 1.1 },
      thresholds: { "p(95)<500": { ok: true } }
    },
    data_received: { values: { count: 2400, rate: 1200 } },
    data_sent: { values: { count: 1200, rate: 600 } }
  }
}

test("percentage formatter treats k6 rates as zero-to-one values", () => {
  assert.equal(formatPercentage(0.25), "25.0%")
  assert.equal(formatPercentage(0), "0.0%")
})

test("duration formatter keeps values and units together", () => {
  assert.equal(formatDurationMs(0.75), "750\u00a0µs")
  assert.equal(formatDurationMs(1), "1\u00a0ms")
})

test("HTML report has stable percentage and duration labels", () => {
  const report = renderK6Report(summary)

  assert.match(report, /25\.0%/)
  assert.doesNotMatch(report, /2500\.0%/)
  assert.match(report, /750\u00a0µs/)
  assert.match(report, /white-space: nowrap/)
})

test("HTML report has branded browser metadata", () => {
  const report = renderK6Report(summary)

  assert.match(report, /<title>LabOS QA · Order API performance report<\/title>/)
  assert.match(report, /<meta name="application-name" content="LabOS QA">/)
  assert.match(report, /<link rel="icon" type="image\/svg\+xml" href="data:image\/svg\+xml,/)
})

test("HTML report includes accessible aggregate charts", () => {
  const report = renderK6Report(summary)
  const charts = report.match(/<svg class=/g) ?? []

  assert.equal(charts.length, 5)
  assert.match(report, /Latency distribution/)
  assert.match(report, /Check outcomes/)
  assert.match(report, /HTTP request outcomes/)
  assert.match(report, /Execution throughput/)
  assert.match(report, /Transferred data/)
  assert.match(report, /role="img" aria-labelledby=/)
  assert.match(report, /stroke-dasharray="25 75"/)
  assert.doesNotMatch(report, /<script|https?:\/\//)
})

test("charts remain finite when optional metrics are absent", () => {
  const report = renderK6Report({ state: {}, metrics: {} })

  assert.doesNotMatch(report, /NaN|Infinity/)
  assert.match(report, /stroke-dasharray="0 100"/)
})

test("summary outputs use the requested report directory", () => {
  const outputs = createK6SummaryOutputs(summary, "/tmp/k6/")

  assert.deepEqual(Object.keys(outputs), [
    "stdout",
    "/tmp/k6/orders-smoke-report.html",
    "/tmp/k6/orders-smoke-summary.json"
  ])
  assert.doesNotThrow(() => JSON.parse(outputs["/tmp/k6/orders-smoke-summary.json"]))
})

test("text summary preserves useful terminal diagnostics", () => {
  const output = renderK6TextSummary(summary)

  assert.match(output, /Order API performance smoke: PASSED/)
  assert.match(output, /HTTP failures: 0\.0%/)
  assert.match(output, /PASS http_req_duration: p\(95\)<500/)
})
