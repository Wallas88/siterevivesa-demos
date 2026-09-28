/*
 * use-sign-in.ts — the mock admin sign-in for the views: whether the owner
 * is signed in (kept for this tab only, under the demo's own key), the step
 * shown, and send code, try a code, sign out. Nothing is collected or
 * sent: the email is a fixed demo address and the code is shown on screen.
 */
import { useState } from 'react'
import type { CoreErrorCode } from '../result/core-errors.ts'
import { makeCode } from './make-code.ts'
import { codeSent, tryCode, START } from './sign-in-flow.ts'
import type { SignInState } from './sign-in-flow.ts'
import { keepSignedIn, readSignedIn } from './sign-in-session.ts'

export interface SignIn {
  signedIn: boolean
  state: SignInState
  // Why signing in won't survive a reload, when the browser refuses to keep it.
  notice: CoreErrorCode | null
  sendCode: () => void
  submitCode: (typed: string) => boolean
  signOut: () => void
}

export function useSignIn(sessionKey: string): SignIn {
  const [signedIn, setSignedIn] = useState(readThisSession)
  const [state, setState] = useState<SignInState>(START)
  const [notice, setNotice] = useState<CoreErrorCode | null>(null)
  return { signedIn, state, notice, sendCode, submitCode, signOut }

  function readThisSession(): boolean {
    return readSignedIn(sessionKey)
  }

  function remember(next: boolean): void {
    const kept = keepSignedIn(sessionKey, next)
    setNotice(kept.ok ? null : kept.code)
    setSignedIn(next)
  }

  function sendCode(): void {
    setState(codeSent(makeCode()))
  }

  // True when the code was right, so the form can empty its field.
  function submitCode(typed: string): boolean {
    const attempt = tryCode(state, typed)
    setState(attempt.state)
    if (attempt.signedIn) remember(true)
    return attempt.signedIn
  }

  function signOut(): void {
    setState(START)
    remember(false)
  }
}
