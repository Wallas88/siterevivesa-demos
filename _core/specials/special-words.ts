/*
 * special-words.ts — every word the specials editor shows, so a demo
 * passes them in its visitor's language.
 */
import type { CoreErrorCode } from '../result/core-errors.ts'
import type { EndDateWords } from './specials.ts'

export interface SpecialWords {
  titleLabel: string
  titlePlaceholder: string
  lineLabel: string
  endsLabel: string
  optional: string
  add: string
  remove: string
  showsUntilRemoved: string
  ended: string
  empty: string
  endDate: EndDateWords
  errors: Record<CoreErrorCode, string>
}
