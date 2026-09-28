/*
 * session.ts — one sandbox-check run: the browser, the page's origin, a
 * real image file to pick, and the steps that failed. check() prints a
 * step and records a failure; waitFor() reads the page until something
 * holds or about five seconds pass.
 */
import { setTimeout as wait } from 'node:timers/promises'
import type { BrowserPage } from '../browser/chrome.ts'

export interface Session {
  browser: BrowserPage
  origin: string
  photoPath: string
  failures: string[]
}

export const PHONE = { width: 360, height: 780 }
// Longer than the demos' 250ms eases.
export const SETTLE_MS = 400
const POLL_MS = 100
const POLL_ATTEMPTS = 50

export function check(session: Session, passed: boolean, label: string): void {
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${label}`)
  if (!passed) session.failures.push(label)
}

// Reads with read() until holds() is true, then returns that reading; after the last try, the last reading.
export async function waitFor<T>(read: () => Promise<T | null>, holds: (value: T) => boolean): Promise<T | null> {
  for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
    const value = await read()
    if (value != null && holds(value)) return value
    await wait(POLL_MS)
  }
  return read()
}

export async function evaluateOr<T>(session: Session, expression: string, fallback: T): Promise<T> {
  const result = await session.browser.evaluate<T>(expression)
  return result.ok ? result.value : fallback
}
