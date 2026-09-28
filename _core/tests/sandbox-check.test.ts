/*
 * sandbox-check.test.ts — the sandbox-check's decisions with made-up
 * requests and titles: what counts as leaving the page, and what counts as
 * the seed being back.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { offOriginRequests, showsSeed } from '../checks/sandbox/sandbox-rules.ts'

const ORIGIN = 'http://127.0.0.1:4000'

test('requests to the page itself, blob: and data: stay in the sandbox', function staysHome() {
  const names = [`${ORIGIN}/assets/index.js`, 'blob:http://127.0.0.1:4000/abc', 'data:image/png;base64,xyz']
  assert.deepEqual(offOriginRequests(names, ORIGIN), [])
})

test('a request to any other host is reported', function leaves() {
  assert.deepEqual(offOriginRequests([`${ORIGIN}/`, 'https://example.test/pixel.gif'], ORIGIN), ['https://example.test/pixel.gif'])
})

test('another port on the same machine is another origin', function otherPort() {
  assert.equal(offOriginRequests(['http://127.0.0.1:5000/x'], ORIGIN).length, 1)
})

test('the seed is back only with the same titles in the same order', function seedBack() {
  assert.equal(showsSeed(['A', 'B'], ['A', 'B']), true)
  assert.equal(showsSeed(['B', 'A'], ['A', 'B']), false)
  assert.equal(showsSeed(['New', 'A', 'B'], ['A', 'B']), false)
})
