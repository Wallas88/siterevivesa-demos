/*
 * check-setup.ts — Stofpad's side of the shared browser checks: the pages
 * they open (the shop, the admin's sign-in, the admin signed in), how a
 * tab is reset before each, the ux-check's selectors, and the
 * flow-check's cards, view switches and the changes whose smoothness is
 * sampled. The checks themselves are in ../../_core/checks/.
 */
import type { DemoPage } from '../../_core/pages/demo-page.ts'
import { tabStateExpression } from '../../_core/pages/demo-page.ts'
import { SIGNED_IN_VALUE } from '../../_core/sign-in/sign-in-session.ts'
import type { UxSetup } from '../../_core/checks/ux/run-ux-check.ts'
import type { FlowSetup } from '../../_core/checks/flow/flow-setup.ts'
import { CONTROL_SELECTOR, MAX_TAPS_PER_PAGE, RESIZES_LIST_SELECTOR, SMOOTH_WIDTHS, TAP_LAST_SELECTOR } from '../../_core/checks/flow/flow-setup.ts'
import { DATABASE_NAME } from '../src/features/storage/saved-demo.ts'
import { SIGNED_IN_KEY } from '../src/content/business.ts'
import { LANGUAGE_KEY } from '../src/features/language/saved-language.ts'

export const DEMO_PAGES: DemoPage[] = [
  { path: '/', label: '/', signedIn: false, setUp: false },
  { path: '/?view=admin', label: '/?view=admin sign-in', signedIn: false, setUp: false },
  { path: '/?view=admin', label: '/?view=admin first setup', signedIn: true, setUp: false },
  { path: '/?view=admin', label: '/?view=admin signed in', signedIn: true, setUp: true },
]

function tabState(signedIn: boolean): string {
  return tabStateExpression({ databaseName: DATABASE_NAME, signedInKey: SIGNED_IN_KEY, signedInValue: SIGNED_IN_VALUE, localKeys: [LANGUAGE_KEY] }, signedIn)
}

export const UX_SETUP: UxSetup = {
  pages: DEMO_PAGES,
  palettes: ['roast'],
  tabState,
  selectors: {
    // Page sections, the same standard as every demo (Waldo, 28 Sep 2026): the admin's sections count too.
    section: 'header, main > section, main section[id], footer, .admin-section',
    primaryButton: '.button-primary',
    // A button's or button-like link's label colour belongs to it, not to the block's text (Waldo, 26 Sep 2026).
    buttonLabel: 'button, .button, .order-link, .button-link, .line-remove',
    easterEgg: '.easter-egg',
  },
}

export const FLOW_SETUP: FlowSetup = {
  pages: DEMO_PAGES,
  selectors: {
    control: CONTROL_SELECTOR,
    card: '.product, .special-card',
    button: '.button',
    exempt: '.flow-exempt',
    // Controls above what they switch: the phone's Shop / Admin tabs, the language pill (every word on the
    // page changes, and fades) and the category filters (the rail's cards change, and fade).
    viewSwitch: '.view-switch, .language-switch, .category-filters',
    resizesList: RESIZES_LIST_SELECTOR,
  },
  rowSelectors: { card: '.product, .special-card', name: '.card-title', button: '.button, .button-link' },
  tapLastSelector: TAP_LAST_SELECTOR,
  maxTaps: MAX_TAPS_PER_PAGE,
  smoothCases: [
    { page: '/', label: 'the order summary opens after the first Add', click: '.product-add', measure: '.order-summary', property: 'height', signedIn: false },
    { page: '/', label: 'the WhatsApp message row opens', clickTextFirst: 'Add to order', click: '.message-toggle', measure: '.message-fold .fold-body', property: 'height', signedIn: false },
    { page: '/', label: 'a category change fades the cards in', click: '.category-filter:nth-child(3)', measure: '.product', property: 'opacity', appears: true, signedIn: false },
    { page: '/?view=admin', label: 'removing a product closes the end of the list', click: '#admin-products .slot:first-child .product-remove', measure: '#admin-products .slot-list', property: 'height', signedIn: true },
    { page: '/?view=admin', label: 'Send code swaps in the code step', clickText: 'Send code', measure: '.sign-in-step-code', property: 'opacity', signedIn: false },
  ],
  phoneSmoothCases: [
    { page: '/', label: 'Admin view fades in', click: '#tab-admin', measure: '.demo-pane-admin', property: 'opacity', appears: true, signedIn: false },
    { page: '/', label: 'the menu sheet fades in', click: '.menu-toggle', measure: '.shop-nav', property: 'opacity', signedIn: false },
  ],
  smoothWidths: SMOOTH_WIDTHS,
  // Up to this width the demo shows one view at a time (_core/styles/shell.css).
  phoneLayoutMaxWidth: 1023,
  tabState,
}
