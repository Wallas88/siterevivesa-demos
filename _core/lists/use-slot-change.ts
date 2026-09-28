/*
 * use-slot-change.ts — remembers a slot list's length and, for one ease
 * (250ms), which slots at its end open or close (slot-change.ts decides).
 * Then it settles back to no change, so a later render doesn't replay it.
 */
import { useEffect, useRef, useState } from 'react'
import { slotChange, NO_SLOT_CHANGE } from './slot-change.ts'
import type { SlotChange } from './slot-change.ts'

// Matches --ease-duration in styles/tokens.css: long enough for the CSS ease to finish.
export const SLOT_EASE_MS = 250

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useSlotChange(count: number): SlotChange {
  const previous = useRef(count)
  const [change, setChange] = useState<SlotChange>(NO_SLOT_CHANGE)
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs when the list length changes; settle only calls a state setter, which never changes
  useEffect(noteChange, [count])
  return change

  function noteChange(): (() => void) | undefined {
    if (previous.current === count) return undefined
    setChange(slotChange(previous.current, count, prefersReducedMotion()))
    previous.current = count
    const timer = window.setTimeout(settle, SLOT_EASE_MS)
    return cancel

    function cancel(): void {
      window.clearTimeout(timer)
    }
  }

  function settle(): void {
    setChange(NO_SLOT_CHANGE)
  }
}
