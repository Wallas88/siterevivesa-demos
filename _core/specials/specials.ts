/*
 * specials.ts — the business's specials and events as pure operations:
 * check a new one, add it, remove one, and which ones the website shows on
 * a given day (one past its end date is hidden). Today's date is always
 * passed in, never read here. Dates are "YYYY-MM-DD", which compare
 * correctly as text. Tested in tests/specials.test.ts.
 */
import { CORE_ERROR_CODES } from '../result/core-errors.ts'
import type { CoreErrorCode } from '../result/core-errors.ts'
import { succeed, fail } from '../result/result.ts'
import type { Result } from '../result/result.ts'

export interface SpecialText {
  title: string
  line: string
}

export interface Special extends SpecialText {
  id: string
  // The last day it shows, or null to show until removed.
  endsOn: string | null
  // Words in other languages, for specials that ship with a bilingual demo; an owner's own special shows as typed.
  translations?: Partial<Record<string, SpecialText>>
}

// How an end date reads in one language: "Until 1 Oct 2030", "Tot 1 Okt 2030".
export interface EndDateWords {
  until: string
  months: string[]
}

export interface SpecialDraft {
  title: string
  line: string
  // Empty when there is no end date, as a date field gives it.
  endsOn: string
}

export const MAX_SPECIALS = 6
export const MAX_SPECIAL_TITLE_LENGTH = 50
export const MAX_SPECIAL_LINE_LENGTH = 100
const ISO_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

export function isIsoDate(text: string): boolean {
  return ISO_DATE.test(text)
}

// Shown on the website up to and including its end date.
export function isShowing(special: Special, today: string): boolean {
  return special.endsOn == null || special.endsOn >= today
}

export function specialsForSite(specials: Special[], today: string): Special[] {
  return specials.filter(showsToday)

  function showsToday(special: Special): boolean {
    return isShowing(special, today)
  }
}

// A cleaned draft, or why not: a missing or long title, a long line, a bad date, or a date already past.
export function checkSpecialDraft(draft: SpecialDraft, today: string): Result<Omit<Special, 'id'>, CoreErrorCode> {
  const title = draft.title.trim()
  const line = draft.line.trim()
  const endsOn = draft.endsOn.trim() === '' ? null : draft.endsOn.trim()
  if (title === '' || title.length > MAX_SPECIAL_TITLE_LENGTH || line.length > MAX_SPECIAL_LINE_LENGTH) return fail(CORE_ERROR_CODES.SPECIAL_INVALID)
  if (endsOn != null && !isIsoDate(endsOn)) return fail(CORE_ERROR_CODES.SPECIAL_INVALID)
  if (endsOn != null && endsOn < today) return fail(CORE_ERROR_CODES.SPECIAL_ENDED)
  return succeed({ title, line, endsOn })
}

// Newest first, like jobs.
export function addSpecial(specials: Special[], special: Special): Result<Special[], CoreErrorCode> {
  if (specials.length >= MAX_SPECIALS) return fail(CORE_ERROR_CODES.SPECIALS_FULL)
  return succeed([special, ...specials])
}

export function removeSpecial(specials: Special[], id: string): Special[] {
  return specials.filter(isKept)

  function isKept(special: Special): boolean {
    return special.id !== id
  }
}

// "2026-10-31" shows as "Until 31 Oct 2026" (in the words given); no end date shows nothing.
export function endText(endsOn: string | null, words: EndDateWords): string {
  if (endsOn == null || !isIsoDate(endsOn)) return ''
  const [year, month, day] = endsOn.split('-')
  return `${words.until} ${Number(day)} ${words.months[Number(month) - 1] ?? ''} ${year}`
}

// The title and line in the visitor's language when the special has them, otherwise as the owner typed them.
export function specialText(special: Special, language: string): SpecialText {
  return special.translations?.[language] ?? { title: special.title, line: special.line }
}

// A date as the visitor's own calendar shows it, "YYYY-MM-DD". The caller passes the Date: no clock is read here.
export function localIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}
