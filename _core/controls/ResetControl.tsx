/*
 * ResetControl.tsx — "Reset demo", with an in-place check first: the row
 * swaps to "Start again? Reset / Keep" in the same space, so nothing moves
 * and a stray tap never wipes a visitor's changes.
 */
import { useState } from 'react'

export interface ResetWords {
  invite: string
  question: string
  resetDemo: string
  reset: string
  keep: string
}

interface ResetControlProps {
  onReset: () => Promise<void>
  disabled: boolean
  words: ResetWords
}

export function ResetControl({ onReset, disabled, words }: ResetControlProps) {
  const [asking, setAsking] = useState(false)

  function ask(): void {
    setAsking(true)
  }

  function keep(): void {
    setAsking(false)
  }

  async function resetNow(): Promise<void> {
    setAsking(false)
    await onReset()
  }

  function confirmReset(): void {
    void resetNow()
  }

  return (
    <div className="reset-control">
      {asking ? (
        <>
          <p className="reset-question">{words.question}</p>
          <button type="button" className="button button-secondary" onClick={confirmReset} data-resizes-list="">
            {words.reset}
          </button>
          <button type="button" className="button button-secondary" onClick={keep}>
            {words.keep}
          </button>
        </>
      ) : (
        <>
          <p className="reset-question">{words.invite}</p>
          <button type="button" className="button button-secondary reset-button" onClick={ask} disabled={disabled}>
            {words.resetDemo}
          </button>
        </>
      )}
    </div>
  )
}
