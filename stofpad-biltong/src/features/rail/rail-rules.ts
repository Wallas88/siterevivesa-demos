/*
 * rail-rules.ts — the card rails' decisions from the static demo
 * (script.js, enableCardDragging), as pure functions: when a mouse press
 * becomes a drag, where a released drag snaps to, how far one card step
 * is, and whether the rail is at either end. Tested in tests/rail.test.ts.
 */

// A mouse drag starts only after a deliberate move, so a click on a card still works.
export const DRAG_START_PX = 6
// Sub-pixel scroll positions still count as "at the end".
export const END_TOLERANCE_PX = 2

export interface RailEnds {
  atStart: boolean
  atEnd: boolean
}

export function isDeliberateDrag(distance: number): boolean {
  return Math.abs(distance) >= DRAG_START_PX
}

// One card's width plus the gap after it.
export function cardStep(cardWidth: number, gap: number): number {
  return cardWidth + (Number.isNaN(gap) ? 0 : gap)
}

// Released near the end: the end; otherwise the nearest card.
export function snapDestination(scrollLeft: number, step: number, end: number): number {
  if (scrollLeft >= end - END_TOLERANCE_PX) return end
  return step > 0 ? Math.round(scrollLeft / step) * step : scrollLeft
}

export function railEnds(scrollLeft: number, scrollWidth: number, clientWidth: number): RailEnds {
  return { atStart: scrollLeft <= END_TOLERANCE_PX, atEnd: scrollLeft >= scrollWidth - clientWidth - END_TOLERANCE_PX }
}
