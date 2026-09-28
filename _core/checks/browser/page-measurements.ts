/*
 * page-measurements.ts — measurements that run inside the page under test.
 * inPage() turns one into source text: the shared helpers from
 * page-helpers.ts first, then the call with JSON arguments. So a measurement
 * may use those helpers by name but nothing else from outside itself. The
 * shapes below are the contract with verdicts.ts.
 */
import * as PAGE_HELPERS from './page-helpers.ts'
import { describeControl, labelOf, hasOwnText, isShown, isInlineInText, hitBox, toRgba, composite, contrastRatio, backgroundBehind, fontSize, fontWeight, textColour, distinct, isFoldedAway } from './page-helpers.ts'
import type { Box } from './page-helpers.ts'

export interface SmallTarget {
  control: string
  visible: Box
  hit: Box
}

export interface SectionStyles {
  section: string
  sizes: string[]
  weights: string[]
  colours: string[]
}

export interface ContrastMiss {
  text: string
  ratio: number
  required: number
}

export interface ContrastReport {
  checked: number
  unverifiable: number
  misses: ContrastMiss[]
}

export interface SlowMotion {
  control: string
  durationMs: number
}

export interface ImageIssues {
  unsized: string[]
  eagerBelowFold: string[]
}

export interface FocusStop {
  control: string
  hasRing: boolean
}

export interface ContrastArguments {
  minContrast: number
  minContrastLarge: number
  largeTextPx: number
  largeBoldTextPx: number
  boldWeight: number
}

function sourceOf(value: unknown): string {
  return typeof value === 'function' ? value.toString() : ''
}

// Helpers first (as plain function declarations), then the measurement called with JSON arguments.
export function inPage(pageFunction: (...args: never[]) => unknown, ...args: unknown[]): string {
  const helpers = Object.values(PAGE_HELPERS).map(sourceOf).join('\n')
  return `(function () {\n${helpers}\nreturn (${pageFunction.toString()})(${args.map(toJson).join(', ')});\n})()`

  function toJson(value: unknown): string {
    return JSON.stringify(value)
  }
}

// Installed before any page script runs, so shifts during load count.
export function installLayoutShiftObserver(): void {
  const store = window as unknown as { uxLayoutShift: number }
  store.uxLayoutShift = 0

  function record(list: PerformanceObserverEntryList): void {
    for (const entry of list.getEntries()) {
      const shift = entry as unknown as { value: number; hadRecentInput: boolean }
      if (!shift.hadRecentInput) store.uxLayoutShift += shift.value
    }
  }

  new PerformanceObserver(record).observe({ type: 'layout-shift', buffered: true })
}

export function readLayoutShift(): number {
  return (window as unknown as { uxLayoutShift?: number }).uxLayoutShift ?? 0
}

// Walks the whole page so reveals and lazy content run, then returns to the top.
export async function scrollThroughPage(): Promise<boolean> {
  const STEP_PX = 600
  const PAUSE_MS = 60

  function pause(resolvePause: () => void): void {
    setTimeout(resolvePause, PAUSE_MS)
  }

  for (let top = 0; top < document.documentElement.scrollHeight; top += STEP_PX) {
    window.scrollTo(0, top)
    await new Promise<void>(pause)
  }
  window.scrollTo(0, 0)
  await new Promise<void>(pause)
  return true
}

export function measureOverflow(): { scrollWidth: number; viewportWidth: number } {
  return { scrollWidth: document.documentElement.scrollWidth, viewportWidth: window.innerWidth }
}

export function measureSmallTargets(minHitPx: number, exemptSelector: string): SmallTarget[] {
  const SELECTOR = 'a[href], button, input, select, textarea, summary, [role="button"], [tabindex="0"]'
  const found = new Map<string, SmallTarget>()
  for (const element of document.querySelectorAll(SELECTOR)) {
    if (!needsCheck(element)) continue
    const hit = hitBox(element)
    if (hit.width >= minHitPx && hit.height >= minHitPx) continue
    const rect = element.getBoundingClientRect()
    const control = `${describeControl(element)} "${labelOf(element)}"`
    if (!found.has(control)) found.set(control, { control, visible: { width: Math.round(rect.width), height: Math.round(rect.height) }, hit })
  }
  return [...found.values()]

  function needsCheck(element: Element): boolean {
    const rect = element.getBoundingClientRect()
    const offPage = rect.right + window.scrollX <= 0 || rect.bottom + window.scrollY <= 0
    return isShown(element) && !offPage && !isInlineInText(element) && !element.matches(exemptSelector)
  }
}

