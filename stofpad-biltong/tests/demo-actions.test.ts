/*
 * demo-actions.test.ts — what Stofpad's admin buttons do, against the
 * shared memory store and a recording dispatch: a refused product leaves
 * nothing behind, an added product keeps its photo and leads the shop,
 * a price change reaches the order's message, and a removed product frees
 * its photo. Made-up data only.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { createDemoActions } from '../src/features/demo/demo-actions.ts'
import type { ActionDependencies } from '../src/features/demo/demo-actions.ts'
import { demoReducer, seedData } from '../src/features/demo/demo-reducer.ts'
import type { DemoAction } from '../src/features/demo/demo-reducer.ts'
import type { DemoData } from '../src/features/storage/saved-demo.ts'
import type { ProductDraft } from '../src/features/catalogue/products.ts'
import { orderMessage } from '../src/features/order/order-message.ts'
import { SETTINGS } from '../src/content/catalogue.ts'
import { createMemoryStore } from '../../_core/storage/memory-store.ts'

interface Recording {
  data: DemoData
  kept: string[]
  dropped: string[]
  notes: string[]
}

const PHOTO = new Blob(['made-up photo bytes'], { type: 'image/jpeg' })

function draft(overrides: Partial<ProductDraft> = {}): ProductDraft {
  return { name: 'Test biltong', description: 'Made-up', category: 'biltong', pricing: 'weight', priceText: '350', packGrams: 500, ...overrides }
}

function note(list: string[], entry: string): void {
  list.push(entry)
}

function fixedToday(): string {
  return '2030-05-15'
}

function harness(): { deps: ActionDependencies; run: Recording } {
  const run: Recording = { data: seedData(), kept: [], dropped: [], notes: [] }
  const markers = {
    dropAllPhotoUrls: note.bind(null, run.notes, 'photos dropped'),
    showNotice: note.bind(null, run.notes),
    markAdded: note.bind(null, run.notes),
    markReset: note.bind(null, run.notes, 'reset'),
    today: fixedToday,
    signedIn: { email: 'owner@testshop.example', name: 'Owner' },
    teamDomain: 'testshop.example',
  }
  const deps: ActionDependencies = { store: createMemoryStore<DemoData>(), dispatch, latestData: current, keepPhotoUrl: note.bind(null, run.kept), dropPhotoUrl: note.bind(null, run.dropped), ...markers }
  return { deps, run }

  function dispatch(action: DemoAction): void {
    run.data = demoReducer(run.data, action)
  }

  function current(): DemoData {
    return run.data
  }
}

test('a product without a photo is refused before anything is kept', async function refusesWithoutPhoto() {
  const { deps, run } = harness()
  const added = await createDemoActions(deps).addProduct(draft(), null)
  assert.equal(added.ok ? 'OK' : added.code, 'PRODUCT_INVALID')
  assert.deepEqual(run.kept, [])
  assert.deepEqual(run.data, seedData())
})

test('an added product keeps its photo in the store and leads the shop', async function addsProduct() {
  const { deps, run } = harness()
  assert.ok((await createDemoActions(deps).addProduct(draft(), PHOTO)).ok)
  const first = run.data.products[0]
  assert.equal(first?.name.en, 'Test biltong')
  const photoId = first?.photo.kind === 'stored' ? first.photo.photoId : ''
  assert.deepEqual(await deps.store.loadPhoto(photoId), { ok: true, value: PHOTO })
})

test('a new price per kg shows in the WhatsApp message at once', function priceReachesMessage() {
  const { deps, run } = harness()
  assert.ok(createDemoActions(deps).setRate('chilli', '500').ok)
  const message = orderMessage([{ id: 'chilli', grams: 100, option: '', quantity: 1 }], false, 'en', run.data.products, SETTINGS)
  assert.match(message, /1 × 100 g Chilli Bites — R50\.00/)
})

test('an empty pack price becomes "to be confirmed"; words are refused', function packPrices() {
  const { deps, run } = harness()
  const actions = createDemoActions(deps)
  assert.deepEqual(actions.setPackPrice('maize', 5000, ''), { ok: true, value: null })
  assert.equal(run.data.products.at(-1)?.packs?.[1]?.cents, null)
  assert.equal(actions.setPackPrice('maize', 5000, 'cheap').ok, false)
})

test('removing an added product frees its photo', async function removesProduct() {
  const { deps, run } = harness()
  const actions = createDemoActions(deps)
  await actions.addProduct(draft(), PHOTO)
  await actions.removeProduct(run.data.products[0]?.id ?? '')
  assert.equal(run.dropped.length, 1)
  assert.equal(run.data.products.length, seedData().products.length)
})

test('marking out of stock changes only that product', function marksStock() {
  const { deps, run } = harness()
  createDemoActions(deps).setInStock('beef', false)
  assert.equal(run.data.products[0]?.inStock, false)
  assert.equal(run.data.products[1]?.inStock, true)
})
