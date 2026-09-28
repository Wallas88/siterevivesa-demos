/*
 * seed.ts — what every visitor starts with, and what "Reset demo" brings
 * back: the static demo's products and three sample specials (bilingual,
 * no end date, so the seed never expires on its own), and example opening
 * hours for a roadside shop.
 */
import type { DayHours } from '../../../_core/hours/opening-hours.ts'
import type { Special } from '../../../_core/specials/specials.ts'
import type { Localised } from '../features/catalogue/products.ts'
import { SEED_PRODUCTS, SEED_SPECIAL_NAMES } from './catalogue.ts'

export { SEED_PRODUCTS }

function seedSpecial(name: Localised, index: number): Special {
  return { id: `seed-special-${index}`, title: name.en, line: '', endsOn: null, translations: { af: { title: name.af, line: '' } } }
}

export const SEED_SPECIALS: Special[] = SEED_SPECIAL_NAMES.map(seedSpecial)

// Example hours only; the site says so beside them.
export const SEED_HOURS: DayHours[] = [
  { day: 'mon', open: true, opens: '08:00', closes: '17:00' },
  { day: 'tue', open: true, opens: '08:00', closes: '17:00' },
  { day: 'wed', open: true, opens: '08:00', closes: '17:00' },
  { day: 'thu', open: true, opens: '08:00', closes: '17:00' },
  { day: 'fri', open: true, opens: '08:00', closes: '17:00' },
  { day: 'sat', open: true, opens: '08:00', closes: '14:00' },
  { day: 'sun', open: false, opens: '09:00', closes: '13:00' },
]
