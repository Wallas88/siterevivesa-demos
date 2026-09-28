/*
 * use-toast.ts — the short message after "Add to order" ("Added to your
 * order." or why not), cleared after 3.5 seconds as in the static demo,
 * and at once when the language changes.
 */
import { useEffect, useRef, useState } from 'react'

export const TOAST_MS = 3500

export interface Toast {
  message: string
  show: (message: string) => void
  clear: () => void
}

export function useToast(): Toast {
  const [message, setMessage] = useState('')
  const timer = useRef<number | undefined>(undefined)
  useEffect(clearTimerOnUnmount, [])
  return { message, show, clear }

  function clear(): void {
    window.clearTimeout(timer.current)
    setMessage('')
  }

  function show(next: string): void {
    window.clearTimeout(timer.current)
    setMessage(next)
    timer.current = window.setTimeout(clear, TOAST_MS)
  }

  function clearTimerOnUnmount(): () => void {
    return stopTimer

    function stopTimer(): void {
      window.clearTimeout(timer.current)
    }
  }
}
