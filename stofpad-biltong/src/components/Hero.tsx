/*
 * Hero.tsx — the opening: the eyebrow, the serif headline, the intro, the
 * one main action (Explore the products) and the large glowing mark.
 */
import type { ShopWordKey } from '../content/i18n.ts'
import { StofpadMark } from './StofpadMark.tsx'

interface HeroProps {
  t: Record<ShopWordKey, string>
}

const HERO_MARK_PX = 640

export function Hero({ t }: HeroProps) {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="hero-title">{t.hero}</h1>
        <p className="intro">{t.intro}</p>
        <a className="button button-primary" href="#products">
          {t.browse}
        </a>
        <p className="small-note">{t.note}</p>
      </div>
      <StofpadMark className="hero-logo" size={HERO_MARK_PX} label="Stofpad Biltong" />
    </section>
  )
}
