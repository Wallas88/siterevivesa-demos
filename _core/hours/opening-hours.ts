/*
 * opening-hours.ts — the business's opening hours as pure operations: one
 * row per weekday, open or closed, with opening and closing times. Reading
 * a typed time, changing one day, and how a day shows on the website (in
 * the words the demo passes, so it reads in English or Afrikaans).
 * Tested in tests/opening-hours.test.ts.
 */
import { CORE_ERROR_CODES } from '../result/core-errors.ts'
import type { CoreErrorCode } from '../result/core-errors.ts'
import { succeed, fail } from '../result/result.ts'
import type { Result } from '../result/result.ts'

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export interface DayHours {
  day: Weekday
  open: boolean
  // "HH:MM", 24-hour, as a time field gives it.
  opens: string
  closes: string
}

export const WEEKDAYS: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

// How hours read in one language: day names, "to" and "Closed".
export interface HoursTextWords {
  dayNames: Record<Weekday, string>
  to: string
  closed: string
}

export function isWeekday(text: string): text is Weekday {
  return (WEEKDAYS as string[]).includes(text)
}

const MINUTES_PER_HOUR = 60
const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/

// "07:30" to minutes after midnight, or null when it isn't a 24-hour time.
export function minutesOf(time: string): number | null {
  const match = TIME.exec(time)
  if (match == null) return null
  return Number(match[1]) * MINUTES_PER_HOUR + Number(match[2])
}

export function dayFor(hours: DayHours[], day: Weekday): DayHours | null {
  return hours.find(isDay) ?? null

  function isDay(row: DayHours): boolean {
    return row.day === day
  }
}

function withDay(hours: DayHours[], next: DayHours): DayHours[] {
  return hours.map(replaceDay)

  function replaceDay(row: DayHours): DayHours {
    return row.day === next.day ? next : row
  }
}

// Open or closed; the times are kept, so reopening a day brings them back.
export function setDayOpen(hours: DayHours[], day: Weekday, open: boolean): DayHours[] {
  const row = dayFor(hours, day)
  return row == null ? hours : withDay(hours, { ...row, open })
}

// New times for one day, or HOURS_INVALID unless both are real times and closing comes after opening.
export function setDayTimes(hours: DayHours[], day: Weekday, opens: string, closes: string): Result<DayHours[], CoreErrorCode> {
  const row = dayFor(hours, day)
  const from = minutesOf(opens)
  const to = minutesOf(closes)
  if (row == null || from == null || to == null || to <= from) return fail(CORE_ERROR_CODES.HOURS_INVALID)
  return succeed(withDay(hours, { ...row, opens, closes }))
}

export function hoursText(row: DayHours, words: HoursTextWords): string {
  return row.open ? `${row.opens} ${words.to} ${row.closes}` : words.closed
}

// Exactly one valid row per weekday, in order: what saved hours must look like to be trusted.
export function isFullWeek(hours: DayHours[]): boolean {
  return hours.length === WEEKDAYS.length && hours.every(isInPlace)

  function isInPlace(row: DayHours, index: number): boolean {
    const from = minutesOf(row.opens)
    const to = minutesOf(row.closes)
    return row.day === WEEKDAYS[index] && from != null && to != null && to > from
  }
}
