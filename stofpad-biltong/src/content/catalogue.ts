/*
 * catalogue.ts — Stofpad's seed catalogue, typed and unchanged from the
 * static demo (catalogue.mjs, 21 Sep 2026): the WhatsApp number (Waldo's
 * one exception: SiteReviveSA's own number, 21 Sep 2026), the courier
 * charge (R110, label and charge alike: Waldo, 28 Sep 2026; the static
 * demo said R175 but charged R165), the weights, the categories and the
 * products. Demo prices are
 * illustrative; money is in cents, weights in grams. What Reset brings back.
 */
import type { Localised, Product } from '../features/catalogue/products.ts'
import type { OrderSettings } from '../features/order/order.ts'

export const WEIGHTS = [100, 250, 500, 1000]
export const SETTINGS: OrderSettings = { whatsapp: '27681571817', courierCents: 11000, weights: WEIGHTS }

export const SEED_SPECIAL_NAMES: Localised[] = [
  { en: 'Biltong favourite', af: 'Biltonggunsteling' },
  { en: 'Weekend sharing pack', af: 'Naweek-deelpak' },
  { en: 'Snack-time special', af: 'Peuseltyd-aanbod' },
]

export const CATEGORIES = {
  all: { en: 'All products', af: 'Alle produkte' },
  biltong: { en: 'Biltong', af: 'Biltong' },
  snacks: { en: 'Biltong snacks', af: 'Biltonghappies' },
  sausage: { en: 'Dried sausage', af: 'Droëwors & cabanossi' },
  pantry: { en: 'Braai & pantry', af: 'Braai & spens' },
} as const

export type CategoryFilter = keyof typeof CATEGORIES
export type Category = Exclude<CategoryFilter, 'all'>

export const PRODUCT_CATEGORIES: Category[] = ['biltong', 'snacks', 'sausage', 'pantry']

// Saved data and owner input are text; this says whether a text is one of the shop's categories.
export function isCategory(text: string): text is Category {
  return (PRODUCT_CATEGORIES as string[]).includes(text)
}

// The static demo's product() helper, kept so each line reads as it did.
function product(id: string, category: Category, pricePerKg: number | null, en: string, af: string, descriptionEn: string, descriptionAf: string, options: string[] = []): Product {
  return { id, category, pricePerKg, name: { en, af }, description: { en: descriptionEn, af: descriptionAf }, options, photo: { kind: 'seed', src: `/images/${id}.svg` }, packs: null, inStock: true }
}

export const SEED_PRODUCTS: Product[] = [
  product('beef', 'biltong', 41900, 'Beef Biltong', 'Beesbiltong', 'Beef biltong, prepared your way.', 'Lekker beesbiltong, soos jy daarvan hou.', ['Heel', 'Gekerf', 'Ge-vacuum']),
  product('salt-pepper', 'biltong', 41900, 'Salt & Pepper Biltong', 'Sout-en-peperbiltong', 'Seasoned with salt and pepper only.', 'Met net sout en peper gegeur.'),
  product('chilli', 'snacks', 41900, 'Chilli Bites', 'Chilli Bites', 'Chilli bites with a mild kick.', 'Chilli bites wat nie te warm is nie.'),
  product('bites', 'snacks', 41900, 'Biltong Bites', 'Biltong Bites', 'Bite-sized pieces of biltong.', 'Biltong in happiegrootte stukkies.'),
  product('blare', 'snacks', 41900, 'Biltong Blare', 'Biltong Blare', 'Thin, broad pieces of biltong.', 'Dun, breë stukke biltong.'),
  product('wheels', 'snacks', 41900, 'BBQ Biltong Wheels', 'BBQ Biltong Wiele', 'BBQ-seasoned biltong wheels.', 'BBQ-gegeurde biltongwiele.'),
  product('bacon', 'snacks', 41900, 'Bacon Bites', 'Bacon Bites', 'Bacon strips in bite-sized pieces.', 'Spekrepies in happiegrootte stukkies.'),
  product('droewors', 'sausage', 41900, 'Droëwors', 'Droëwors', 'Traditional dried sausage, thin or thick.', 'Lekker dun of dik droëwors.', ['Dun', 'Dik']),
  product('cabanossi', 'sausage', 41900, 'Cherry Cabanossi', 'Cherry Cabanossi', 'Cherry cabanossi sticks.', 'Cherry cabanossi-stokkies.'),
  product('tails', 'pantry', 18900, 'Sheep Tails', 'Skaapstertjies', 'Better known as Karoo Prawns.', 'Beter bekend as Karoo Prawns.'),
  {
    ...product('maize', 'pantry', null, 'Coarse White Maize Meal', 'Growwe Wit Meel', 'Choose your Braaipap pack size.', 'Kies jou Braaipap-pakgrootte.'),
    packs: [
      { grams: 1000, cents: null },
      { grams: 5000, cents: 4200 },
      { grams: 10000, cents: 8400 },
      { grams: 12500, cents: 10300 },
      { grams: 25000, cents: 18900 },
    ],
  },
]
