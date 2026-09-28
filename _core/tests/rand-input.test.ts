/*
 * rand-input.test.ts — reading a price typed in rand, and writing one
 * back the way it would be typed, with made-up amounts.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { parseRand, randInputText, MAX_PRICE_RAND } from '../prices/rand-input.ts'

function centsOf(text: string): number | null {
  const parsed = parseRand(text)
  return parsed.ok ? parsed.value : null
}

test('plain and written-out rand amounts read as cents', function readsRand() {
  assert.equal(centsOf('650'), 65_000)
  assert.equal(centsOf('R650'), 65_000)
  assert.equal(centsOf('r 1 250'), 125_000)
  assert.equal(centsOf('1,250.50'), 125_050)
  assert.equal(centsOf('99,5'), 9_950)
})

test('words, negatives and empty input are refused', function refusesNonsense() {
  assert.equal(centsOf('about 500'), null)
  assert.equal(centsOf('-50'), null)
  assert.equal(centsOf('   '), null)
})

test('an amount over the limit is refused, the limit itself is fine', function refusesHuge() {
  assert.equal(centsOf(String(MAX_PRICE_RAND + 1)), null)
  assert.equal(centsOf(String(MAX_PRICE_RAND)), MAX_PRICE_RAND * 100)
})

test('an amount shows the way it would be typed', function inputText() {
  assert.equal(randInputText(65_000), '650')
  assert.equal(randInputText(9_905), '99.05')
})
