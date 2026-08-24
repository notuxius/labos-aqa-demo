import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildRequestHeaders,
  createOrdersSmokeConfig,
  normalizeBaseUrl,
  parseDuration,
  parseNonNegativeNumber,
  parsePositiveInteger,
} from './k6_config.mjs'

test('smoke configuration uses safe defaults', () => {
  assert.deepEqual(createOrdersSmokeConfig({}), {
    vus: 5,
    duration: '30s',
    iterationPauseSeconds: 0.1,
  })
})

test('numeric configuration rejects invalid values', () => {
  assert.throws(() => parsePositiveInteger('0', 5, 'VUS'), /positive integer/)
  assert.throws(() => parsePositiveInteger('1.5', 5, 'VUS'), /positive integer/)
  assert.throws(() => parseNonNegativeNumber('-1', 0.1, 'pause'), /non-negative/)
})

test('duration validation accepts k6 units and rejects ambiguous values', () => {
  assert.equal(parseDuration('1.5m', '30s', 'DURATION'), '1.5m')
  assert.throws(() => parseDuration('30', '30s', 'DURATION'), /k6 duration/)
  assert.throws(() => parseDuration('0s', '30s', 'DURATION'), /k6 duration/)
})

test('base URL normalization removes trailing slashes', () => {
  assert.equal(normalizeBaseUrl('https://staging.example///'), 'https://staging.example')
  assert.throws(() => normalizeBaseUrl('staging.example'), /absolute HTTP/)
})

test('authorization is sent only when a token is configured', () => {
  assert.deepEqual(buildRequestHeaders(), { Accept: 'application/json' })
  assert.deepEqual(buildRequestHeaders('secret'), {
    Accept: 'application/json',
    Authorization: 'Bearer secret',
  })
})
