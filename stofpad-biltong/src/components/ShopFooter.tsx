/*
 * ShopFooter.tsx — the footer: the demo name, the fictional location and
 * the demo notice every SiteReviveSA demo carries word for word.
 */
import { DEMO_NOTICE } from '../content/business.ts'

export function ShopFooter() {
  return (
    <footer className="shop-footer">
      <span>© Stofpad Biltong · demo concept</span>
      <span>R30, just outside Klipkraal (fictional demo location)</span>
      <span className="demo-notice">{DEMO_NOTICE}</span>
    </footer>
  )
}
