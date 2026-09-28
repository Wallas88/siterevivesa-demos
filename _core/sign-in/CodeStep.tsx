/*
 * CodeStep.tsx — the code step of the mock sign-in: the demo box showing
 * the code (no email is sent), a 6-digit field with the phone's number pad,
 * a plain-words error in space kept for it, and "Send a new code".
 */
import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { CODE_LENGTH, formatCode } from './sign-in-flow.ts'
import type { SignIn } from './use-sign-in.ts'
import type { SignInWords } from './sign-in-words.ts'

interface CodeStepProps {
  signIn: SignIn
  active: boolean
  words: SignInWords
}

// Room for "482 913" typed with its space.
const CODE_FIELD_LENGTH = CODE_LENGTH + 1

export function CodeStep({ signIn, active, words }: CodeStepProps) {
  const [typed, setTyped] = useState('')
  const field = useRef<HTMLInputElement>(null)
  const code = signIn.state.step === 'code' ? signIn.state.code : ''
  const error = signIn.state.step === 'code' ? signIn.state.error : null
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-runs for each new code ("Send a new code"), which is why code is listed though the body doesn't read it
  useEffect(focusWhenShown, [active, code])

  // Each new code starts with an empty field, focused without scrolling the page.
  function focusWhenShown(): void {
    if (!active) return
    setTyped('')
    field.current?.focus({ preventScroll: true })
  }

  function changeCode(event: ChangeEvent<HTMLInputElement>): void {
    setTyped(event.target.value)
  }

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (signIn.submitCode(typed)) setTyped('')
  }

  return (
    <form className="code-step" onSubmit={submit}>
      <p className="sign-in-sent">
        {words.sentTo} {words.demoEmail}.
      </p>
      <p className="demo-code-box">
        {words.demoCodeNote} <strong className="demo-code">{code === '' ? '' : formatCode(code)}</strong>
      </p>
      <label className="field">
        <span className="field-label">{words.codeLabel}</span>
        <input
          ref={field}
          className="field-input code-input"
          name="code"
          value={typed}
          onChange={changeCode}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={CODE_FIELD_LENGTH}
          aria-invalid={error != null}
          aria-describedby="code-error"
        />
      </label>
      <p className="code-error" id="code-error" role="alert">
        {error == null ? '' : words.errors[error]}
      </p>
      <div className="code-step-buttons">
        <button type="submit" className="button button-primary">
          {words.signIn}
        </button>
        <button type="button" className="button button-secondary" onClick={signIn.sendCode}>
          {words.sendNewCode}
        </button>
      </div>
    </form>
  )
}
