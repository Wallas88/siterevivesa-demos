/*
 * price-list.ts — the owner's example price list as pure operations:
 * change one price, rename one item, and show an amount in rand the way
 * this site does (R1 250). Reading typed rand is shared
 * (_core/prices/rand-input.ts). Money is kept in whole cents. Tested in
 * tests/price-list.test.ts.
 */
import { CENTS_PER_RAND } from '../../../../_core/prices/rand-input.ts'

export interface PriceItem {
  id: string
  label: string
  cents: number
}

export const MAX_LABEL_LENGTH = 40

// Whole rand without decimals, cents only when there are some: R650, R1 250, R99.50.
export function formatRand(cents: number): string {
  const rand = Math.floor(cents / CENTS_PER_RAND)
  const rest = cents % CENTS_PER_RAND
  const grouped = String(rand).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return rest === 0 ? `R${grouped}` : `R${grouped}.${String(rest).padStart(2, '0')}`
}

export function setPrice(items: PriceItem[], id: string, cents: number): PriceItem[] {
  return items.map(withPrice)

  function withPrice(item: PriceItem): PriceItem {
    return item.id === id ? { ...item, cents } : item
  }
}

// An empty label keeps the old one: a price with no name makes no sense on the site.
export function renameItem(items: PriceItem[], id: string, label: string): PriceItem[] {
  const cleaned = label.trim().slice(0, MAX_LABEL_LENGTH)
  if (cleaned === '') return items
  return items.map(withLabel)

  function withLabel(item: PriceItem): PriceItem {
    return item.id === id ? { ...item, label: cleaned } : item
  }
}

export function priceFor(items: PriceItem[], id: string): PriceItem | null {
  return items.find(hasId) ?? null

  function hasId(item: PriceItem): boolean {
    return item.id === id
  }
}
