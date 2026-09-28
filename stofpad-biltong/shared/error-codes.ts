/*
 * error-codes.ts — every error code Stofpad uses, in one list: the shared
 * core's codes plus its own, each with plain words in English and
 * Afrikaans. A code means one thing everywhere; logs carry the code only.
 * Messages stay within 80 characters (tests/error-codes.test.ts). The
 * order limit's words are the static demo's own (i18n.mjs, "limit").
 */
import { CORE_ERROR_CODES, CORE_MESSAGES_AF, CORE_MESSAGES_EN } from '../../_core/result/core-errors.ts'

export const ERROR_CODES = {
  ...CORE_ERROR_CODES,
  PRODUCT_INVALID: 'PRODUCT_INVALID',
  PRODUCTS_FULL: 'PRODUCTS_FULL',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  ORDER_LIMIT: 'ORDER_LIMIT',
  ORDER_LINE_INVALID: 'ORDER_LINE_INVALID',
} as const

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]

export const ERROR_MESSAGES: Record<'en' | 'af', Record<ErrorCode, string>> = {
  en: {
    ...CORE_MESSAGES_EN,
    PRODUCT_INVALID: 'Add a name (up to 40 characters), a photo and a category.',
    PRODUCTS_FULL: 'The demo holds 20 products. Remove one to add another.',
    OUT_OF_STOCK: 'That product is out of stock, so it cannot be ordered now.',
    ORDER_LIMIT: 'You can add up to 99 of the same selection.',
    ORDER_LINE_INVALID: 'That choice is no longer in the shop. Choose again.',
  },
  af: {
    ...CORE_MESSAGES_AF,
    PRODUCT_INVALID: "Gee 'n naam (tot 40 karakters), 'n foto en 'n kategorie.",
    PRODUCTS_FULL: 'Die demo hou 20 produkte. Verwyder een om nog een by te voeg.',
    OUT_OF_STOCK: 'Die produk is uit voorraad en kan nou nie bestel word nie.',
    ORDER_LIMIT: 'Jy kan tot 99 van dieselfde keuse byvoeg.',
    ORDER_LINE_INVALID: 'Dié keuse is nie meer in die winkel nie. Kies weer.',
  },
}
