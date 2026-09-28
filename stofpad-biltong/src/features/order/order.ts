/*
 * order.ts — the order and its WhatsApp message, ported from the static
 * demo's order.mjs (21 Sep 2026) without changing a character of what it
 * produces (tests/order-message.test.ts compares with the old outputs).
 * The one difference: the products are passed in, because the owner can
 * now change them in the admin. Pure; nothing here throws.
 */
import { succeed, fail } from '../../../../_core/result/result.ts'
import type { Result } from '../../../../_core/result/result.ts'
import { ERROR_CODES } from '../../../shared/error-codes.ts'
import type { ErrorCode } from '../../../shared/error-codes.ts'
import { productById } from '../catalogue/products.ts'
import type { Product, Selection } from '../catalogue/products.ts'

export interface OrderSettings {
  whatsapp: string
  courierCents: number
  weights: number[]
}

export interface OrderTotals {
  cents: number
  pending: boolean
}

export const MAX_QUANTITY = 99
const CENTS_PER_RAND = 100
const GRAMS_PER_KG = 1000

export function money(cents: number): string {
  return `R${(cents / CENTS_PER_RAND).toFixed(2)}`
}

export function weight(grams: number): string {
  return grams >= GRAMS_PER_KG ? `${grams / GRAMS_PER_KG} kg` : `${grams} g`
}

function hasSize(product: Product, grams: number, weights: number[]): boolean {
  return product.packs == null ? weights.includes(grams) : product.packs.some(isSize)

  function isSize(pack: { grams: number }): boolean {
    return pack.grams === grams
  }
}

// The product a line is for, when the line is one the shop could take; the static demo threw here instead.
export function checkLine(line: Selection, products: Product[], weights: number[]): Result<Product, ErrorCode> {
  const product = productById(products, line.id)
  if (product == null || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > MAX_QUANTITY) return fail(ERROR_CODES.ORDER_LINE_INVALID)
  if (!hasSize(product, line.grams, weights)) return fail(ERROR_CODES.ORDER_LINE_INVALID)
  const optionFits = product.options.length > 0 ? product.options.includes(line.option) : line.option === ''
  return optionFits ? succeed(product) : fail(ERROR_CODES.ORDER_LINE_INVALID)
}

// A line's price in cents, or null while its price is "to be confirmed".
export function linePrice(line: Selection, product: Product): number | null {
  const pack = product.packs?.find(isLineSize)
  const cents = product.packs != null ? (pack?.cents ?? null) : Math.round(((product.pricePerKg ?? 0) * line.grams) / GRAMS_PER_KG)
  return cents === null ? null : cents * line.quantity

  function isLineSize(candidate: { grams: number }): boolean {
    return candidate.grams === line.grams
  }
}

function lineKey(line: Selection): string {
  return JSON.stringify([line.id, line.grams, line.option])
}

// The same product, size and preparation adds to its line; more than 99 of one selection is refused.
export function addLine(lines: Selection[], selection: Selection, products: Product[], weights: number[]): Result<Selection[], ErrorCode> {
  const checked = checkLine(selection, products, weights)
  if (!checked.ok) return checked
  if (!checked.value.inStock) return fail(ERROR_CODES.OUT_OF_STOCK)
  const key = lineKey(selection)
  const existing = lines.find(hasKey)
  if (existing == null) return succeed([...lines, { ...selection }])
  if (existing.quantity + selection.quantity > MAX_QUANTITY) return fail(ERROR_CODES.ORDER_LIMIT)
  return succeed(lines.map(addToExisting))

  function hasKey(line: Selection): boolean {
    return lineKey(line) === key
  }

  function addToExisting(line: Selection): Selection {
    return line === existing ? { ...line, quantity: line.quantity + selection.quantity } : line
  }
}

// The lines the shop can take right now: their product is still there, sound and in stock.
export function linesInShop(lines: Selection[], products: Product[], weights: number[]): Selection[] {
  return lines.filter(isInShop)

  function isInShop(line: Selection): boolean {
    const checked = checkLine(line, products, weights)
    return checked.ok && checked.value.inStock
  }
}

function priceOf(line: Selection, products: Product[]): number | null {
  const product = productById(products, line.id)
  return product == null ? null : linePrice(line, product)
}

export function totals(lines: Selection[], courier: boolean, products: Product[], settings: OrderSettings): OrderTotals {
  const prices = lines.map(priceFor)
  const courierCents = courier && lines.length > 0 ? settings.courierCents : 0
  return { cents: prices.reduce(addKnown, 0) + courierCents, pending: prices.includes(null) }

  function priceFor(line: Selection): number | null {
    return priceOf(line, products)
  }

  function addKnown(sum: number, price: number | null): number {
    return sum + (price ?? 0)
  }
}
