/*
 * hours-words.ts — every word the opening-hours editor and list show, so a
 * demo passes them in its visitor's language.
 */
import type { CoreErrorCode } from '../result/core-errors.ts'
import type { HoursTextWords } from './opening-hours.ts'

export interface HoursWords extends HoursTextWords {
  lead: string
  open: string
  opens: string
  closes: string
  errors: Record<CoreErrorCode, string>
}
