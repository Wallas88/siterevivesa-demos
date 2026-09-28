/*
 * run-flow-check.ts — enforces "Nothing hops" (the UX principles) on the
 * built site. At every audit width, 360 first, it taps every control on every
 * main page and fails when a control, card or button hops, or a row of cards
 * is uneven; then it samples each listed change and fails when one snaps, or
 * moves at all with reduced motion on. Exits 1 on a finding, 2 when the
 * check itself could not run. Part of `npm run verify`. Each demo's
 * scripts/flow-check.ts calls runFlowCheck with its own FlowSetup.
 *
 *   npm run build && CHROME_PATH=/path/to/chrome npm run flow-check
 */
import { setTimeout as wait } from 'node:timers/promises'
import type { DemoPage } from '../../pages/demo-page.ts'
import { readConfig } from '../browser/config.ts'
import { startStaticServer } from '../browser/static-server.ts'
import { launchBrowser } from '../browser/chrome.ts'
import { openPrepared } from '../browser/open-prepared.ts'
import type { BrowserPage } from '../browser/chrome.ts'
import { inPage } from '../browser/page-measurements.ts'
import { succeed } from '../browser/result.ts'
import type { Result } from '../browser/result.ts'
import { AUDIT_VIEWPORTS, TOUCH_MAX_WIDTH, controlHops, cardAndButtonJumps, rowProblems, smoothVerdict } from './flow-rules.ts'
import type { Viewport, TapContext, CardRow } from './flow-rules.ts'
import { tagControls, takeSnapshot, aimAtControl, readCardRows, sampleChange, idsMatching, controlKeys } from './flow-page.ts'
import type { TapTarget, PageSnapshot, ChangeSamples } from './flow-page.ts'
import type { FlowSetup, SmoothCase } from './flow-setup.ts'

interface Run {
  label: string
  findings: string[]
}

interface PageTaps {
  findings: string[]
  tapped: number
}

interface TapOutcome {
  findings: string[]
  expanded: boolean
}

const EXIT_FOUND = 1
const EXIT_BROKEN = 2
// Long enough for a hover lift to finish before the "before" snapshot, and for any tap's 250ms ease to end before the "after".
const HOVER_SETTLE_MS = 300
// Where content that appears starts: fully transparent.
const APPEARING_OPACITY = 0
const TAP_SETTLE_MS = 450

function sizeOf(viewport: Viewport): string {
  return `${viewport.width}x${viewport.height}`
}

function tapContextFor(id: string, target: TapTarget, before: PageSnapshot): TapContext {
  const tapped = before.snapshot.controls.find(isTapped)
  return { tappedId: id, tappedTop: tapped?.y ?? target.y, tappedHeight: tapped?.height ?? 0, opensRow: target.opensRow, swapsView: target.swapsView, cardsHoldingTap: before.cardsHoldingTap }

  function isTapped(control: { id: string }): boolean {
    return control.id === id
  }
}

// One tap: aim, rest the mouse (wide screens), snapshot, tap, let it settle, snapshot, judge.
async function tapOnce(browser: BrowserPage, setup: FlowSetup, id: string, viewport: Viewport): Promise<Result<TapOutcome | null>> {
  const touch = viewport.width <= TOUCH_MAX_WIDTH
  const target = await browser.evaluate<TapTarget | null>(inPage(aimAtControl, id, setup.selectors.viewSwitch, setup.selectors.resizesList))
  if (!target.ok || target.value == null) return target.ok ? succeed(null) : target
  if (!touch) await browser.hover(target.value)
  await wait(HOVER_SETTLE_MS)
  const before = await browser.evaluate<PageSnapshot>(inPage(takeSnapshot, setup.selectors, id))
  if (!before.ok) return before
  await browser.tap(target.value, touch)
  await wait(TAP_SETTLE_MS)
  const after = await browser.evaluate<PageSnapshot>(inPage(takeSnapshot, setup.selectors, id))
  if (!after.ok) return after
  const context = tapContextFor(id, target.value, before.value)
  const findings = [...controlHops(before.value.snapshot.controls, after.value.snapshot.controls, context, viewport.height), ...cardAndButtonJumps(before.value.snapshot, after.value.snapshot, context)]
  return succeed({ findings, expanded: after.value.expanded })
}

function labelled(label: string, findings: string[]): string[] {
  return findings.map(withLabel)

  function withLabel(finding: string): string {
    return `${label}: ${finding}`
  }
}

