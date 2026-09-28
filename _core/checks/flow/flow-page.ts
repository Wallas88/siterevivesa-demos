/*
 * flow-page.ts — the flow-check's measurements that run inside the page
 * under test (sent there by inPage(), ux-check/page-measurements.ts): tag
 * the controls, snapshot every control, card and button, aim at one control,
 * read rows of cards, and sample one change frame by frame. Each function is
 * self-contained, because only its source text reaches the page.
 */
import type { Snapshot, CardRow } from './flow-rules.ts'
import type { SmoothCase } from './flow-setup.ts'
import { flowBoxes, flowNextId, flowIsShown, flowControl, flowRead, flowPause } from '../browser/page-helpers.ts'

export interface Selectors {
  control: string
  card: string
  button: string
  exempt: string
  viewSwitch: string
  resizesList: string
}

export interface TapTarget {
  x: number
  y: number
  opensRow: boolean
  swapsView: boolean
}

export interface PageSnapshot {
  snapshot: Snapshot
  cardsHoldingTap: string[]
  expanded: boolean
}

export interface ChangeSamples {
  start: number
  samples: number[]
  end: number
}

// Tags every visible, non-exempt control and returns the ids in page order.
export function tagControls(selectors: Selectors): string[] {
  const ids: string[] = []
  for (const element of document.querySelectorAll<HTMLElement>(selectors.control)) {
    if (!flowIsShown(element) || element.closest(selectors.exempt) != null) continue
    element.dataset.flowId ??= flowNextId('control')
    ids.push(element.dataset.flowId)
  }
  return ids
}

// A control's lasting identity: where it sits in the page and what it says. React re-creates buttons when a row
// swaps ("Remove" → "Remove this job? Remove / Keep" → back), and a re-created button in the same place with the
// same words is the same control, so it is not tapped again.
export function controlKeys(ids: string[]): string[] {
  return ids.map(keyOf)

  function keyOf(id: string): string {
    const element = document.querySelector(`[data-flow-id="${id}"]`)
    if (element == null) return id
    const path: string[] = []
    for (let node: Element | null = element; node != null && node !== document.body; node = node.parentElement) {
      path.unshift(`${node.tagName}:${node.parentElement == null ? 0 : [...node.parentElement.children].indexOf(node)}`)
    }
    return `${path.join('>')}|${(element.getAttribute('aria-label') ?? element.textContent ?? '').trim()}`
  }
}

// The tagged controls that must be tapped after all others.
export function idsMatching(selector: string): string[] {
  return [...document.querySelectorAll<HTMLElement>(selector)].map(flowIdOf)

  function flowIdOf(element: HTMLElement): string {
    return element.dataset.flowId ?? ''
  }
}

// Every visible control, card and button with its screen top and height; ids stay stable across snapshots.
export function takeSnapshot(selectors: Selectors, tappedId: string): PageSnapshot {
  const tapped = document.querySelector(`[data-flow-id="${tappedId}"]`)
  const cards = flowBoxes(selectors.card, 'flowCard', selectors.exempt)
  const holding = [...document.querySelectorAll<HTMLElement>('[data-flow-card]')].filter(holdsTapped).map(cardId)
  return {
    snapshot: { controls: flowBoxes('[data-flow-id]', 'flowId', selectors.exempt), cards, buttons: flowBoxes(selectors.button, 'flowButton', selectors.exempt) },
    cardsHoldingTap: holding,
    expanded: tapped?.getAttribute('aria-expanded') === 'true',
  }

  function holdsTapped(card: HTMLElement): boolean {
    return tapped != null && card.contains(tapped)
  }

  function cardId(card: HTMLElement): string {
    return card.dataset.flowCard ?? ''
  }
}

// Brings one control to the middle of the screen and says where to tap it, or null when something covers it.
// A control that makes a list longer or shorter at its end counts as opening a row: it may push what is below;
// and as a view switch for the website beside the admin, which shows one card more or fewer by design.
export function aimAtControl(tappedId: string, viewSwitch: string, resizesList: string): TapTarget | null {
  const element = document.querySelector(`[data-flow-id="${tappedId}"]`)
  if (element == null || element.getClientRects().length === 0) return null
  element.scrollIntoView({ block: 'center', behavior: 'instant' })
  const rect = element.getBoundingClientRect()
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2
  const hit = document.elementFromPoint(x, y)
  if (hit == null || !(element === hit || element.contains(hit) || hit.contains(element))) return null
  const opensRow = element.tagName === 'SUMMARY' || element.hasAttribute('aria-expanded') || element.matches(resizesList)
  return { x, y, opensRow, swapsView: element.closest(viewSwitch) != null || element.matches(resizesList) }
}

export interface RowSelectors {
  card: string
  name: string
  button: string
}

// Cards that share a parent and a top edge form a row: each card's height and its button's distance from the bottom.
export function readCardRows(selectors: RowSelectors): CardRow[] {
  const rows: CardRow[] = []
  const parents = new Set<Element>()
  for (const card of document.querySelectorAll(selectors.card)) if (card.parentElement != null && card.getClientRects().length > 0) parents.add(card.parentElement)
  for (const parent of parents) {
    const byTop = new Map<number, CardRow>()
    for (const card of parent.querySelectorAll(`:scope > :is(${selectors.card})`)) {
      if (card.getClientRects().length === 0) continue
      const rect = card.getBoundingClientRect()
      const top = Math.round(rect.top)
      const button = card.querySelector(selectors.button)
      const row = byTop.get(top) ?? []
      row.push({ name: (card.querySelector(selectors.name)?.textContent ?? '').trim().slice(0, 30), height: rect.height, gapBelowButton: button == null ? null : rect.bottom - button.getBoundingClientRect().bottom })
      byTop.set(top, row)
    }
    for (const row of byTop.values()) if (row.length > 1) rows.push(row)
  }
  return rows
}

// Clicks the case's control and records the measured value every frame for 400ms.
export async function sampleChange(spec: SmoothCase): Promise<ChangeSamples | null> {
  if (spec.clickFirst === true) flowControl(spec.click, spec.clickText)?.click()
  if (spec.clickTextFirst != null) flowControl(undefined, spec.clickTextFirst)?.click()
  await flowPause(700)
  const target = flowControl(spec.click, spec.clickText)
  if (target == null) return null
  target.scrollIntoView({ block: 'center', behavior: 'instant' })
  await flowPause(300)
  const start = flowRead(spec.measure, spec.property)
  target.click()
  const began = performance.now()
  const samples: number[] = []
  while (performance.now() - began < 400) {
    await new Promise(requestAnimationFrame)
    samples.push(flowRead(spec.measure, spec.property))
  }
  await flowPause(300)
  return { start, samples, end: flowRead(spec.measure, spec.property) }
}
