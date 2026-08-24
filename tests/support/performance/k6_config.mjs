const durationPattern = /^\d+(?:\.\d+)?(?:ms|s|m|h)$/

export function parsePositiveInteger(value, fallback, name) {
  const parsed = Number(value ?? fallback)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`)
  }
  return parsed
}

export function parseNonNegativeNumber(value, fallback, name) {
  const parsed = Number(value ?? fallback)
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative number`)
  }
  return parsed
}

export function parseDuration(value, fallback, name) {
  const parsed = value ?? fallback
  const match = durationPattern.exec(parsed)
  if (!match || Number.parseFloat(parsed) <= 0) {
    throw new Error(`${name} must use a k6 duration such as 30s, 5m, or 1h`)
  }
  return parsed
}

export function normalizeBaseUrl(value) {
  if (!value || !/^https?:\/\/[^\s]+$/.test(value)) {
    throw new Error('LABOS_API_BASE_URL must be an absolute HTTP(S) URL')
  }
  return value.replace(/\/+$/, '')
}

export function buildRequestHeaders(token) {
  const headers = { Accept: 'application/json' }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

export function createOrdersSmokeConfig(env) {
  return {
    vus: parsePositiveInteger(env.VUS, 5, 'VUS'),
    duration: parseDuration(env.DURATION, '30s', 'DURATION'),
    iterationPauseSeconds: parseNonNegativeNumber(
      env.ITERATION_PAUSE_SECONDS,
      0.1,
      'ITERATION_PAUSE_SECONDS',
    ),
  }
}
