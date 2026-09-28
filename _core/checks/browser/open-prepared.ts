/*
 * open-prepared.ts — opens a demo page the way every browser check needs
 * it: the tab set up first (saved content deleted, signed in or out), the
 * page loaded again, and, for an admin page that should start past the
 * panel's first setup, that setup done by tapping its own button with real
 * touch or mouse input (as a visitor would, so the browser treats what
 * follows as the result of their tap, not as the page shifting by itself).
 */
import { setTimeout as wait } from 'node:timers/promises'
import type { BrowserPage, Viewport } from './chrome.ts'

// The first-setup step's one button (_core/team/TeamSetup.tsx), whatever the language.
export const SETUP_BUTTON_SELECTOR = '.team-setup .button-primary'
// Longer than the demos' 250ms eases, so the admin's sections are in place before measuring.
const SETUP_SETTLE_MS = 500

export interface Preparation {
  tabState: string
  setUp: boolean
}

// The middle of the setup button on screen, or null when the panel is already set up.
function setupButtonCentre(selector: string): { x: number; y: number } | null {
  const button = document.querySelector(selector)
  if (button == null) return null
  button.scrollIntoView({ block: 'center', behavior: 'instant' })
  const rect = button.getBoundingClientRect()
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

export async function openPrepared(browser: BrowserPage, url: string, viewport: Viewport, touch: boolean, preparation: Preparation): Promise<void> {
  await browser.open(url, viewport, touch)
  await browser.evaluate<unknown>(preparation.tabState)
  await browser.open(url, viewport, touch)
  if (!preparation.setUp) return
  const centre = await browser.evaluate<{ x: number; y: number } | null>(`(${setupButtonCentre.toString()})(${JSON.stringify(SETUP_BUTTON_SELECTOR)})`)
  if (!centre.ok || centre.value == null) return
  await browser.tap(centre.value, touch)
  await wait(SETUP_SETTLE_MS)
  await browser.evaluate<unknown>('window.scrollTo(0, 0)')
}
