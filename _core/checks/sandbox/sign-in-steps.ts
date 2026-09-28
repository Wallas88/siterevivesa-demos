/*
 * sign-in-steps.ts — the sandbox steps for the mock sign-in, the same in
 * every demo: the demo email is filled in and read-only, Send code shows a
 * 6-digit code, a new code is fresh, a wrong code is refused in the demo's
 * own words, the right one opens the admin, signed in is kept for the tab
 * only, and Sign out forgets it.
 */
import { setTimeout as wait } from 'node:timers/promises'
import { inPage } from '../browser/page-measurements.ts'
import { codeFromNumber } from '../../sign-in/sign-in-flow.ts'
import { SIGNED_IN_VALUE } from '../../sign-in/sign-in-session.ts'
import { readSignInView, typeAndSendCode, tapButton, adminIsReady } from './sandbox-page.ts'
import type { SignInView } from './sandbox-page.ts'
import { check, evaluateOr, waitFor, PHONE, SETTLE_MS } from './session.ts'
import type { Session } from './session.ts'

export interface SignInCheck {
  adminPath: string
  demoEmail: string
  signedInKey: string
  words: { sendCode: string; sendNewCode: string; signOut: string; codeWrong: string }
}

const SIX_DIGITS = /^\d{6}$/

function signInView(session: Session, setup: SignInCheck): Promise<SignInView | null> {
  return evaluateOr<SignInView | null>(session, inPage(readSignInView, setup.signedInKey), null)
}

// Taps a button, then reads the sign-in after its fade has had time to finish.
async function tapAndRead(session: Session, setup: SignInCheck, words: string): Promise<SignInView | null> {
  await session.browser.evaluate<boolean>(inPage(tapButton, words))
  await wait(SETTLE_MS)
  return signInView(session, setup)
}

async function sendCode(session: Session, setup: SignInCheck, code: string): Promise<SignInView | null> {
  await session.browser.evaluate<boolean>(inPage(typeAndSendCode, code))
  await wait(SETTLE_MS)
  return signInView(session, setup)
}

function readReady(session: Session): Promise<boolean | null> {
  return evaluateOr<boolean | null>(session, inPage(adminIsReady), null)
}

function isTrue(value: boolean): boolean {
  return value
}

export async function checkSignIn(session: Session, setup: SignInCheck): Promise<void> {
  await session.browser.open(`${session.origin}${setup.adminPath}`, PHONE, true)
  const start = await signInView(session, setup)
  check(session, start?.shown === true && start.email === setup.demoEmail && start.emailReadOnly, 'the admin asks to sign in, with the demo email filled in and read-only')
  const first = await tapAndRead(session, setup, setup.words.sendCode)
  check(session, SIX_DIGITS.test(first?.code ?? ''), 'Send code shows a 6-digit code in the demo box')
  const second = await tapAndRead(session, setup, setup.words.sendNewCode)
  check(session, second?.code !== first?.code && SIX_DIGITS.test(second?.code ?? ''), 'Send a new code makes a fresh code')
  const wrong = await sendCode(session, setup, codeFromNumber(Number(second?.code ?? 0) + 1))
  check(session, wrong?.shown === true && wrong.error === setup.words.codeWrong, 'a wrong code is refused in plain words, and the visitor can retry')
  await sendCode(session, setup, second?.code ?? '')
  check(session, (await waitFor(readReady.bind(null, session), isTrue)) === true, 'the right code opens the admin')
  check(session, (await signInView(session, setup))?.keptInTab === SIGNED_IN_VALUE, 'signed in is kept in sessionStorage, for this tab only')
}

export async function checkSignOut(session: Session, setup: SignInCheck): Promise<void> {
  const after = await tapAndRead(session, setup, setup.words.signOut)
  check(session, after?.shown === true && after.keptInTab == null, 'Sign out shows the sign-in again and forgets it')
}
