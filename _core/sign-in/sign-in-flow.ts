/*
 * sign-in-flow.ts — the mock of the real admin sign-in (Cloudflare Access:
 * email, a one-time code, no password) as pure steps: make a 6-digit code
 * from a random number, show it grouped, read what the visitor typed, and
 * move between "email" and "code". No network, no email; the code is shown
 * on screen. Tested in tests/sign-in-flow.test.ts.
 */
import { CORE_ERROR_CODES } from '../result/core-errors.ts'
import type { CoreErrorCode } from '../result/core-errors.ts'
import { succeed, fail } from '../result/result.ts'
import type { Result } from '../result/result.ts'

export const CODE_LENGTH = 6
// Every 6-digit code, 000000 to 999999.
export const CODE_RANGE = 10 ** CODE_LENGTH

export type SignInState = { step: 'email' } | { step: 'code'; code: string; wrongTries: number; error: CoreErrorCode | null }

export interface CodeAttempt {
  state: SignInState
  signedIn: boolean
}

export const START: SignInState = { step: 'email' }

// Any whole number becomes a code in range, leading zeros kept ("007341").
export function codeFromNumber(value: number): string {
  const inRange = ((Math.floor(value) % CODE_RANGE) + CODE_RANGE) % CODE_RANGE
  return String(inRange).padStart(CODE_LENGTH, '0')
}

// "482913" shows as "482 913", easier to read and copy.
export function formatCode(code: string): string {
  const half = CODE_LENGTH / 2
  return `${code.slice(0, half)} ${code.slice(half)}`
}

// Spaces and dashes are ignored (a pasted "482 913" works); anything else must be 6 digits.
export function readTypedCode(text: string): Result<string, CoreErrorCode> {
  const digits = text.replace(/[\s-]/g, '')
  return /^\d{6}$/.test(digits) ? succeed(digits) : fail(CORE_ERROR_CODES.CODE_INCOMPLETE)
}

// A new code always starts clean: no error, no wrong tries.
export function codeSent(code: string): SignInState {
  return { step: 'code', code, wrongTries: 0, error: null }
}

export function tryCode(state: SignInState, typed: string): CodeAttempt {
  if (state.step !== 'code') return { state, signedIn: false }
  const read = readTypedCode(typed)
  if (!read.ok) return { state: { ...state, error: read.code }, signedIn: false }
  if (read.value === state.code) return { state: START, signedIn: true }
  return { state: { ...state, wrongTries: state.wrongTries + 1, error: CORE_ERROR_CODES.CODE_WRONG }, signedIn: false }
}
