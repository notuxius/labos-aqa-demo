const DEFAULT_REPORT_DIRECTORY = "/reports/performance"
const REPORT_NAME = "orders-smoke"
const REPORT_TITLE = "LabOS QA · Order API performance report"
const FAVICON_DATA_URL =
  "data:image/svg+xml,%3Csvg xmlns='http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%236f5ce7'/%3E%3Cpath d='M17 17h8v22h22v8H17z' fill='white'/%3E%3Ccircle cx='44' cy='20' r='7' fill='%2316a36a'/%3E%3C/svg%3E"

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

function formatMetricName(name) {
  const replacements = { http: "HTTP", req: "Request" }
  const [metricName, rawTags] = String(name).split("{", 2)
  const formattedName = metricName
    .split("_")
    .filter(Boolean)
    .map((word) => replacements[word] ?? `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ")

  if (!rawTags) {
    return formattedName
  }

  const tags = rawTags
    .replace(/}$/, "")
    .split(",")
    .map((tag) => tag.replace(/[:=]/, ": "))
    .join(", ")
  return `${formattedName} (${tags})`
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

function formatRate(rate, unit) {
  return `${formatNumber(rate)}\u00a0${unit}/s`
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

function optionalLatencyRow(label, value) {
  const formatted = Number.isFinite(value) ? formatDurationMs(value) : "Not available"
  return `<tr><th scope="row">${escapeHtml(label)}</th><td class="numeric">${escapeHtml(formatted)}</td></tr>`
}

function perRequest(total, requestCount) {
  const count = finite(requestCount)
  return count > 0 ? finite(total) / count : 0
}

function donutChart({ id, title, description, positiveLabel, negativeLabel, positive, negative }) {
  const positiveCount = finite(positive)
  const negativeCount = finite(negative)
  const total = positiveCount + negativeCount
  const rate = total > 0 ? positiveCount / total : 0
  const percentage = Math.min(100, Math.max(0, rate * 100))
  const remainder = 100 - percentage

  return `
      <section class="chart-panel">
        <h2>${escapeHtml(title)}</h2>
        <p class="chart-description">${escapeHtml(description)}</p>
        <div class="donut-layout">
          <svg class="donut-chart" viewBox="0 0 120 120" role="img" aria-labelledby="${id}-title ${id}-description">
            <title id="${id}-title">${escapeHtml(title)}</title>
            <desc id="${id}-description">${escapeHtml(`${positiveLabel}: ${positiveCount}; ${negativeLabel}: ${negativeCount}`)}</desc>
            <circle class="donut-track ${total > 0 ? "negative" : "empty"}" cx="60" cy="60" r="46" pathLength="100"></circle>
            <circle class="donut-progress" cx="60" cy="60" r="46" pathLength="100" stroke-dasharray="${percentage} ${remainder}"></circle>
            <text class="donut-value" x="60" y="57" text-anchor="middle">${escapeHtml(formatPercentage(rate))}</text>
            <text class="donut-label" x="60" y="75" text-anchor="middle">${escapeHtml(positiveLabel)}</text>
          </svg>
          <ul class="chart-legend" aria-label="${escapeHtml(title)} legend">
            <li><span class="legend-swatch positive"></span><span>${escapeHtml(positiveLabel)}</span><strong>${escapeHtml(formatNumber(positiveCount))}</strong></li>
            <li><span class="legend-swatch negative"></span><span>${escapeHtml(negativeLabel)}</span><strong>${escapeHtml(formatNumber(negativeCount))}</strong></li>
          </ul>
        </div>
      </section>`
}

function horizontalBarChart({ id, title, description, items, formatter, wide = false }) {
  const values = items.map((item) => Math.max(0, finite(item.value)))
  const maximum = Math.max(...values, 0)
  const rowHeight = 42
  const chartHeight = 20 + items.length * rowHeight
  const geometry = wide
    ? { chartWidth: 760, barX: 180, barWidth: 370, valueX: 750 }
    : { chartWidth: 520, barX: 105, barWidth: 275, valueX: 510 }
  const bars = items
    .map((item, index) => {
      const value = values[index]
      const barWidth =
        maximum > 0 && value > 0 ? Math.max(3, (value / maximum) * geometry.barWidth) : 0
      const y = 12 + index * rowHeight

      return `
            <text class="bar-label" x="0" y="${y + 17}">${escapeHtml(item.label)}</text>
            <rect class="bar-track" x="${geometry.barX}" y="${y}" width="${geometry.barWidth}" height="22" rx="6"></rect>
            <rect class="bar-value ${item.highlight ? "highlight" : ""}" x="${geometry.barX}" y="${y}" width="${barWidth}" height="22" rx="6"></rect>
            <text class="bar-number" x="${geometry.valueX}" y="${y + 17}" text-anchor="end">${escapeHtml(formatter(value, item))}</text>`
    })
    .join("")

  return `
      <section class="chart-panel ${wide ? "chart-wide" : ""}">
        <h2>${escapeHtml(title)}</h2>
        <p class="chart-description">${escapeHtml(description)}</p>
        <svg class="bar-chart" viewBox="0 0 ${geometry.chartWidth} ${chartHeight}" role="img" aria-labelledby="${id}-title ${id}-description">
          <title id="${id}-title">${escapeHtml(title)}</title>
          <desc id="${id}-description">${escapeHtml(description)}</desc>
          ${bars}
        </svg>
      </section>`
}

export function renderK6Report(summary) {
  const checks = metricValues(summary, "checks")
  const failures = metricValues(summary, "http_req_failed")
  const requests = metricValues(summary, "http_reqs")
  const iterations = metricValues(summary, "iterations")
  const duration = metricValues(summary, "http_req_duration")
  const jitter = metricValues(summary, "http_req_duration_jitter")
  const received = metricValues(summary, "data_received")
  const sent = metricValues(summary, "data_sent")
  const thresholds = thresholdResults(summary)
  const passed = thresholds.every((threshold) => threshold.passed)
  const status = passed ? "Passed" : "Failed"
  const generatedAt = new Date().toISOString()
  const checkOutcomes = donutChart({
    id: "checks-chart",
    title: "Check outcomes",
    description: "Passed and failed functional checks across all iterations.",
    positiveLabel: "Passed",
    negativeLabel: "Failed",
    positive: checks.passes,
    negative: checks.fails
  })
  const requestOutcomes = donutChart({
    id: "requests-chart",
    title: "HTTP request outcomes",
    description: "Successful and failed HTTP requests according to k6 response classification.",
    positiveLabel: "Successful",
    negativeLabel: "Failed",
    positive: failures.fails,
    negative: failures.passes
  })
  const latencyChart = horizontalBarChart({
    id: "latency-chart",
    title: "Latency distribution",
    description: "Relative HTTP request duration across aggregate statistics; exact values appear at right.",
    wide: true,
    formatter: formatDurationMs,
    items: [
      { label: "Minimum", value: duration.min },
      { label: "Median", value: duration.med },
      { label: "Average", value: duration.avg },
      { label: "90th percentile latency", value: duration["p(90)"] },
      { label: "95th percentile latency", value: duration["p(95)"], highlight: true },
      { label: "Maximum", value: duration.max }
    ]
  })
  const throughputChart = horizontalBarChart({
    id: "throughput-chart",
    title: "Execution throughput",
    description: "Completed HTTP requests and full test iterations per second.",
    formatter: (value, item) => formatRate(value, item.unit),
    items: [
      { label: "Requests", value: requests.rate, unit: "req", highlight: true },
      { label: "Iterations", value: iterations.rate, unit: "iter" }
    ]
  })
  const transferChart = horizontalBarChart({
    id: "transfer-chart",
    title: "Network traffic",
    description: "Total payload volume received from and sent to the target service.",
    formatter: formatBytes,
    items: [
      { label: "Received", value: received.count, highlight: true },
      { label: "Sent", value: sent.count }
    ]
  })

  const thresholdRows = thresholds.length
    ? thresholds
        .map(
          ({ metricName, expression, passed: thresholdPassed }) => `
          <tr>
            <th scope="row">${escapeHtml(formatMetricName(metricName))}</th>
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
  <meta name="application-name" content="LabOS QA">
  <link rel="icon" type="image/svg+xml" href="${FAVICON_DATA_URL}">
  <title>${REPORT_TITLE}</title>
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
    .cards { display: flex; flex-wrap: wrap; width: 100%; gap: 14px; margin-bottom: 20px; }
    .card, section { background: #fff; border: 1px solid #dde2ec; border-radius: 12px; box-shadow: 0 4px 16px rgb(20 33 61 / 6%); }
    .card { display: grid; flex: 1 1 220px; min-width: 0; gap: 6px; padding: 18px; }
    .metric-pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); flex: 2 1 454px; min-width: 0; gap: 14px; }
    .card-label, .card-detail { color: #687386; font-size: 0.82rem; }
    .metric-value, .numeric { white-space: nowrap; font-variant-numeric: tabular-nums; }
    .metric-value { font-size: 1.7rem; }
    .charts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; margin-bottom: 20px; }
    .chart-wide { grid-column: 1 / -1; }
    .chart-description { min-height: 2.5em; margin: -8px 0 16px; font-size: 0.86rem; line-height: 1.45; }
    .donut-layout { display: grid; grid-template-columns: minmax(140px, 190px) 1fr; align-items: center; gap: 20px; }
    .donut-chart { display: block; width: 100%; height: auto; overflow: visible; }
    .donut-track, .donut-progress { fill: none; stroke-width: 12; }
    .donut-track.negative { stroke: #e15162; }
    .donut-track.empty { stroke: #edf0f5; }
    .donut-progress { stroke: #16a36a; stroke-linecap: round; transform: rotate(-90deg); transform-origin: 60px 60px; }
    .donut-value { fill: #172033; font-size: 15px; font-weight: 750; font-variant-numeric: tabular-nums; }
    .donut-label { fill: #687386; font-size: 7px; }
    .chart-legend { display: grid; gap: 12px; margin: 0; padding: 0; list-style: none; }
    .chart-legend li { display: grid; grid-template-columns: 10px 1fr auto; align-items: center; gap: 8px; font-size: 0.86rem; }
    .chart-legend strong { white-space: nowrap; font-variant-numeric: tabular-nums; }
    .legend-swatch { width: 10px; height: 10px; border-radius: 3px; }
    .legend-swatch.positive { background: #16a36a; }
    .legend-swatch.negative { background: #e15162; }
    .bar-chart { display: block; width: 100%; min-width: 0; height: auto; overflow: visible; }
    .chart-wide .bar-chart { min-width: 700px; }
    .bar-track { fill: #edf0f5; }
    .bar-value { fill: #a99cfb; }
    .bar-value.highlight { fill: #6f5ce7; }
    .bar-label, .bar-number { fill: #344056; font: 13px Inter, ui-sans-serif, system-ui, sans-serif; }
    .bar-number { font-variant-numeric: tabular-nums; }
    .tables { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }
    .table-description { min-height: 3.8em; margin: -8px 0 10px; font-size: 0.82rem; line-height: 1.45; }
    section { padding: 20px; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 8px; text-align: left; border-bottom: 1px solid #edf0f5; }
    th { font-weight: 600; }
    td.numeric { text-align: right; }
    .badge { display: inline-block; padding: 4px 9px; border-radius: 999px; font-size: 0.78rem; font-weight: 700; white-space: nowrap; }
    code { white-space: nowrap; }
    footer { margin-top: 18px; color: #7a8495; font-size: 0.8rem; }
    @media (max-width: 760px) { .charts { grid-template-columns: 1fr; } .chart-wide { grid-column: auto; } }
    @media (max-width: 560px) { body { padding: 20px 12px; } header { display: block; } .status { display: inline-block; margin-top: 8px; } .donut-layout { grid-template-columns: 130px 1fr; } }
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
      <div class="metric-pair" aria-label="Latency percentiles">
        ${card("90th percentile latency", formatDurationMs(duration["p(90)"]), "90% of requests at or below")}
        ${card("95th percentile latency", formatDurationMs(duration["p(95)"]), "Target: below 500 ms")}
      </div>
      ${card("Request rate", formatRate(requests.rate, "req"), `${finite(requests.count)} total requests`)}
      ${card("Iteration rate", formatRate(iterations.rate, "iter"), `${finite(iterations.count)} completed`)}
      ${card("Test duration", formatDurationMs(summary.state?.testRunDurationMs), "Wall-clock execution")}
    </div>

    <div class="charts">
      ${latencyChart}
      ${checkOutcomes}
      ${requestOutcomes}
      ${throughputChart}
      ${transferChart}
    </div>

    <div class="tables">
      <section>
        <h2>HTTP request duration</h2>
        <p class="table-description">Aggregate end-to-end request timing across all HTTP samples.</p>
        <table><tbody>
          ${latencyRow("Average", duration.avg)}
          ${latencyRow("Median", duration.med)}
          ${latencyRow("Minimum", duration.min)}
          ${latencyRow("Maximum", duration.max)}
          ${latencyRow("90th percentile latency", duration["p(90)"])}
          ${latencyRow("95th percentile latency", duration["p(95)"])}
        </tbody></table>
      </section>

      <section>
        <h2>Latency variation</h2>
        <p class="table-description">Absolute duration change between consecutive requests for each virtual user.</p>
        <table><tbody>
          ${optionalLatencyRow("Average jitter", jitter.avg)}
          ${optionalLatencyRow("Median jitter", jitter.med)}
          ${optionalLatencyRow("95th percentile jitter", jitter["p(95)"])}
          ${optionalLatencyRow("Maximum jitter", jitter.max)}
        </tbody></table>
      </section>

      <section>
        <h2>Data transfer</h2>
        <p class="table-description">Totals, rates, and average bytes per completed HTTP request.</p>
        <table><tbody>
          <tr><th scope="row">Total received</th><td class="numeric">${escapeHtml(formatBytes(received.count))}</td></tr>
          <tr><th scope="row">Received per request</th><td class="numeric">${escapeHtml(formatBytes(perRequest(received.count, requests.count)))}</td></tr>
          <tr><th scope="row">Received rate</th><td class="numeric">${escapeHtml(`${formatBytes(received.rate)}/s`)}</td></tr>
          <tr><th scope="row">Total sent</th><td class="numeric">${escapeHtml(formatBytes(sent.count))}</td></tr>
          <tr><th scope="row">Sent per request</th><td class="numeric">${escapeHtml(formatBytes(perRequest(sent.count, requests.count)))}</td></tr>
          <tr><th scope="row">Sent rate</th><td class="numeric">${escapeHtml(`${formatBytes(sent.rate)}/s`)}</td></tr>
          <tr><th scope="row">Combined total</th><td class="numeric">${escapeHtml(formatBytes(finite(received.count) + finite(sent.count)))}</td></tr>
          <tr><th scope="row">Combined rate</th><td class="numeric">${escapeHtml(`${formatBytes(finite(received.rate) + finite(sent.rate))}/s`)}</td></tr>
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
  const jitter = metricValues(summary, "http_req_duration_jitter")
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
    `  HTTP request rate: ${formatRate(requests.rate, "req")}`,
    `  HTTP 95th percentile latency: ${formatDurationMs(duration["p(95)"])}`,
    `  HTTP average jitter: ${Number.isFinite(jitter.avg) ? formatDurationMs(jitter.avg) : "not available"}`,
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
