/*
 * flow-check.test.ts — the "Nothing hops" rules the flow-check enforces
 * (the UX principles), with made-up boxes: what may move after a
 * tap, what may not, rows of cards, and whether a change eased or snapped.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { controlHops, cardAndButtonJumps, rowProblems, smoothVerdict, AUDIT_VIEWPORTS } from '../checks/flow/flow-rules.ts'
import type { Box, Snapshot, TapContext, CardRow } from '../checks/flow/flow-rules.ts'

function box(id: string, y: number, height = 40): Box {
  return { id, name: id, y, height }
}

function tapAt(y: number, overrides: Partial<TapContext> = {}): TapContext {
  return { tappedId: 'tapped', tappedTop: y, tappedHeight: 40, opensRow: false, swapsView: false, cardsHoldingTap: [], ...overrides }
}

function snapshot(controls: Box[], cards: Box[] = [], buttons: Box[] = []): Snapshot {
  return { controls, cards, buttons }
}

function sizeOf(viewport: { width: number; height: number }): string {
  return `${viewport.width}x${viewport.height}`
}

test('the audit widths are 360 first, then 768, 1024, 1440 and 1900', function auditWidths() {
  assert.deepEqual(AUDIT_VIEWPORTS.map(sizeOf), ['360x640', '360x780', '768x1024', '1024x768', '1440x900', '1900x1000'])
})

test('a tapped control that stays put, with its neighbours, is no hop', function stillIsFine() {
  const before = [box('tapped', 300), box('above', 100)]
  assert.deepEqual(controlHops(before, before, tapAt(300), 800), [])
})

test('the tapped control moving is a hop', function tappedMoves() {
  const findings = controlHops([box('tapped', 300)], [box('tapped', 325)], tapAt(300), 800)
  assert.equal(findings.length, 1)
  assert.match(findings[0] ?? '', /tapped.*25px/)
})

test('a control above the tapped one moving is a hop; one below is judged by the card rules instead', function aboveCounts() {
  const before = [box('tapped', 300), box('above', 100), box('below', 600)]
  const after = [box('tapped', 300), box('above', 110), box('below', 700)]
  const findings = controlHops(before, after, tapAt(300), 800)
  assert.equal(findings.length, 1)
  assert.match(findings[0] ?? '', /above/)
})

test('a sub-pixel shift is rounding, not a hop', function subPixelIgnored() {
  assert.deepEqual(controlHops([box('tapped', 300)], [box('tapped', 300.6)], tapAt(300), 800), [])
})

test('a card that grows or a card button that jumps after an ordinary tap is a jump', function ordinaryTapJumps() {
  const before = snapshot([], [box('card', 500, 400)], [box('quote', 860)])
  const after = snapshot([], [box('card', 500, 375)], [box('quote', 835)])
  assert.equal(cardAndButtonJumps(before, after, tapAt(300)).length, 2)
})

test('an opening row may push what is below it and grow the card holding it, but nothing above', function rowsPushBelow() {
  const before = snapshot([], [box('panel', 200, 400), box('above-card', 50, 100)], [box('below-button', 700)])
  const after = snapshot([], [box('panel', 200, 600), box('above-card', 50, 100)], [box('below-button', 900)])
  assert.deepEqual(cardAndButtonJumps(before, after, tapAt(300, { opensRow: true, cardsHoldingTap: ['panel'] })), [])
  const movedAbove = snapshot([], [box('panel', 200, 600), box('above-card', 60, 100)], [box('below-button', 900)])
  assert.equal(cardAndButtonJumps(before, movedAbove, tapAt(300, { opensRow: true, cardsHoldingTap: ['panel'] })).length, 1)
})

test('a view switch with its controls above may move what is below or beside it', function viewSwitchMayMove() {
  const before = snapshot([], [box('aside', 200, 300)], [box('send', 900)])
  const after = snapshot([], [box('aside', 400, 300)], [box('send', 1100)])
  assert.deepEqual(cardAndButtonJumps(before, after, tapAt(300, { swapsView: true })), [])
})

test('a card or button that disappears is not a jump', function hiddenIsNotAJump() {
  assert.deepEqual(cardAndButtonJumps(snapshot([], [box('gone', 100)], [box('gone-button', 200)]), snapshot([]), tapAt(300)), [])
})

test('cards in a row must be equal height with their buttons level', function rowsLevel() {
  const level: CardRow = [
    { name: 'a', height: 400, gapBelowButton: 24 },
    { name: 'b', height: 400, gapBelowButton: 24 },
  ]
  const uneven: CardRow = [
    { name: 'a', height: 400, gapBelowButton: 24 },
    { name: 'b', height: 380, gapBelowButton: 44 },
  ]
  assert.deepEqual(rowProblems([level]), [])
  assert.equal(rowProblems([uneven]).length, 2)
})

test('a change that passes through values on its way eases; one that jumps to the end snaps', function easeOrSnap() {
  assert.equal(smoothVerdict(0, [0, 30, 60, 90, 100, 100], 100, false), 'eases')
  assert.equal(smoothVerdict(0, [0, 100, 100, 100], 100, false), 'snaps')
  assert.equal(smoothVerdict(50, [50, 50], 50, false), 'unchanged')
})

test('on a slow page, one frame caught mid-way still proves an ease; a snap never shows one', function slowPageEases() {
  assert.equal(smoothVerdict(44, [44, 44, 44, 446, 597, 597], 597, false), 'eases')
  assert.equal(smoothVerdict(44, [44, 44, 597, 597, 597], 597, false), 'snaps')
})

test('with reduced motion on, a change must be instant', function reducedIsInstant() {
  assert.equal(smoothVerdict(0, [100, 100, 100], 100, true), 'instant')
  assert.equal(smoothVerdict(0, [0, 40, 80, 100], 100, true), 'eases under reduced motion')
})
