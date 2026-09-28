/*
 * admin-words.ts — the words of Stofpad's own admin sections (adding and
 * editing products), in English and Afrikaans.
 */
import type { Language } from '../features/catalogue/products.ts'

export interface AdminWords {
  addTitle: string
  listTitle: string
  specialsTitle: string
  hoursTitle: string
  teamTitle: string
  name: string
  namePlaceholder: string
  description: string
  category: string
  soldBy: string
  byWeight: string
  byPack: string
  pricePerKg: string
  packSize: string
  packPrice: string
  add: string
  adding: string
  added: string
  inStock: string
  outOfStock: string
  remove: string
  pending: string
  empty: string
}

export const ADMIN_WORDS_BY_LANGUAGE: Record<Language, AdminWords> = {
  en: {
    addTitle: 'Add a product',
    listTitle: 'Your products in the shop',
    specialsTitle: 'Specials and events',
    hoursTitle: 'Opening hours',
    teamTitle: 'People who can sign in',
    name: 'Name',
    namePlaceholder: 'Garlic Biltong',
    description: 'One line (optional)',
    category: 'Category',
    soldBy: 'Sold by',
    byWeight: 'Weight',
    byPack: 'Pack',
    pricePerKg: 'Price per kg (R)',
    packSize: 'Pack size',
    packPrice: 'Pack price (R)',
    add: 'Add to shop',
    adding: 'Adding…',
    added: 'Added. See it in the shop',
    inStock: 'In stock',
    outOfStock: 'Out of stock',
    remove: 'Remove',
    pending: 'To be confirmed',
    empty: 'No products yet. Add one above and it shows in the shop.',
  },
  af: {
    addTitle: "Voeg 'n produk by",
    listTitle: 'Jou produkte in die winkel',
    specialsTitle: 'Aanbiedinge en geleenthede',
    hoursTitle: 'Oop-ure',
    teamTitle: 'Mense wat kan aanmeld',
    name: 'Naam',
    namePlaceholder: 'Knoffelbiltong',
    description: 'Een reël (opsioneel)',
    category: 'Kategorie',
    soldBy: 'Verkoop per',
    byWeight: 'Gewig',
    byPack: 'Pak',
    pricePerKg: 'Prys per kg (R)',
    packSize: 'Pakgrootte',
    packPrice: 'Pakprys (R)',
    add: 'Voeg by winkel',
    adding: 'Voeg by…',
    added: 'Bygevoeg. Sien dit in die winkel',
    inStock: 'In voorraad',
    outOfStock: 'Uit voorraad',
    remove: 'Verwyder',
    pending: 'Moet bevestig word',
    empty: 'Nog geen produkte nie. Voeg een hierbo by en dit wys in die winkel.',
  },
}
