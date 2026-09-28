/*
 * price-list.test.ts — Copperkloof's price-list rules with made-up
 * prices: showing rand, changing and renaming one item. Reading typed rand
 * is tested in ../../_core/tests/rand-input.test.ts.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { formatRand, setPrice, renameItem, priceFor } from '../src/features/prices/price-list.ts'
import type { PriceItem } from '../src/features/prices/price-list.ts'

function items(): PriceItem[] {
  return [
    { id: 'one', label: 'First thing', cents: 45_000 },
    { id: 'two', label: 'Second thing', cents: 120_000 },
  ]
}

test('rand shows grouped thousands and cents only when there are some', function showsRand() {
  assert.equal(formatRand(65_000), 'R650')
  assert.equal(formatRand(125_000), 'R1 250')
  assert.equal(formatRand(9_950), 'R99.50')
})

test('changing one price leaves the others alone', function setsOne() {
  const changed = setPrice(items(), 'two', 99_900)
  assert.deepEqual(changed.map(centsOfItem), [45_000, 99_900])

  function centsOfItem(item: PriceItem): number {
    return item.cents
  }
})

test('renaming trims the label, and an empty label keeps the old one', function renames() {
  assert.equal(renameItem(items(), 'one', '  New name ')[0]?.label, 'New name')
  assert.equal(renameItem(items(), 'one', '   ')[0]?.label, 'First thing')
})

test('a price is found by id, or null when it is not in the list', function findsPrice() {
  assert.equal(priceFor(items(), 'two')?.cents, 120_000)
  assert.equal(priceFor(items(), 'nope'), null)
})
