/*
 * sign-in-session.ts — the one place that keeps "signed in" for this
 * browser tab only (sessionStorage, never IndexedDB): a reload stays
 * signed in, closing the tab signs out. When the browser refuses
 * sessionStorage it falls back to memory and says so with a code.
 */
import { CORE_ERROR_CODES } from '../result/core-errors.ts'
import type { CoreErrorCode } from '../result/core-errors.ts'
import { logIssue } from '../result/log-issue.ts'
import { succeed, fail } from '../result/result.ts'
import type { Result } from '../result/result.ts'

export const SIGNED_IN_VALUE = 'yes'

// Used when sessionStorage is refused: signed in until this page closes. Keyed like the storage, one per demo.
const signedInInMemory = new Map<string, boolean>()

// sessionStorage refused (blocked site data): memory is the fallback.
const NOT_KEPT = null

function tabStorage(): Storage | null {
  try {
    return globalThis.sessionStorage ?? NOT_KEPT
  } catch {
    return NOT_KEPT
  }
}

// Each demo passes its own key, so two demos on one machine never share a sign-in.
export function readSignedIn(key: string): boolean {
  const storage = tabStorage()
  const inMemory = signedInInMemory.get(key) === true
  if (storage == null) return inMemory
  return storage.getItem(key) === SIGNED_IN_VALUE || inMemory
}

export function keepSignedIn(key: string, signedIn: boolean): Result<true, CoreErrorCode> {
  signedInInMemory.set(key, signedIn)
  try {
    const storage = tabStorage()
    if (storage == null) throw new Error('no session storage')
    if (signedIn) storage.setItem(key, SIGNED_IN_VALUE)
    else storage.removeItem(key)
    return succeed(true)
  } catch {
    logIssue(CORE_ERROR_CODES.SIGN_IN_NOT_KEPT)
    return fail(CORE_ERROR_CODES.SIGN_IN_NOT_KEPT)
  }
}
