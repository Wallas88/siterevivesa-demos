/*
 * sign-in-words.ts — every word the mock sign-in shows, in one shape, so a
 * demo passes them in its visitor's language. The "What's different in
 * your real site" list is part of it: its facts were verified by Waldo
 * (28 Sep 2026) and each demo words them for its own business.
 */
import type { CoreErrorCode } from '../result/core-errors.ts'

export interface Difference {
  here: string
  real: string
}

export interface SignInWords {
  kicker: string
  title: string
  emailLabel: string
  demoEmail: string
  emailNote: string
  sendCode: string
  // "We sent a 6-digit code to …", the email goes after it.
  sentTo: string
  demoCodeNote: string
  codeLabel: string
  signIn: string
  sendNewCode: string
  differencesTitle: string
  differences: Difference[]
  errors: Record<CoreErrorCode, string>
}
