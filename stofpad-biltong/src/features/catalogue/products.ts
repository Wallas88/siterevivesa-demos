/*
 * products.ts — Stofpad's products as pure operations: the shape of a
 * product (priced by weight per kg, or by pack), the sizes a visitor can
 * pick, the first selection a card shows, and the owner's admin changes:
 * check a new product, add it, remove one, change a price, mark it out of
 * stock. Tested in tests/products.test.ts.
 */
import { CORE_ERROR_CODES } from '../../../../_core/result/core-errors.ts'
import { succeed, fail } from '../../../../_core/result/result.ts'
import type { Result } from '../../../../_core/result/result.ts'
import { parseRand } from '../../../../_core/prices/rand-input.ts'
import type { ContentPhoto } from '../../../../_core/photos/photo-urls.ts'
import { ERROR_CODES } from '../../../shared/error-codes.ts'
import type { ErrorCode } from '../../../shared/error-codes.ts'

export type Language = 'en' | 'af'
export type Localised = Record<Language, string>

export interface Pack {
  grams: number
  // null: "Price to be confirmed".
  cents: number | null
}

export interface Product {
  id: string
  category: string
  // Cents per kg for products sold by weight; null for products sold by pack.
  pricePerKg: number | null
  name: Localised
  description: Localised
  options: string[]
  photo: ContentPhoto
  packs: Pack[] | null
  inStock: boolean
}

export interface Selection {
  id: string
  grams: number
  option: string
  quantity: number
}

export type Pricing = 'weight' | 'pack'

export interface ProductDraft {
  name: string
  description: string
  category: string
  pricing: Pricing
  // Rand per kg, or the pack's price, as typed.
  priceText: string
  packGrams: number
}

export const MAX_PRODUCTS = 20
export const MAX_NAME_LENGTH = 40
export const MAX_DESCRIPTION_LENGTH = 100
// The pack sizes an owner can pick for a new product sold by pack.
export const PACK_SIZES = [100, 250, 500, 1000, 2000, 5000, 10000]
// The static demo opened pack products on 5 kg and weight products on 250 g.
const FIRST_PACK_GRAMS = 5000
const FIRST_WEIGHT_GRAMS = 250

export function sizesFor(product: Product, weights: number[]): number[] {
  return product.packs == null ? weights : product.packs.map(gramsOf)
}

function gramsOf(pack: Pack): number {
  return pack.grams
}

// 250 g, or 5 kg for a pack product; a pack product without a 5 kg pack opens on its first pack.
export function firstSelection(product: Product): Selection {
  const packs = product.packs?.map(gramsOf) ?? null
  const grams = packs == null ? FIRST_WEIGHT_GRAMS : packs.includes(FIRST_PACK_GRAMS) ? FIRST_PACK_GRAMS : (packs[0] ?? FIRST_PACK_GRAMS)
  return { id: product.id, grams, option: product.options[0] ?? '', quantity: 1 }
}

export function productById(products: Product[], id: string): Product | null {
  return products.find(hasId) ?? null

  function hasId(product: Product): boolean {
    return product.id === id
  }
}

// A cleaned product without its id and photo, or why not: a missing or long name, a bad category or price.
export function checkProductDraft(draft: ProductDraft, categories: string[]): Result<Omit<Product, 'id' | 'photo'>, ErrorCode> {
  const name = draft.name.trim()
  const description = draft.description.trim()
  if (name === '' || name.length > MAX_NAME_LENGTH || description.length > MAX_DESCRIPTION_LENGTH || !categories.includes(draft.category)) return fail(ERROR_CODES.PRODUCT_INVALID)
  const price = parseRand(draft.priceText)
  if (!price.ok || price.value === 0) return fail(CORE_ERROR_CODES.PRICE_INVALID)
  if (draft.pricing === 'pack' && !PACK_SIZES.includes(draft.packGrams)) return fail(ERROR_CODES.PRODUCT_INVALID)
  const byWeight = draft.pricing === 'weight'
  const typed = { en: name, af: name }
  return succeed({
    category: draft.category,
    name: typed,
    description: { en: description, af: description },
    options: [],
    pricePerKg: byWeight ? price.value : null,
    packs: byWeight ? null : [{ grams: draft.packGrams, cents: price.value }],
    inStock: true,
  })
}

// Newest first, so a new product leads the shop's rail.
export function addProduct(products: Product[], product: Product): Result<Product[], ErrorCode> {
  if (products.length >= MAX_PRODUCTS) return fail(ERROR_CODES.PRODUCTS_FULL)
  return succeed([product, ...products])
}

function changeProduct(products: Product[], id: string, change: (product: Product) => Product): Product[] {
  return products.map(changeIfId)

  function changeIfId(product: Product): Product {
    return product.id === id ? change(product) : product
  }
}

export function removeProduct(products: Product[], id: string): Product[] {
  return products.filter(isKept)

  function isKept(product: Product): boolean {
    return product.id !== id
  }
}

export function setRate(products: Product[], id: string, cents: number): Product[] {
  return changeProduct(products, id, withRate)

  function withRate(product: Product): Product {
    return product.pricePerKg == null ? product : { ...product, pricePerKg: cents }
  }
}

// null leaves the pack's price "to be confirmed".
export function setPackPrice(products: Product[], id: string, grams: number, cents: number | null): Product[] {
  return changeProduct(products, id, withPackPrice)

  function withPackPrice(product: Product): Product {
    return product.packs == null ? product : { ...product, packs: product.packs.map(priceIfGrams) }
  }

  function priceIfGrams(pack: Pack): Pack {
    return pack.grams === grams ? { grams, cents } : pack
  }
}

export function setInStock(products: Product[], id: string, inStock: boolean): Product[] {
  return changeProduct(products, id, withStock)

  function withStock(product: Product): Product {
    return { ...product, inStock }
  }
}
