/*
 * saved-envelope.test.ts — what a store reads back is trusted only when it
 * is this version and every item fits; the memory store keeps content and
 * photos until cleared. Made-up data only.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { openSavedEnvelope, readList, toSavedEnvelope } from '../storage/saved-envelope.ts'
import { createMemoryStore } from '../storage/memory-store.ts'

function readNumber(value: unknown): number | null {
  return typeof value === 'number' ? value : null
}

test('an envelope of this version opens to its data', function opens() {
  assert.deepEqual(openSavedEnvelope(toSavedEnvelope(3, { items: [1] }), 3), { items: [1] })
})

test('another version, text, null and arrays do not open', function refuses() {
  assert.equal(openSavedEnvelope(toSavedEnvelope(2, { items: [] }), 3), null)
  assert.equal(openSavedEnvelope('hello', 3), null)
  assert.equal(openSavedEnvelope(null, 3), null)
  assert.equal(openSavedEnvelope([], 3), null)
})

test('a list is read only when every item fits', function readsLists() {
  assert.deepEqual(readList([1, 2], readNumber), [1, 2])
  assert.equal(readList([1, 'two'], readNumber), null)
  assert.equal(readList('not a list', readNumber), null)
})

test('the memory store keeps data and photos until cleared, and says it is memory', async function memoryStoreKeeps() {
  const store = createMemoryStore<{ items: number[] }>()
  const photo = new Blob(['made-up photo bytes'], { type: 'image/jpeg' })
  await Promise.all([store.saveData({ items: [1] }), store.savePhoto('p1', photo)])
  assert.equal(store.mode, 'memory')
  assert.deepEqual(await store.loadData(), { ok: true, value: { items: [1] } })
  assert.deepEqual(await store.loadPhoto('p1'), { ok: true, value: photo })
  await store.clear()
  assert.deepEqual(await store.loadData(), { ok: true, value: null })
  assert.deepEqual(await store.loadPhoto('p1'), { ok: true, value: null })
})