// The next control to tap: anything before the controls that must go last.
async function nextId(browser: BrowserPage, setup: FlowSetup, queue: string[]): Promise<string> {
  const last = await browser.evaluate<string[]>(inPage(idsMatching, setup.tapLastSelector))
  const lastIds = last.ok ? last.value : []
  const index = queue.findIndex(isNotLast)
  return queue.splice(index === -1 ? 0 : index, 1)[0] ?? ''

  function isNotLast(id: string): boolean {
    return !lastIds.includes(id)
  }
}

// Taps every control once (an opened menu is closed again with a second tap), taking in controls that appear on the way.
// Only controls not tapped before: a new id, and not a re-created copy of a control already tapped or queued.
async function newControls(browser: BrowserPage, tagged: string[], seenKeys: Set<string>): Promise<string[]> {
  const keys = await browser.evaluate<string[]>(inPage(controlKeys, tagged))
  if (!keys.ok) return []
  const fresh: string[] = []
  tagged.forEach(addIfNew)
  return fresh

  function addIfNew(id: string, index: number): void {
    const key = keys.ok ? (keys.value[index] ?? id) : id
    if (seenKeys.has(key)) return
    seenKeys.add(key)
    fresh.push(id)
  }
}

async function tapThroughPage(browser: BrowserPage, setup: FlowSetup, tagged: string[], viewport: Viewport): Promise<Result<PageTaps>> {
  const done = new Set<string>()
  const seenKeys = new Set<string>()
  const queue = await newControls(browser, tagged, seenKeys)
  const findings: string[] = []
  while (queue.length > 0 && done.size < setup.maxTaps) {
    const id = await nextId(browser, setup, queue)
    if (done.has(id)) continue
    done.add(id)
    const outcome = await tapOnce(browser, setup, id, viewport)
    if (!outcome.ok) return outcome
    findings.push(...labelled(`tap ${id}`, outcome.value?.findings ?? []))
    if (outcome.value?.expanded === true) {
      const closing = await tapOnce(browser, setup, id, viewport)
      if (!closing.ok) return closing
      findings.push(...labelled(`closing ${id}`, closing.value?.findings ?? []))
    }
    const nowTagged = await browser.evaluate<string[]>(inPage(tagControls, setup.selectors))
    if (nowTagged.ok) queue.push(...(await newControls(browser, nowTagged.value.filter(isNew), seenKeys)))
  }
  if (queue.length > 0) findings.push(`stopped after ${setup.maxTaps} taps with ${queue.length} controls left: raise maxTaps`)
  return succeed({ findings, tapped: done.size })

  function isNew(candidate: string): boolean {
    return !done.has(candidate) && !queue.includes(candidate)
  }
}

// Opens the page from a clean start: saved changes deleted, signed in or out, past the first setup or on it.
async function openClean(browser: BrowserPage, setup: FlowSetup, url: string, viewport: Viewport, page: { signedIn: boolean; setUp: boolean }): Promise<void> {
  await openPrepared(browser, url, viewport, viewport.width <= TOUCH_MAX_WIDTH, { tabState: setup.tabState(page.signedIn), setUp: page.setUp })
}

async function checkPage(browser: BrowserPage, setup: FlowSetup, origin: string, page: DemoPage, viewport: Viewport): Promise<Result<Run>> {
  await openClean(browser, setup, `${origin}${page.path}`, viewport, page)
  const rows = await browser.evaluate<CardRow[]>(inPage(readCardRows, setup.rowSelectors))
  if (!rows.ok) return rows
  const queue = await browser.evaluate<string[]>(inPage(tagControls, setup.selectors))
  if (!queue.ok) return queue
  const taps = await tapThroughPage(browser, setup, queue.value, viewport)
  if (!taps.ok) return taps
  return succeed({ label: `${sizeOf(viewport)} ${page.label} (${taps.value.tapped} controls tapped)`, findings: [...rowProblems(rows.value), ...taps.value.findings] })
}

async function tapThroughSite(browser: BrowserPage, setup: FlowSetup, origin: string): Promise<Result<Run[]>> {
  const runs: Run[] = []
  for (const viewport of AUDIT_VIEWPORTS) {
    for (const page of setup.pages) {
      const run = await checkPage(browser, setup, origin, page, viewport)
      if (!run.ok) return run
      runs.push(run.value)
      printRun(run.value)
    }
  }
  return succeed(runs)
}

