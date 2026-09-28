/*
 * saved-demo.test.ts — which saves Stofpad trusts: the seed round-trips,
 * an owner's product with a stored photo and out-of-stock flag reads back,
 * and a product with a broken price, name or photo makes the whole save
 * unreadable.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readSavedDemo, SAVED_VERSION } from '../src/features/storage/saved-demo.ts'
import { seedData } from '../src/features/demo/demo-reducer.ts'
import { toSavedEnvelope } from '../../_core/storage/saved-envelope.ts'

function saveWith(products: unknown[]): unknown {
  return toSavedEnvelope(SAVED_VERSION, { ...seedData(), products })
}

function firstProduct(): Record<string, unknown> {
  return { ...seedData().products[0] }
}

function maize(): Record<string, unknown> {
  return { ...seedData().products.at(-1) }
}

test('the seed saves and reads back exactly', function roundTrips() {
  assert.deepEqual(readSavedDemo(toSavedEnvelope(SAVED_VERSION, seedData())), seedData())
})

test('a stored photo and an out-of-stock flag read back', function readsOwnerProduct() {
  const product = { ...firstProduct(), photo: { kind: 'stored', photoId: 'p1' }, inStock: false }
  assert.deepEqual(readSavedDemo(saveWith([product]))?.products, [product])
})

test('a product with no price per kg and no packs is refused', function refusesNoPrice() {
  assert.equal(readSavedDemo(saveWith([{ ...firstProduct(), pricePerKg: null }])), null)
})

test('a pack with a negative price, or an empty pack list, is refused', function refusesBadPacks() {
  assert.equal(readSavedDemo(saveWith([{ ...maize(), packs: [{ grams: 1000, cents: -5 }] }])), null)
  assert.equal(readSavedDemo(saveWith([{ ...maize(), packs: [] }])), null)
})

test('a product without both languages or without a photo is refused', function refusesBadProduct() {
  assert.equal(readSavedDemo(saveWith([{ ...firstProduct(), name: { en: 'Only English' } }])), null)
  assert.equal(readSavedDemo(saveWith([{ ...firstProduct(), photo: 'beef.svg' }])), null)
})

test('a save from another version starts fresh', function refusesVersion() {
  assert.equal(readSavedDemo(toSavedEnvelope(SAVED_VERSION + 1, seedData())), null)
})
