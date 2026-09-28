/*
 * use-day-hours.ts — one day in the hours editor: the owner changes a time
 * freely, good times go to the website at once, and a closing time before
 * the opening time shows a plain-words hint (in space kept for it) while
 * the website keeps the last good hours.
 */
import { useState } from 'react'
import type { Result } from '../result/result.ts'
import type { CoreErrorCode } from '../result/core-errors.ts'
import type { DayHours, Weekday } from './opening-hours.ts'

export interface HoursEditing {
  setDayOpen: (day: Weekday, open: boolean) => void
  setDayTimes: (day: Weekday, opens: string, closes: string) => Result<true, CoreErrorCode>
}

export interface DayHoursField {
  opens: string
  closes: string
  hint: CoreErrorCode | null
  changeOpens: (value: string) => void
  changeCloses: (value: string) => void
  toggleOpen: () => void
}

export function useDayHours(row: DayHours, editing: HoursEditing): DayHoursField {
  const [opens, setOpens] = useState(row.opens)
  const [closes, setCloses] = useState(row.closes)
  const [hint, setHint] = useState<CoreErrorCode | null>(null)
  return { opens, closes, hint, changeOpens, changeCloses, toggleOpen }

  function tryTimes(nextOpens: string, nextCloses: string): void {
    const set = editing.setDayTimes(row.day, nextOpens, nextCloses)
    setHint(set.ok ? null : set.code)
  }

  function changeOpens(value: string): void {
    setOpens(value)
    tryTimes(value, closes)
  }

  function changeCloses(value: string): void {
    setCloses(value)
    tryTimes(opens, value)
  }

  function toggleOpen(): void {
    editing.setDayOpen(row.day, !row.open)
  }
}
