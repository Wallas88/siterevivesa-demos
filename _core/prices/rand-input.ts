/*
 * rand-input.ts — reading a price the owner typed in rand, and writing a
 * price back the way it would be typed. Money is kept in whole cents. How
 * a price is shown on a website is each demo's own choice. Tested in
 * tests/rand-input.test.ts.
 */
import { CORE_ERROR_CODES } from '../result/core-errors.ts'
import type { CoreErrorCode } from '../result/core-errors.ts'
import { succeed, fail } from '../result/result.ts'
import type { Result } from '../result/result.ts'

export const CENTS_PER_RAND = 100
// A price above this is almost surely a typing slip in a small business's price list.
export const MAX_PRICE_RAND = 100_000
// "650", "R650", "R 1 250", "1,250.50" and "1250,5" all read as rand.
const RAND_INPUT = /^r?\s*(\d{1,3}(?:[ ,]\d{3})*|\d+)(?:[.,](\d{1,2}))?$/i

// Typed rand to cents, or PRICE_INVALID when it isn't a plain amount within the limit.
export function parseRand(text: string): Result<number, CoreErrorCode> {
  const match = RAND_INPUT.exec(text.trim())
  if (match == null) return fail(CORE_ERROR_CODES.PRICE_INVALID)
  const rand = Number((match[1] ?? '').replace(/[ ,]/g, ''))
  const cents = Number((match[2] ?? '').padEnd(2, '0'))
  if (rand > MAX_PRICE_RAND) return fail(CORE_ERROR_CODES.PRICE_INVALID)
  return succeed(rand * CENTS_PER_RAND + cents)
}

// The amount as the owner types it back in an editor: 650 or 99.50.
export function randInputText(cents: number): string {
  const rest = cents % CENTS_PER_RAND
  const rand = Math.floor(cents / CENTS_PER_RAND)
  return rest === 0 ? String(rand) : `${rand}.${String(rest).padStart(2, '0')}`
}
