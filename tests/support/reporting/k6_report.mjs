const DEFAULT_REPORT_DIRECTORY = "/reports/performance"
const REPORT_NAME = "orders-smoke"

function finite(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback
}

function formatNumber(value, minimumFractionDigits = 0, maximumFractionDigits = 2) {
  const [whole, rawFraction = ""] = finite(value).toFixed(maximumFractionDigits).split(".")
  let fraction = rawFraction

  while (fraction.length > minimumFractionDigits && fraction.endsWith("0")) {
    fraction = fraction.slice(0, -1)
  }

  const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return fraction ? `${groupedWhole}.${fraction}` : groupedWhole
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function metricValues(summary, name) {
  return summary.metrics?.[name]?.values ?? {}
}

export function formatPercentage(rate) {
  return `${formatNumber(finite(rate) * 100, 1, 1)}%`
}

export function formatDurationMs(milliseconds) {
  const value = finite(milliseconds)

  if (Math.abs(value) < 1) {
    return `${formatNumber(value * 1000)}\u00a0µs`
  }

  if (Math.abs(value) < 1000) {
    return `${formatNumber(value)}\u00a0ms`
  }

  return `${formatNumber(value / 1000)}\u00a0s`
}

function formatRate(rate) {
  return `${formatNumber(rate)}\u00a0/s`
}

function formatBytes(bytes) {
  const value = finite(bytes)
  const units = ["B", "kB", "MB", "GB"]
  let unitIndex = 0
  let scaled = value

  while (Math.abs(scaled) >= 1000 && unitIndex < units.length - 1) {
    scaled /= 1000
    unitIndex += 1
  }

  return `${formatNumber(scaled)}\u00a0${units[unitIndex]}`
}

function thresholdResults(summary) {
  return Object.entries(summary.metrics ?? {}).flatMap(([metricName, metric]) =>
    Object.entries(metric.thresholds ?? {}).map(([expression, result]) => ({
      metricName,
      expression,
      passed: result.ok === true
    }))
  )
}

function card(label, value, detail) {
  return `
    <article class="card">
      <span class="card-label">${escapeHtml(label)}</span>
      <strong class="metric-value">${escapeHtml(value)}</strong>
      <span class="card-detail">${escapeHtml(detail)}</span>
    </article>`
}

function latencyRow(label, value) {
  return `<tr><th scope="row">${escapeHtml(label)}</th><td class="numeric">${escapeHtml(formatDurationMs(value))}</td></tr>`
}

export function renderK6Report(summary) {
  const checks = metricValues(summary, "checks")
  const failures = metricValues(summary, "http_req_failed")
  const requests = metricValues(summary, "http_reqs")
  const iterations = metricValues(summary, "iterations")
  const duration = metricValues(summary, "http_req_duration")
  const received = metricValues(summary, "data_received")
  const sent = metricValues(summary, "data_sent")
  const thresholds = thresholdResults(summary)
  const passed = thresholds.every((threshold) => threshold.passed)
  const status = passed ? "Passed" : "Failed"
  const generatedAt = new Date().toISOString()

  const thresholdRows = thresholds.length
    ? thresholds
        .map(
          ({ metricName, expression, passed: thresholdPassed }) => `
          <tr>
            <th scope="row">${escapeHtml(metricName)}</th>
            <td><code>${escapeHtml(expression)}</code></td>
            <td><span class="badge ${thresholdPassed ? "pass" : "fail"}">${thresholdPassed ? "Passed" : "Failed"}</span></td>
          </tr>`
        )
        .join("")
    : '<tr><td colspan="3">No thresholds were configured.</td></tr>'

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>k6 order smoke report</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #172033; background: #f4f6fb; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 32px 20px; }
    main { width: min(1080px, 100%); margin: 0 auto; }
    header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-bottom: 24px; }
    h1, h2 { margin: 0; }
    h1 { font-size: clamp(1.7rem, 4vw, 2.4rem); }
    h2 { margin-bottom: 16px; font-size: 1.1rem; }
    p { color: #5b6578; }
    .status { flex: 0 0 auto; padding: 8px 14px; border-radius: 999px; font-weight: 700; }
    .status.pass, .badge.pass { color: #096b3e; background: #dff7ea; }
    .status.fail, .badge.fail { color: #a51d2d; background: #fde5e8; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 20px; }
    .card, section { background: #fff; border: 1px solid #dde2ec; border-radius: 12px; box-shadow: 0 4px 16px rgb(20 33 61 / 6%); }
    .card { display: grid; gap: 6px; padding: 18px; }
    .card-label, .card-detail { color: #687386; font-size: 0.82rem; }
    .metric-value, .numeric { white-space: nowrap; font-variant-numeric: tabular-nums; }
    .metric-value { font-size: 1.7rem; }
    .tables { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }
    section { padding: 20px; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 8px; text-align: left; border-bottom: 1px solid #edf0f5; }
    th { font-weight: 600; }
    td.numeric { text-align: right; }
    .badge { display: inline-block; padding: 4px 9px; border-radius: 999px; font-size: 0.78rem; font-weight: 700; white-space: nowrap; }
    code { white-space: nowrap; }
    footer { margin-top: 18px; color: #7a8495; font-size: 0.8rem; }
    @media (max-width: 560px) { body { padding: 20px 12px; } header { display: block; } .status { display: inline-block; margin-top: 8px; } }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>Order API performance smoke</h1>
        <p>Aggregated k6 results with explicit units and threshold outcomes.</p>
      </div>
      <span class="status ${passed ? "pass" : "fail"}">${status}</span>
    </header>

    <div class="cards">
      ${card("Checks passed", formatPercentage(checks.rate), `${finite(checks.passes)} passed, ${finite(checks.fails)} failed`)}
      ${card("HTTP failures", formatPercentage(failures.rate), `${finite(failures.passes)} failed requests`)}
      ${card("Request rate", formatRate(requests.rate), `${finite(requests.count)} total requests`)}
      ${card("p95 latency", formatDurationMs(duration["p(95)"]), "Target: below 500 ms")}
      ${card("Iteration rate", formatRate(iterations.rate), `${finite(iterations.count)} completed`)}
      ${card("Test duration", formatDurationMs(summary.state?.testRunDurationMs), "Wall-clock execution")}
    </div>

    <div class="tables">
      <section>
        <h2>HTTP request duration</h2>
        <table><tbody>
          ${latencyRow("Average", duration.avg)}
          ${latencyRow("Median", duration.med)}
          ${latencyRow("Minimum", duration.min)}
          ${latencyRow("Maximum", duration.max)}
          ${latencyRow("p90", duration["p(90)"])}
          ${latencyRow("p95", duration["p(95)"])}
        </tbody></table>
      </section>

      <section>
        <h2>Data transfer</h2>
        <table><tbody>
          <tr><th scope="row">Received</th><td class="numeric">${escapeHtml(formatBytes(received.count))}</td></tr>
          <tr><th scope="row">Received rate</th><td class="numeric">${escapeHtml(`${formatBytes(received.rate)}/s`)}</td></tr>
          <tr><th scope="row">Sent</th><td class="numeric">${escapeHtml(formatBytes(sent.count))}</td></tr>
          <tr><th scope="row">Sent rate</th><td class="numeric">${escapeHtml(`${formatBytes(sent.rate)}/s`)}</td></tr>
        </tbody></table>
      </section>
    </div>

    <section style="margin-top: 20px">
      <h2>Thresholds</h2>
      <table>
        <thead><tr><th>Metric</th><th>Expression</th><th>Result</th></tr></thead>
        <tbody>${thresholdRows}</tbody>
      </table>
    </section>

    <footer>Generated ${escapeHtml(generatedAt)} by the repository-owned k6 summary renderer.</footer>
  </main>
</body>
</html>`
}

export function renderK6TextSummary(summary) {
  const checks = metricValues(summary, "checks")
  const failures = metricValues(summary, "http_req_failed")
  const requests = metricValues(summary, "http_reqs")
  const duration = metricValues(summary, "http_req_duration")
  const thresholds = thresholdResults(summary)
  const passed = thresholds.every((threshold) => threshold.passed)
  const thresholdLines = thresholds.map(
    ({ metricName, expression, passed: thresholdPassed }) =>
      `  ${thresholdPassed ? "PASS" : "FAIL"} ${metricName}: ${expression}`
  )

  return [
    "",
    `Order API performance smoke: ${passed ? "PASSED" : "FAILED"}`,
    `  checks passed: ${formatPercentage(checks.rate)}`,
    `  HTTP failures: ${formatPercentage(failures.rate)}`,
    `  HTTP request rate: ${formatRate(requests.rate)}`,
    `  HTTP p95 latency: ${formatDurationMs(duration["p(95)"])}`,
    "  thresholds:",
    ...(thresholdLines.length ? thresholdLines : ["  none"]),
    ""
  ].join("\n")
}

export function createK6SummaryOutputs(summary, reportDirectory = DEFAULT_REPORT_DIRECTORY) {
  const directory = reportDirectory.replace(/\/+$/, "")

  return {
    stdout: renderK6TextSummary(summary),
    [`${directory}/${REPORT_NAME}-report.html`]: renderK6Report(summary),
    [`${directory}/${REPORT_NAME}-summary.json`]: JSON.stringify(summary, null, 2)
  }
}
