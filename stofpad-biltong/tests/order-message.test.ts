/*
 * order-message.test.ts — the proof that the order is unchanged: for the
 * baskets captured from the static demo's order.mjs before the
 * conversion (tests/fixtures/order-messages.json), the new code builds the
 * same WhatsApp message and link, character for character, in English and
 * Afrikaans, with the same totals and line prices. It runs with the
 * static demo's own courier charge (R165); the shop now charges R110
 * (Waldo, 28 Sep 2026), checked separately below.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SEED_PRODUCTS, SETTINGS, WEIGHTS } from '../src/content/catalogue.ts'
import { SHOP_WORDS } from '../src/content/i18n.ts'
import { linePrice, money, totals, weight } from '../src/features/order/order.ts'
import type { OrderSettings } from '../src/features/order/order.ts'
import { orderMessage, whatsappLink } from '../src/features/order/order-message.ts'
import { productById } from '../src/features/catalogue/products.ts'
import type { Language, Selection } from '../src/features/catalogue/products.ts'

interface Basket {
  name: string
  courier: boolean
  lines: Selection[]
  totals: { cents: number; pending: boolean }
  output: Record<Language, { message: string; link: string }>
}

interface Fixture {
  baskets: Basket[]
  linePrices: { id: string; grams: number; cents: number | null }[]
  money: [number, string][]
  weight: [number, string][]
}

const FIXTURE: Fixture = JSON.parse(readFileSync('tests/fixtures/order-messages.json', 'utf8'))
const STATIC_DEMO_COURIER_CENTS = 16500
const STATIC_SETTINGS: OrderSettings = { ...SETTINGS, courierCents: STATIC_DEMO_COURIER_CENTS }
const LANGUAGES: Language[] = ['en', 'af']

function checkBasket(basket: Basket): void {
  for (const language of LANGUAGES) {
    const message = orderMessage(basket.lines, basket.courier, language, SEED_PRODUCTS, STATIC_SETTINGS)
    assert.equal(message, basket.output[language].message, `${basket.name} (${language}): message`)
    assert.equal(whatsappLink(message, STATIC_SETTINGS), basket.output[language].link, `${basket.name} (${language}): link`)
  }
  assert.deepEqual(totals(basket.lines, basket.courier, SEED_PRODUCTS, STATIC_SETTINGS), basket.totals, `${basket.name}: totals`)
}

test('every captured basket gives the same message, link and totals in English and Afrikaans', function sameMessages() {
  assert.equal(FIXTURE.baskets.length, 4)
  FIXTURE.baskets.forEach(checkBasket)
})

test('every product at every size is priced as before', function samePrices() {
  for (const expected of FIXTURE.linePrices) {
    const product = productById(SEED_PRODUCTS, expected.id)
    assert.ok(product != null, `${expected.id} is still in the catalogue`)
    const option = product.options[0] ?? ''
    assert.equal(linePrice({ id: expected.id, grams: expected.grams, option, quantity: 1 }, product), expected.cents, `${expected.id} at ${expected.grams} g`)
  }
})

test('money and weight read as before', function sameFormats() {
  for (const [cents, shown] of FIXTURE.money) assert.equal(money(cents), shown)
  for (const [grams, shown] of FIXTURE.weight) assert.equal(weight(grams), shown)
})

test('the shop now charges R110 for the courier, and the label shows that same price', function courierIsR110() {
  assert.equal(SETTINGS.courierCents, 11000)
  assert.equal(SETTINGS.weights, WEIGHTS)
  const courierLine = orderMessage([{ id: 'chilli', grams: 100, option: '', quantity: 1 }], true, 'en', SEED_PRODUCTS, SETTINGS).split('\n')[4]
  assert.equal(courierLine, 'Courier (subject to confirmation) — R110.00')
  assert.doesNotMatch(SHOP_WORDS.en.courier + SHOP_WORDS.af.courier, /R\d/)
})

test('the message still ends with the line naming the demo, and the link goes to SiteReviveSA', function endsAsBefore() {
  const message = orderMessage([], false, 'en', SEED_PRODUCTS, SETTINGS)
  assert.ok(message.endsWith('Sent from the Stofpad Biltong demo on siterevivesa.com.'))
  assert.ok(whatsappLink(message, SETTINGS).startsWith('https://wa.me/27681571817?text='))
})
