/*
 * run-ux-check.ts — measures a built demo against the enforced UX
 * principles and prints a scorecard. Serves dist/ locally, drives headless
 * Chrome at 360 (touch) and 1440, and exits 1 when a principle fails, 2
 * when the check itself could not run. Each demo's scripts/ux-check.ts
 * calls runUxCheck with its own UxSetup.
 *
 *   npm run build && CHROME_PATH=/path/to/chrome npm run ux-check
 */
import type { DemoPage } from '../../pages/demo-page.ts'
import type { Viewport } from '../browser/chrome.ts'
import { readConfig } from '../browser/config.ts'
import { startStaticServer } from '../browser/static-server.ts'
import { launchBrowser } from '../browser/chrome.ts'
import { openPrepared } from '../browser/open-prepared.ts'
import type { BrowserPage } from '../browser/chrome.ts'
import { readBundle } from './bundle.ts'
import { findOffScaleSpacing } from './css-scan.ts'
import { judgeSite, belowFoldEverywhere } from './verdicts.ts'
import type { PageMeasurements, SiteMeasurements, Limits } from './verdicts.ts'
import { formatScorecard } from './report.ts'
import { succeed } from '../browser/result.ts'
import type { Result } from '../browser/result.ts'
import {
  inPage,
  installLayoutShiftObserver,
  readLayoutShift,
  scrollThroughPage,
  measureOverflow,
  measureSmallTargets,
  measurePrimaryPerScreen,
  measureSectionStyles,
  measureContrast,
  measureSlowMotion,
  measureImages,
  measureFocusedElement,
  applyPalette,
} from '../browser/page-measurements.ts'
import type { SmallTarget, SectionStyles, ContrastReport, SlowMotion, ImageIssues, FocusStop, ContrastArguments } from '../browser/page-measurements.ts'
import * as THRESHOLDS from './thresholds.ts'

// What a demo tells the ux-check: its pages, the palettes a visitor can pick, how a tab is reset, and its selectors.
export interface UxSetup {
  pages: DemoPage[]
  palettes: string[]
  tabState: (signedIn: boolean) => string
  selectors: UxSelectors
}

export interface UxSelectors {
  section: string
  primaryButton: string
  buttonLabel: string
  easterEgg: string
}

interface PhoneMeasurements {
  overflow: { scrollWidth: number; viewportWidth: number }
  layoutShift: number
  smallTargets: SmallTarget[]
  primaryPerScreen: number
  images: ImageIssues
  slowMotion: SlowMotion[]
}

interface DesktopMeasurements {
  sections: SectionStyles[]
  images: ImageIssues
  contrastByPalette: Record<string, ContrastReport>
}

const EXIT_PRINCIPLE_FAILED = 1
const EXIT_CHECK_BROKEN = 2
// Long enough for the site's own colour transitions to settle after a palette switch.
const PALETTE_SETTLE_MS = 450
const HOME_PAGE = '/'

const LIMITS: Limits = {
  maxPrimaryPerScreen: THRESHOLDS.MAX_PRIMARY_PER_SCREEN,
  maxSizes: THRESHOLDS.MAX_SIZES_PER_SECTION,
  maxWeights: THRESHOLDS.MAX_WEIGHTS_PER_SECTION,
  maxColours: THRESHOLDS.MAX_TEXT_COLOURS_PER_SECTION,
  minHitPx: THRESHOLDS.MIN_HIT_PX,
  maxRepeatedMotionMs: THRESHOLDS.MAX_REPEATED_MOTION_MS,
  maxJavascriptGzipKb: THRESHOLDS.MAX_JS_GZIP_KB,
  maxLayoutShift: THRESHOLDS.MAX_LAYOUT_SHIFT,
}

const CONTRAST_SETTINGS: ContrastArguments = {
  minContrast: THRESHOLDS.MIN_CONTRAST,
  minContrastLarge: THRESHOLDS.MIN_CONTRAST_LARGE,
  largeTextPx: THRESHOLDS.LARGE_TEXT_PX,
  largeBoldTextPx: THRESHOLDS.LARGE_BOLD_TEXT_PX,
  boldWeight: THRESHOLDS.BOLD_WEIGHT,
}

// One round trip: scroll the page, then take every phone measurement.
function phoneExpression(selectors: UxSelectors): string {
  return `(async function measurePhone() {
    await ${inPage(scrollThroughPage)};
    return {
      overflow: ${inPage(measureOverflow)},
      layoutShift: ${inPage(readLayoutShift)},
      smallTargets: ${inPage(measureSmallTargets, THRESHOLDS.MIN_HIT_PX, selectors.easterEgg)},
      primaryPerScreen: ${inPage(measurePrimaryPerScreen, selectors.primaryButton, THRESHOLDS.PHONE_VIEWPORT.height)},
      images: ${inPage(measureImages)},
      slowMotion: ${inPage(measureSlowMotion, THRESHOLDS.MAX_REPEATED_MOTION_MS, selectors.easterEgg)},
    };
  })()`
}

