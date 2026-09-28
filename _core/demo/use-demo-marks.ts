/*
 * use-demo-marks.ts — two small markers the views read: which item was
 * just added (the website marks it) and how many resets there have been
 * (editors holding their own text start again after one).
 */
import { useState } from 'react'

export interface DemoMarks {
  lastAddedId: string | null
  resetCount: number
  markAdded: (itemId: string) => void
  markReset: () => void
}

function nextCount(count: number): number {
  return count + 1
}

export function useDemoMarks(): DemoMarks {
  const [lastAddedId, setLastAddedId] = useState<string | null>(null)
  const [resetCount, setResetCount] = useState(0)
  return { lastAddedId, resetCount, markAdded: setLastAddedId, markReset }

  function markReset(): void {
    setResetCount(nextCount)
    setLastAddedId(null)
  }
}
