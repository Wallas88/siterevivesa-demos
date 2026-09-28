/*
 * saved-demo.ts — the shape of what Stofpad keeps in a visitor's browser
 * (products, opening hours, specials), the check that turns whatever was
 * read back into that shape, and the setup the shared store opens with.
 * Saved data is untrusted, so anything that doesn't fit is dropped rather
 * than shown. The order itself is not saved, as in the static demo. Pure;
 * tested in tests/saved-demo.test.ts.
 */
import type { DayHours } from '../../../../_core/hours/opening-hours.ts'
import type { Special } from '../../../../_core/specials/specials.ts'
import type { Member } from '../../../../_core/team/team.ts'
import type { DemoSetup } from '../../../../_core/demo/load-demo.ts'
import { storedPhotoId } from '../../../../_core/photos/photo-urls.ts'
import { isFields, isText, openSavedEnvelope, readList } from '../../../../_core/storage/saved-envelope.ts'
import { readSavedHours, readSavedPhoto, readSavedSpecials, readSavedTeam } from '../../../../_core/storage/read-saved-content.ts'
import { MAX_PRODUCTS } from '../catalogue/products.ts'
import type { Localised, Pack, Product } from '../catalogue/products.ts'

export interface DemoData {
  products: Product[]
  hours: DayHours[]
  specials: Special[]
  // null until the panel's first setup.
  team: Member[] | null
}

export const SAVED_VERSION = 2
export const DATABASE_NAME = 'stofpad-demo'

function readLocalised(value: unknown): Localised | null {
  return isFields(value) && isText(value.en) && isText(value.af) ? { en: value.en, af: value.af } : null
}

function isCents(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function readPack(value: unknown): Pack | null {
  if (!isFields(value) || !isCents(value.grams) || value.grams === 0) return null
  if (value.cents !== null && !isCents(value.cents)) return null
  return { grams: value.grams, cents: value.cents }
}

function readOptions(value: unknown): string[] | null {
  return Array.isArray(value) && value.every(isText) ? value : null
}

function readPricing(value: Record<string, unknown>): Pick<Product, 'pricePerKg' | 'packs'> | null {
  const packs = value.packs === null ? null : readList(value.packs, readPack)
  if (value.packs !== null && (packs == null || packs.length === 0)) return null
  const rate = value.pricePerKg
  if (packs == null && !isCents(rate)) return null
  return { pricePerKg: isCents(rate) ? rate : null, packs }
}

function readProduct(value: unknown): Product | null {
  if (!isFields(value) || !isText(value.id) || !isText(value.category)) return null
  const name = readLocalised(value.name)
  const description = readLocalised(value.description)
  const options = readOptions(value.options)
  const photo = readSavedPhoto(value.photo)
  const pricing = readPricing(value)
  if (name == null || description == null || options == null || photo == null || pricing == null) return null
  return { id: value.id, category: value.category, name, description, options, photo, ...pricing, inStock: value.inStock !== false }
}

export function readSavedDemo(saved: unknown): DemoData | null {
  const data = openSavedEnvelope(saved, SAVED_VERSION)
  if (data == null) return null
  const products = readList(data.products, readProduct)
  const hours = readSavedHours(data.hours)
  const specials = readSavedSpecials(data.specials)
  const team = readSavedTeam(data.team)
  if (products == null || hours == null || specials == null || team === undefined || products.length > MAX_PRODUCTS) return null
  return { products, hours, specials, team }
}

function photoIdsOf(data: DemoData): string[] {
  const ids: string[] = []
  for (const product of data.products) {
    const id = storedPhotoId(product.photo)
    if (id != null) ids.push(id)
  }
  return ids
}

export const DEMO_SETUP: DemoSetup<DemoData> = { databaseName: DATABASE_NAME, version: SAVED_VERSION, readSaved: readSavedDemo, photoIdsOf }
