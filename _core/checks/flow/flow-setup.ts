/*
 * flow-setup.ts — what a demo tells the flow-check: its pages, which
 * elements count as controls, cards and buttons, what is exempt, which
 * regions switch whole views or resize a list, what is tapped last, the
 * changes whose smoothness is sampled, and how a tab is reset. The rules
 * themselves are in flow-rules.ts; run-flow-check.ts runs them.
 */
import type { DemoPage } from '../../pages/demo-page.ts'
import type { Selectors, RowSelectors } from './flow-page.ts'

export interface SmoothCase {
  page: string
  label: string
  // Tapped by CSS selector, or by the start of a button's text.
  click?: string
  clickText?: string
  // Opened first and allowed to settle, when the case is about closing or switching back.
  clickFirst?: boolean
  clickTextFirst?: string
  measure: string
  property: 'height' | 'opacity'
  // Content that appears (a view shown, an item moving into a slot) starts invisible, so its ease is judged from opacity 0.
  appears?: boolean
  // The admin cases need the owner signed in; the sign-in case needs them signed out.
  signedIn: boolean
}

export interface FlowSetup {
  pages: DemoPage[]
  selectors: Selectors
  rowSelectors: RowSelectors
  // Controls tapped after all others (Sign out ends the admin).
  tapLastSelector: string
  // A page that still has controls left when this runs out fails, so coverage is never cut short silently.
  maxTaps: number
  smoothCases: SmoothCase[]
  // Sampled only where the demo shows one view at a time.
  phoneSmoothCases: SmoothCase[]
  smoothWidths: number[]
  phoneLayoutMaxWidth: number
  // Run inside a page before it is checked: saved content deleted, signed in or not.
  tabState: (signedIn: boolean) => string
}

// What a visitor taps to swap, open or switch something. Links leave or scroll the page and submits send, so neither is tapped.
export const CONTROL_SELECTOR = 'button:not([type="submit"]), summary, [role="tab"], [role="radio"]'
// Controls that make a list longer or shorter at its end: what is below may glide, the tapped control and those above still may not move.
export const RESIZES_LIST_SELECTOR = '[data-resizes-list]'
export const TAP_LAST_SELECTOR = '[data-tap-last]'
export const MAX_TAPS_PER_PAGE = 300
export const SMOOTH_WIDTHS = [360, 1440]
