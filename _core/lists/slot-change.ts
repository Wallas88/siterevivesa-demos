/*
 * slot-change.ts — "Nothing hops" for the admin's job list. Rows are fixed
 * slots: moving or removing a job swaps what the slots show, so no button
 * moves under the finger. Only the end of the list grows or shrinks, and
 * this works out which slots ease open or closed there. Pure; tested in
 * tests/slot-change.test.ts.
 */

export interface SlotChange {
  // Slots at this index and after it are new, and ease open.
  openingFrom: number
  // Empty slots kept briefly after the last job, easing closed.
  closing: number
}

export const NO_SLOT_CHANGE: SlotChange = { openingFrom: Number.POSITIVE_INFINITY, closing: 0 }

// With reduced motion nothing eases: no slot opens or closes, the list is simply its new length.
export function slotChange(previousCount: number, currentCount: number, reducedMotion: boolean): SlotChange {
  if (reducedMotion) return NO_SLOT_CHANGE
  if (currentCount > previousCount) return { openingFrom: previousCount, closing: 0 }
  if (currentCount < previousCount) return { openingFrom: Number.POSITIVE_INFINITY, closing: previousCount - currentCount }
  return NO_SLOT_CHANGE
}
