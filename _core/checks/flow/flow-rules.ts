/*
 * flow-rules.ts — "Nothing hops" (the UX principles) as pure
 * decisions over measured boxes: which controls may not move after a tap,
 * when a card or button jump is allowed (a row opening, a view switch), rows
 * of cards, and whether a change eased or snapped. Tested in
 * tests/flow-check.test.ts; scripts/flow-check.ts measures and asks these.
 */

export interface Viewport {
  width: number
  height: number
}

// A measured element: its screen top and height, named for the report.
export interface Box {
  id: string
  name: string
  y: number
  height: number
}

export interface Snapshot {
  controls: Box[]
  cards: Box[]
  buttons: Box[]
}

export interface TapContext {
  tappedId: string
  tappedTop: number
  tappedHeight: number
  // A <details> row or an aria-expanded toggle: it may push what is below it.
  opensRow: boolean
  // A switch between whole views whose controls sit above them (the Contact form/quiz).
  swapsView: boolean
  // Cards that hold the tapped control: an opening row may grow them.
  cardsHoldingTap: string[]
}

export interface RowCard {
  name: string
  height: number
  gapBelowButton: number | null
}

export type CardRow = RowCard[]

export type SmoothVerdict = 'eases' | 'snaps' | 'unchanged' | 'instant' | 'eases under reduced motion'

// The audit widths, phone first (the coding standard, Waldo 27 Sep 2026).
export const AUDIT_VIEWPORTS: Viewport[] = [
  { width: 360, height: 640 },
  { width: 360, height: 780 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 1900, height: 1000 },
]

// Up to this width the tap-through uses touch; wider, a mouse.
export const TOUCH_MAX_WIDTH = 1024
// Sub-pixel rounding, not movement.
export const MOVE_TOLERANCE_PX = 1
// Share of the change a sample must be inside to count as "in between".
const IN_BETWEEN_MARGIN = 0.05
// A snap jumps straight to the end: no frame shows a value in between. One in-between
// frame is an ease, even on a slow page where few frames land inside 250ms.
const MIN_EASING_FRAMES = 1
const UNCHANGED_LIMIT = 0.5

function byId(boxes: Box[]): Map<string, Box> {
  return new Map(boxes.map(idPair))

  function idPair(item: Box): [string, Box] {
    return [item.id, item]
  }
}

function shift(before: Box, after: Box): { moved: number; resized: number } {
  return { moved: Math.abs(after.y - before.y), resized: Math.abs(after.height - before.height) }
}

// The tapped control and every control above or level with it, on screen before the tap, stay put.
export function controlHops(before: Box[], after: Box[], tap: TapContext, viewportHeight: number): string[] {
  const now = byId(after)
  const findings: string[] = []
  for (const control of before) {
    const onScreen = control.y + control.height > 0 && control.y < viewportHeight
    const aboveOrLevel = control.y <= tap.tappedTop + tap.tappedHeight / 2
    const later = now.get(control.id)
    if (!onScreen || !aboveOrLevel || later == null) continue
    const { moved } = shift(control, later)
    if (moved > MOVE_TOLERANCE_PX) findings.push(`"${control.name}" moved ${Math.round(moved)}px${control.id === tap.tappedId ? ' (the tapped control)' : ''}`)
  }
  return findings
}

// Whether a card or button may move after this tap: below an opening row, or anywhere a view switch reaches.
function mayMove(item: Box, tap: TapContext, isCard: boolean): boolean {
  if (tap.swapsView) return true
  if (!tap.opensRow) return false
  if (isCard && tap.cardsHoldingTap.includes(item.id)) return true
  return item.y > tap.tappedTop
}

function jumpsIn(before: Box[], after: Box[], tap: TapContext, isCard: boolean): string[] {
  const now = byId(after)
  const findings: string[] = []
  for (const item of before) {
    const later = now.get(item.id)
    if (later == null || mayMove(item, tap, isCard)) continue
    const { moved, resized } = shift(item, later)
    if (isCard && resized > MOVE_TOLERANCE_PX) findings.push(`card "${item.name}" height ${Math.round(item.height)}→${Math.round(later.height)}`)
    else if (moved > MOVE_TOLERANCE_PX) findings.push(`${isCard ? 'card' : 'button'} "${item.name}" jumped ${Math.round(moved)}px`)
  }
  return findings
}

// Cards keep their height and cards and buttons their place, unless the tap may move them.
export function cardAndButtonJumps(before: Snapshot, after: Snapshot, tap: TapContext): string[] {
  return [...jumpsIn(before.cards, after.cards, tap, true), ...jumpsIn(before.buttons, after.buttons, tap, false)]
}

function spreadOf(values: number[]): number {
  return values.length === 0 ? 0 : Math.max(...values) - Math.min(...values)
}

// Cards side by side are equal height, with their buttons level.
export function rowProblems(rows: CardRow[]): string[] {
  const findings: string[] = []
  for (const row of rows) {
    const names = row.map(nameOf).join(', ')
    if (spreadOf(row.map(heightOf)) > MOVE_TOLERANCE_PX) findings.push(`unequal heights in a row (${names})`)
    const gaps = row.map(gapOf).filter(isMeasured)
    if (gaps.length > 1 && spreadOf(gaps) > MOVE_TOLERANCE_PX) findings.push(`buttons not level in a row (${names})`)
  }
  return findings

  function nameOf(card: RowCard): string {
    return card.name
  }

  function heightOf(card: RowCard): number {
    return card.height
  }

  function gapOf(card: RowCard): number | null {
    return card.gapBelowButton
  }

  function isMeasured(gap: number | null): gap is number {
    return gap != null
  }
}

// Eased = passed through values between start and end; with reduced motion on, it must be instant.
export function smoothVerdict(start: number, samples: number[], end: number, reducedMotion: boolean): SmoothVerdict {
  if (Math.abs(end - start) < UNCHANGED_LIMIT) return 'unchanged'
  const low = Math.min(start, end)
  const high = Math.max(start, end)
  const margin = (high - low) * IN_BETWEEN_MARGIN
  const between = samples.filter(isBetween).length
  if (reducedMotion) return between === 0 ? 'instant' : 'eases under reduced motion'
  return between >= MIN_EASING_FRAMES ? 'eases' : 'snaps'

  function isBetween(value: number): boolean {
    return value > low + margin && value < high - margin
  }
}
