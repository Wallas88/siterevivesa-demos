/*
 * check-setup.ts — Copperkloof's side of the shared browser checks: the
 * pages they open (the website, the admin's sign-in, the admin signed in),
 * how a tab is reset before each, the ux-check's selectors, and the
 * flow-check's cards, view switch and the changes whose smoothness is
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

export const DEMO_PAGES: DemoPage[] = [
  { path: '/', label: '/', signedIn: false, setUp: false },
  { path: '/?view=admin', label: '/?view=admin sign-in', signedIn: false, setUp: false },
  { path: '/?view=admin', label: '/?view=admin first setup', signedIn: true, setUp: false },
  { path: '/?view=admin', label: '/?view=admin signed in', signedIn: true, setUp: true },
]

function tabState(signedIn: boolean): string {
  return tabStateExpression({ databaseName: DATABASE_NAME, signedInKey: SIGNED_IN_KEY, signedInValue: SIGNED_IN_VALUE, localKeys: [] }, signedIn)
}

export const UX_SETUP: UxSetup = {
  pages: DEMO_PAGES,
  // One palette; contrast is measured in every palette a visitor can pick.
  palettes: ['copper'],
  tabState,
  selectors: {
    // The admin's sections count as sections too: they are the other half of the demo.
    section: 'header, main > section, main section[id], footer, .admin-section',
    primaryButton: '.button-primary',
    // A button's label colour belongs to the button, not the section's text (Waldo, 26 Sep 2026).
    buttonLabel: '.button',
    // No easter eggs in this demo: matches nothing.
    easterEgg: '.easter-egg',
  },
}

export const FLOW_SETUP: FlowSetup = {
  pages: DEMO_PAGES,
  selectors: {
    control: CONTROL_SELECTOR,
    card: '.service-card, .job-card',
    button: '.button',
    exempt: '.flow-exempt',
    // The phone's Website / Admin switch: its controls sit above the views, so what is below may change (and fades).
    viewSwitch: '.view-switch',
    resizesList: RESIZES_LIST_SELECTOR,
  },
  rowSelectors: { card: '.service-card, .job-card', name: '.service-name, .job-card-title', button: '.button' },
  tapLastSelector: TAP_LAST_SELECTOR,
  maxTaps: MAX_TAPS_PER_PAGE,
  smoothCases: [
    { page: '/?view=admin', label: 'removing a job closes the end of the list', clickTextFirst: 'Remove', click: '.job-actions-asking .button-danger', measure: '#admin-jobs .slot-list', property: 'height', signedIn: true },
    { page: '/?view=admin', label: 'a job moving into a slot fades in', click: '#admin-jobs .slot:nth-child(2) .button-icon', measure: '#admin-jobs .slot:nth-child(1) .job-row', property: 'opacity', appears: true, signedIn: true },
    { page: '/?view=admin', label: 'Send code swaps in the code step', clickText: 'Send code', measure: '.sign-in-step-code', property: 'opacity', signedIn: false },
  ],
  // Only on phones: wide screens show both views at once, so there is no switch to sample.
  phoneSmoothCases: [{ page: '/', label: 'Admin view fades in', click: '#tab-admin', measure: '.demo-pane-admin', property: 'opacity', appears: true, signedIn: false }],
  smoothWidths: SMOOTH_WIDTHS,
  // Up to this width the demo shows one view at a time (_core/styles/shell.css).
  phoneLayoutMaxWidth: 1023,
  tabState,
}
