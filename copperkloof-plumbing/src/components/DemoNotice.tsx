/*
 * DemoNotice.tsx — the demo notice every SiteReviveSA demo carries,
 * word for word (demos repo rule). Shown on the website and in the admin.
 */
import { DEMO_NOTICE } from '../content/business.ts'

export function DemoNotice() {
  return <p className="demo-notice">{DEMO_NOTICE}</p>
}