// Section styles once, then contrast in every palette a visitor can pick.
function desktopExpression(paletteIds: string[], selectors: UxSelectors): string {
  return `(async function measureDesktop() {
    const contrastByPalette = {};
    for (const id of ${JSON.stringify(paletteIds)}) {
      (${applyPalette.toString()})(id);
      await new Promise(function settle(done) { setTimeout(done, ${PALETTE_SETTLE_MS}); });
      contrastByPalette[id] = ${inPage(measureContrast, CONTRAST_SETTINGS)};
    }
    window.scrollTo(0, 0);
    return { sections: ${inPage(measureSectionStyles, selectors.section, selectors.easterEgg, selectors.buttonLabel)}, images: ${inPage(measureImages)}, contrastByPalette };
  })()`
}

// Opens the page with the tab set up first: the seed, signed in or out, past the first setup or on it, as the page asks.
function openPage(browser: BrowserPage, setup: UxSetup, url: string, page: DemoPage, viewport: Viewport, touch: boolean): Promise<void> {
  return openPrepared(browser, url, viewport, touch, { tabState: setup.tabState(page.signedIn), setUp: page.setUp })
}

async function measurePage(browser: BrowserPage, setup: UxSetup, origin: string, demoPage: DemoPage): Promise<Result<PageMeasurements>> {
  const path = demoPage.path
  await openPage(browser, setup, `${origin}${path}`, demoPage, THRESHOLDS.PHONE_VIEWPORT, true)
  const phone = await browser.evaluate<PhoneMeasurements>(phoneExpression(setup.selectors))
  if (!phone.ok) return phone
  await openPage(browser, setup, `${origin}${path}`, demoPage, THRESHOLDS.DESKTOP_VIEWPORT, false)
  const desktop = await browser.evaluate<DesktopMeasurements>(desktopExpression(setup.palettes, setup.selectors))
  if (!desktop.ok) return desktop
  return succeed({
    page: demoPage.label,
    primaryPerScreen: phone.value.primaryPerScreen,
    sections: desktop.value.sections,
    contrastByPalette: desktop.value.contrastByPalette,
    smallTargets: phone.value.smallTargets,
    slowMotion: phone.value.slowMotion,
    overflowPx: Math.max(0, phone.value.overflow.scrollWidth - phone.value.overflow.viewportWidth),
    layoutShift: phone.value.layoutShift,
    images: {
      unsized: phone.value.images.unsized,
      eagerBelowFold: belowFoldEverywhere(phone.value.images.eagerBelowFold, desktop.value.images.eagerBelowFold),
    },
  })
}

// Tabs through the home page at desktop width until focus comes back round.
async function measureFocusStops(browser: BrowserPage, origin: string): Promise<Result<FocusStop[]>> {
  await browser.open(`${origin}${HOME_PAGE}`, THRESHOLDS.DESKTOP_VIEWPORT, false)
  const stops: FocusStop[] = []
  let first: string | null = null
  for (let press = 0; press < THRESHOLDS.MAX_TAB_STOPS; press += 1) {
    await browser.pressTab()
    const focused = await browser.evaluate<FocusStop | null>(inPage(measureFocusedElement))
    if (!focused.ok) return focused
    if (focused.value == null) continue
    if (focused.value.control === first) break
    first ??= focused.value.control
    stops.push(focused.value)
  }
  return succeed(stops)
}

async function measureSite(browser: BrowserPage, setup: UxSetup, origin: string, distDirectory: string): Promise<Result<SiteMeasurements>> {
  await browser.addStartupScript(inPage(installLayoutShiftObserver))
  const pages: PageMeasurements[] = []
  for (const route of setup.pages) {
    const page = await measurePage(browser, setup, origin, route)
    if (!page.ok) return page
    pages.push(page.value)
  }
  const [focusStops, bundle] = await Promise.all([measureFocusStops(browser, origin), readBundle(distDirectory)])
  if (!focusStops.ok) return focusStops
  return succeed({
    pages,
    focusStops: focusStops.value,
    offScaleSpacing: findOffScaleSpacing(bundle.css, THRESHOLDS.SPACING_SCALE_PX, THRESHOLDS.ROOT_FONT_PX),
    javascriptByPage: bundle.javascriptByPage,
  })
}

function reportBroken(code: string, message: string): void {
  console.error(`ux-check could not run [${code}]: ${message}`)
  process.exitCode = EXIT_CHECK_BROKEN
}

async function main(setup: UxSetup): Promise<void> {
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
    const site = await measureSite(browser.value, setup, server.value.origin, config.value.distDirectory)
    if (!site.ok) return reportBroken(site.code, site.message)
    const findings = judgeSite(site.value, LIMITS)
    console.log(formatScorecard(findings))
    if (findings.some(isFailed)) process.exitCode = EXIT_PRINCIPLE_FAILED
  } finally {
    await Promise.all([browser.value.close(), server.value.close()])
  }
}

function isFailed(finding: { passed: boolean }): boolean {
  return !finding.passed
}

// The entry each demo's scripts/ux-check.ts calls: anything that escapes the steps above is reported as a code, never a stack.
export async function runUxCheck(setup: UxSetup): Promise<void> {
  try {
    await main(setup)
  } catch (error) {
    reportBroken('UNEXPECTED', `${error instanceof Error ? `${error.name}: ${error.message}` : 'unknown error'}. Run again; if it repeats, the page or browser changed.`)
  }
}