// Most primary buttons whose centre is on screen within any one screen height.
export function measurePrimaryPerScreen(selector: string, screenHeight: number): number {
  const tops = [...document.querySelectorAll(selector)].filter(isOnScreenHorizontally).map(topOf)
  return Math.max(0, ...tops.map(countFrom))

  // How many buttons sit within one screen height starting at this one.
  function countFrom(first: number): number {
    return tops.filter(isWithin).length

    function isWithin(top: number): boolean {
      return top >= first && top < first + screenHeight
    }
  }

  function isOnScreenHorizontally(element: Element): boolean {
    const rect = element.getBoundingClientRect()
    const centreX = rect.left + rect.width / 2
    return isShown(element) && centreX >= 0 && centreX <= window.innerWidth
  }

  function topOf(element: Element): number {
    return element.getBoundingClientRect().top + window.scrollY
  }
}

// Easter eggs are left out: a hidden cameo's hover label is a one-off, not part of the section's hierarchy.
export function measureSectionStyles(sectionSelector: string, skipSelector: string, buttonSelector: string): SectionStyles[] {
  return [...document.querySelectorAll(sectionSelector)].map(stylesOf)

  function stylesOf(section: Element): SectionStyles {
    const texts = [...section.querySelectorAll('*')].filter(isTextShown)
    return {
      section: section.id !== '' ? `#${section.id}` : describeControl(section),
      sizes: distinct(texts.map(fontSize)),
      weights: distinct(texts.map(fontWeight)),
      colours: distinct(texts.filter(isNotButtonLabel).map(textColour)),
    }
  }

  function isTextShown(element: Element): boolean {
    return element.closest(skipSelector) == null && !isFoldedAway(element) && element.getBoundingClientRect().width > 0 && getComputedStyle(element).visibility !== 'hidden' && hasOwnText(element)
  }

  function isNotButtonLabel(element: Element): boolean {
    return element.closest(buttonSelector) == null
  }
}

export function measureContrast(settings: ContrastArguments): ContrastReport {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const paint = canvas.getContext('2d', { willReadFrequently: true })
  const report: ContrastReport = { checked: 0, unverifiable: 0, misses: [] }
  if (paint == null) return report
  for (const element of document.querySelectorAll('body *')) {
    const style = getComputedStyle(element)
    if (!isShown(element) || style.opacity === '0' || !hasOwnText(element)) continue
    const background = backgroundBehind(paint, element)
    if (background == null) {
      report.unverifiable += 1
      continue
    }
    report.checked += 1
    const ratio = contrastRatio(composite(toRgba(paint, style.color), background), background)
    const required = requiredFor(style)
    if (ratio < required) report.misses.push({ text: (element.textContent ?? '').trim().slice(0, 40), ratio: Math.round(ratio * 100) / 100, required })
  }
  return report

  function requiredFor(style: CSSStyleDeclaration): number {
    const size = parseFloat(style.fontSize)
    const isLarge = size >= settings.largeTextPx || (size >= settings.largeBoldTextPx && Number(style.fontWeight) >= settings.boldWeight)
    return isLarge ? settings.minContrastLarge : settings.minContrast
  }
}

export function measureSlowMotion(maxMs: number, exemptSelector: string): SlowMotion[] {
  const SELECTOR = 'a[href], button, summary, input, select, textarea, [role="button"]'
  const found = new Map<string, SlowMotion>()
  for (const element of document.querySelectorAll(SELECTOR)) {
    if (element.matches(exemptSelector)) continue
    // Transitions only: they answer a tap or hover. Looping idle animations are not repeated actions.
    const durationMs = longestMs(getComputedStyle(element).transitionDuration)
    const control = describeControl(element)
    if (durationMs > maxMs && !found.has(control)) found.set(control, { control, durationMs })
  }
  return [...found.values()]

  function longestMs(durations: string): number {
    return Math.max(0, ...durations.split(',').map(toMs))
  }

  function toMs(part: string): number {
    const value = part.trim()
    const ms = value.endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000
    return Number.isNaN(ms) ? 0 : ms
  }
}

export function measureImages(): ImageIssues {
  const issues: ImageIssues = { unsized: [], eagerBelowFold: [] }
  for (const image of document.querySelectorAll('img')) {
    const name = (image.getAttribute('src') ?? '').split('/').pop() ?? ''
    if (!image.hasAttribute('width') || !image.hasAttribute('height')) issues.unsized.push(name)
    const top = image.getBoundingClientRect().top + window.scrollY
    if (top > window.innerHeight && image.getAttribute('loading') !== 'lazy') issues.eagerBelowFold.push(name)
  }
  return issues
}

export function measureFocusedElement(): FocusStop | null {
  const element = document.activeElement
  if (element == null || element === document.body) return null
  const style = getComputedStyle(element)
  const outline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0
  return { control: `${describeControl(element)} "${labelOf(element)}"`, hasRing: outline || style.boxShadow !== 'none' }
}

export function applyPalette(paletteId: string): boolean {
  document.documentElement.dataset.palette = paletteId
  return true
}