function viewportAt(width: number): Viewport {
  return AUDIT_VIEWPORTS.find(isWidth) ?? { width, height: 800 }

  function isWidth(viewport: Viewport): boolean {
    return viewport.width === width
  }
}

async function sampleCase(browser: BrowserPage, setup: FlowSetup, origin: string, spec: SmoothCase, width: number, reduced: boolean): Promise<Result<Run>> {
  const viewport = viewportAt(width)
  // An admin case starts past the first setup, so the admin's own controls are there to sample.
  await openClean(browser, setup, `${origin}${spec.page}`, viewport, { signedIn: spec.signedIn, setUp: spec.signedIn })
  const change = await browser.evaluate<ChangeSamples | null>(inPage(sampleChange, spec))
  if (!change.ok) return change
  const label = `${reduced ? 'reduced motion' : 'motion'} ${width} ${spec.label}`
  if (change.value == null) return succeed({ label, findings: ['its control was not found'] })
  const start = spec.appears === true ? APPEARING_OPACITY : change.value.start
  const verdict = smoothVerdict(start, change.value.samples, change.value.end, reduced)
  const expected = reduced ? 'instant' : 'eases'
  return succeed({ label, findings: verdict === expected ? [] : [`${verdict} (expected: ${expected})`] })
}

function casesAt(setup: FlowSetup, width: number): SmoothCase[] {
  return width <= setup.phoneLayoutMaxWidth ? [...setup.phoneSmoothCases, ...setup.smoothCases] : setup.smoothCases
}

async function sampleAtWidth(browser: BrowserPage, setup: FlowSetup, origin: string, width: number, reduced: boolean): Promise<Result<Run[]>> {
  const runs: Run[] = []
  for (const spec of casesAt(setup, width)) {
    const run = await sampleCase(browser, setup, origin, spec, width, reduced)
    if (!run.ok) return run
    runs.push(run.value)
    printRun(run.value)
  }
  return succeed(runs)
}

async function sampleChanges(browser: BrowserPage, setup: FlowSetup, origin: string): Promise<Result<Run[]>> {
  const runs: Run[] = []
  for (const reduced of [false, true]) {
    await browser.setReducedMotion(reduced)
    for (const width of setup.smoothWidths) {
      const atWidth = await sampleAtWidth(browser, setup, origin, width, reduced)
      if (!atWidth.ok) return atWidth
      runs.push(...atWidth.value)
    }
  }
  await browser.setReducedMotion(false)
  return succeed(runs)
}

function printRun(run: Run): void {
  console.log(`${run.findings.length === 0 ? 'PASS' : 'FAIL'}  ${run.label}`)
  for (const finding of run.findings) console.log(`        ${finding}`)
}

function hasFindings(run: Run): boolean {
  return run.findings.length > 0
}

function reportBroken(code: string, message: string): void {
  console.error(`flow-check could not run [${code}]: ${message}`)
  process.exitCode = EXIT_BROKEN
}

async function checkFlow(browser: BrowserPage, setup: FlowSetup, origin: string): Promise<void> {
  console.log('Flow check — Nothing hops (the UX principles)\n')
  const taps = await tapThroughSite(browser, setup, origin)
  if (!taps.ok) return reportBroken(taps.code, taps.message)
  const changes = await sampleChanges(browser, setup, origin)
  if (!changes.ok) return reportBroken(changes.code, changes.message)
  const failed = [...taps.value, ...changes.value].filter(hasFindings).length
  console.log(`\n${failed === 0 ? 'Nothing hops: every tap and change passes.' : `${failed} checks failed.`}`)
  if (failed > 0) process.exitCode = EXIT_FOUND
}

async function main(setup: FlowSetup): Promise<void> {
  const config = readConfig(process.env)
  if (!config.ok) return reportBroken(config.code, config.message)
  const server = await startStaticServer(config.value.distDirectory)
  if (!server.ok) return reportBroken(server.code, server.message)
  const browser = await launchBrowser(config.value.chromePath)
  if (!browser.ok) {
    await server.value.close()
    return reportBroken(browser.code, browser.message)
  }
  try {
    await checkFlow(browser.value, setup, server.value.origin)
  } finally {
    await Promise.all([browser.value.close(), server.value.close()])
  }
}

// The entry each demo's scripts/flow-check.ts calls. An escaped rejection is logged as a code and still ends the run.
export async function runFlowCheck(setup: FlowSetup): Promise<void> {
  try {
    await main(setup)
  } catch (error) {
    reportBroken('UNEXPECTED', error instanceof Error ? error.message : 'unknown error')
  }
}
