/*
 * order.test.ts — the order rules beyond the message, with made-up
 * products: adding merges the same choice and stops at 99, an
 * out-of-stock product can't be added and drops out of an existing order,
 * a removed product drops out, and quantities stay between 1 and 99.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { addLine, checkLine, linesInShop, MAX_QUANTITY } from '../src/features/order/order.ts'
import { removeLine, setQuantity } from '../src/features/order/order-lines.ts'
import { setInStock } from '../src/features/catalogue/products.ts'
import type { Product, Selection } from '../src/features/catalogue/products.ts'

const WEIGHTS = [100, 250, 500, 1000]

function product(id: string, inStock = true): Product {
  return { id, category: 'snacks', pricePerKg: 40_000, name: { en: id, af: id }, description: { en: '', af: '' }, options: [], photo: { kind: 'seed', src: '/x.svg' }, packs: null, inStock }
}

function line(id: string, quantity = 1): Selection {
  return { id, grams: 250, option: '', quantity }
}

function added(lines: Selection[], selection: Selection, products: Product[]): Selection[] {
  const result = addLine(lines, selection, products, WEIGHTS)
  assert.ok(result.ok)
  return result.value
}

test('adding the same product, size and preparation adds to its line', function mergesLines() {
  const products = [product('a')]
  assert.deepEqual(added(added([], line('a'), products), line('a'), products), [line('a', 2)])
})

test('more than 99 of one choice is refused', function stopsAtLimit() {
  const refused = addLine([line('a', MAX_QUANTITY)], line('a'), [product('a')], WEIGHTS)
  assert.equal(refused.ok ? 'OK' : refused.code, 'ORDER_LIMIT')
})

test('an out-of-stock product cannot be added', function refusesOutOfStock() {
  const refused = addLine([], line('a'), [product('a', false)], WEIGHTS)
  assert.equal(refused.ok ? 'OK' : refused.code, 'OUT_OF_STOCK')
})

test('a size the product does not sell is not a line the shop can take', function refusesBadSize() {
  assert.equal(checkLine({ ...line('a'), grams: 333 }, [product('a')], WEIGHTS).ok, false)
})

test('a line drops out of the order while its product is out of stock, and comes back after', function dropsOutOfStock() {
  const products = [product('a'), product('b')]
  const lines = [line('a'), line('b')]
  const outOfStock = setInStock(products, 'b', false)
  assert.deepEqual(linesInShop(lines, outOfStock, WEIGHTS), [line('a')])
  assert.deepEqual(linesInShop(lines, setInStock(outOfStock, 'b', true), WEIGHTS), lines)
})

test('a line for a removed product drops out of the order', function dropsRemoved() {
  assert.deepEqual(linesInShop([line('gone')], [product('a')], WEIGHTS), [])
})

test('quantities stay whole numbers from 1 to 99; anything else keeps the old one', function keepsQuantity() {
  const lines = [line('a', 3)]
  assert.equal(setQuantity(lines, line('a'), 7)[0]?.quantity, 7)
  assert.equal(setQuantity(lines, line('a'), 0), lines)
  assert.equal(setQuantity(lines, line('a'), 100), lines)
  assert.equal(setQuantity(lines, line('a'), 2.5), lines)
})

test('removing a line keeps the others', function removes() {
  assert.deepEqual(removeLine([line('a'), line('b')], line('a')), [line('b')])
})
