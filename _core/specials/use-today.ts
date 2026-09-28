/*
 * use-today.ts — the one place the demo reads the clock: today's date in
 * the visitor's own calendar, read once when the page opens. Everything
 * else (which specials show, whether an end date has passed) is given it.
 */
import { useState } from 'react'
import { localIsoDate } from './specials.ts'

function readToday(): string {
  return localIsoDate(new Date())
}

export function useToday(): string {
  const [today] = useState(readToday)
  return today
}
