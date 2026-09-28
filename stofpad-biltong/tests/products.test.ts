/*
 * products.test.ts — the product rules with made-up products: the first
 * selection a card shows, the sizes on offer, checking a new product, the
 * product limit, and the owner's price, stock and removal changes.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { addProduct, checkProductDraft, firstSelection, MAX_PRODUCTS, PACK_SIZES, removeProduct, setInStock, setPackPrice, setRate, sizesFor } from '../src/features/catalogue/products.ts'
import type { Product, ProductDraft } from '../src/features/catalogue/products.ts'
import { ERROR_MESSAGES } from '../shared/error-codes.ts'

const CATEGORIES = ['biltong', 'pantry']
const WEIGHTS = [100, 250, 500, 1000]

function byWeight(id: string): Product {
  return { id, category: 'biltong', pricePerKg: 40_000, name: { en: id, af: id }, description: { en: '', af: '' }, options: ['Whole', 'Sliced'], photo: { kind: 'seed', src: '/x.svg' }, packs: null, inStock: true }
}

function byPack(id: string, grams: number[]): Product {
  return { ...byWeight(id), pricePerKg: null, options: [], packs: grams.map(makePack) }

  function makePack(size: number): { grams: number; cents: number | null } {
    return { grams: size, cents: size }
  }
}

function draft(overrides: Partial<ProductDraft> = {}): ProductDraft {
  return { name: 'Test biltong', description: '', category: 'biltong', pricing: 'weight', priceText: '350', packGrams: 500, ...overrides }
}

function codeOf(changes: Partial<ProductDraft>): string {
  const checked = checkProductDraft(draft(changes), CATEGORIES)
  return checked.ok ? 'OK' : checked.code
}

function idOf(product: Product): string {
  return product.id
}

test('a weight product opens on 250 g and its first option', function firstForWeight() {
  assert.deepEqual(firstSelection(byWeight('a')), { id: 'a', grams: 250, option: 'Whole', quantity: 1 })
})

test('a pack product opens on 5 kg, or on its first pack when it has no 5 kg pack', function firstForPacks() {
  assert.equal(firstSelection(byPack('m', [1000, 5000])).grams, 5000)
  assert.equal(firstSelection(byPack('n', [2000, 10000])).grams, 2000)
})

test('weight products offer the weights; pack products offer their packs', function sizes() {
  assert.deepEqual(sizesFor(byWeight('a'), WEIGHTS), WEIGHTS)
  assert.deepEqual(sizesFor(byPack('m', [1000, 5000]), WEIGHTS), [1000, 5000])
})

test('a draft sold by weight becomes a product with a rate per kg, its name in both languages', function checksWeightDraft() {
  const checked = checkProductDraft(draft({ name: ' Garlic ' }), CATEGORIES)
  assert.ok(checked.ok)
  assert.equal(checked.value.pricePerKg, 35_000)
  assert.deepEqual(checked.value.name, { en: 'Garlic', af: 'Garlic' })
  assert.equal(checked.value.packs, null)
})

test('a draft sold by pack becomes one pack at that size and price', function checksPackDraft() {
  const checked = checkProductDraft(draft({ pricing: 'pack', packGrams: 2000, priceText: '99.50' }), CATEGORIES)
  assert.ok(checked.ok)
  assert.deepEqual(checked.value.packs, [{ grams: 2000, cents: 9950 }])
})

test('pack sizes start at 100 g, so a 100 g pack is accepted', function acceptsSmallestPack() {
  assert.equal(PACK_SIZES[0], 100)
  const checked = checkProductDraft(draft({ pricing: 'pack', packGrams: 100, priceText: '45' }), CATEGORIES)
  assert.ok(checked.ok)
  assert.deepEqual(checked.value.packs, [{ grams: 100, cents: 4500 }])
})

test('a missing name, an unknown category, a nought or unreadable price, or an odd pack size is refused', function refusesDrafts() {
  assert.equal(codeOf({ name: '  ' }), 'PRODUCT_INVALID')
  assert.equal(codeOf({ category: 'sweets' }), 'PRODUCT_INVALID')
  assert.equal(codeOf({ priceText: '0' }), 'PRICE_INVALID')
  assert.equal(codeOf({ priceText: 'cheap' }), 'PRICE_INVALID')
  assert.equal(codeOf({ pricing: 'pack', packGrams: 750 }), 'PRODUCT_INVALID')
})

test('a new product goes first; a full shop refuses another, and its words name the limit', function addsWithinLimit() {
  const added = addProduct([byWeight('a')], byWeight('b'))
  assert.deepEqual(added.ok ? added.value.map(idOf) : [], ['b', 'a'])
  const full = Array.from({ length: MAX_PRODUCTS }, makeProduct)
  const refused = addProduct(full, byWeight('extra'))
  assert.equal(refused.ok ? 'OK' : refused.code, 'PRODUCTS_FULL')
  assert.match(ERROR_MESSAGES.en.PRODUCTS_FULL, new RegExp(`\\b${MAX_PRODUCTS}\\b`))
  assert.match(ERROR_MESSAGES.af.PRODUCTS_FULL, new RegExp(`\\b${MAX_PRODUCTS}\\b`))

  function makeProduct(_value: unknown, index: number): Product {
    return byWeight(String(index))
  }
})

test('a rate changes only a weight product; a pack price only its pack; empty means to be confirmed', function changesPrices() {
  const products = [byWeight('w'), byPack('p', [1000, 5000])]
  assert.equal(setRate(products, 'w', 50_000)[0]?.pricePerKg, 50_000)
  assert.equal(setRate(products, 'p', 50_000)[1]?.pricePerKg, null)
  assert.deepEqual(setPackPrice(products, 'p', 5000, null)[1]?.packs, [
    { grams: 1000, cents: 1000 },
    { grams: 5000, cents: null },
  ])
})

test('stock and removal change only the one product', function changesStock() {
  const products = [byWeight('a'), byWeight('b')]
  assert.deepEqual(setInStock(products, 'b', false).map(isInStock), [true, false])
  assert.deepEqual(removeProduct(products, 'a').map(idOf), ['b'])

  function isInStock(product: Product): boolean {
    return product.inStock
  }
})
