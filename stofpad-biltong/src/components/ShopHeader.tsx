/*
 * ShopHeader.tsx — the shop's sticky header (Waldo's refinement, 21 Sep
 * 2026): one layout per width that never rearranges on scroll, only
 * tightening its padding; on phones the links sit behind the menu button
 * in a sheet with centred rows, and the order link shrinks to a cart icon
 * and its count.
 */
import type { Language } from '../features/catalogue/products.ts'
import type { ShopWordKey } from '../content/i18n.ts'
import { useScrolled } from '../features/header/use-scrolled.ts'
import { useMenuSheet } from '../features/header/use-menu-sheet.ts'
import { usePublishedHeight } from '../features/header/use-published-height.ts'
import { StofpadMark } from './StofpadMark.tsx'
import { LanguageSwitch } from './LanguageSwitch.tsx'

interface ShopHeaderProps {
  t: Record<ShopWordKey, string>
  language: Language
  onChooseLanguage: (language: Language) => void
  orderCount: number
}

const BRAND_MARK_PX = 44

function headerClass(scrolled: boolean, open: boolean): string {
  return `shop-header${scrolled ? ' is-scrolled' : ''}${open ? ' menu-open' : ''}`
}

export function ShopHeader({ t, language, onChooseLanguage, orderCount }: ShopHeaderProps) {
  const scrolled = useScrolled()
  const menu = useMenuSheet()
  usePublishedHeight(menu.header)

  return (
    <header className={headerClass(scrolled, menu.open)} ref={menu.header}>
      <a className="shop-brand" href="#top" aria-label="Stofpad Biltong">
        <StofpadMark className="shop-brand-mark" size={BRAND_MARK_PX} label={null} />
        <span className="shop-brand-name">
          STOFPAD<small>BILTONG</small>
        </span>
      </a>
      <nav className="shop-nav" aria-label={t.nav} id="site-navigation">
        <a className="shop-nav-link" href="#products">
          {t.products}
        </a>
        <a className="shop-nav-link" href="#how">
          {t.how}
        </a>
      </nav>
      <a className="order-link" href="#order">
        <svg className="order-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 7h13l-1.5 8h-10z" />
          <path d="M6 7 5 4H3" />
          <circle cx="9" cy="19" r="1.3" />
          <circle cx="16" cy="19" r="1.3" />
        </svg>
        <span className="order-label">{t.order}</span> <span className="order-count">{orderCount}</span>
      </a>
      <LanguageSwitch language={language} onChoose={onChooseLanguage} />
      <button type="button" className="menu-toggle" ref={menu.toggle} aria-controls="site-navigation" aria-expanded={menu.open} aria-label={menu.open ? t.closeMenu : t.openMenu} onClick={menu.onToggle}>
        <span aria-hidden="true">☰</span>
      </button>
    </header>
  )
}
