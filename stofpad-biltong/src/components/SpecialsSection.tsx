/*
 * SpecialsSection.tsx — "This week's specials": the owner's specials and
 * events in a card rail, minus any past its end date (decided in the
 * shared specials rules with today's date passed in). Each card is marked
 * as a sample to be confirmed and leads to the order, as in the static
 * demo.
 */
import { endText, specialsForSite, specialText } from '../../../_core/specials/specials.ts'
import type { EndDateWords, Special } from '../../../_core/specials/specials.ts'
import type { Language } from '../features/catalogue/products.ts'
import type { ShopWordKey } from '../content/i18n.ts'
import { CardRail } from './CardRail.tsx'

interface SpecialsSectionProps {
  specials: Special[]
  today: string
  language: Language
  t: Record<ShopWordKey, string>
  dateWords: EndDateWords
}

export function SpecialsSection({ specials, today, language, t, dateWords }: SpecialsSectionProps) {
  const showing = specialsForSite(specials, today)

  function renderSpecial(special: Special) {
    const text = specialText(special, language)
    const ends = endText(special.endsOn, dateWords)
    return (
      <article className="special-card" key={special.id}>
        <p className="eyebrow">{t.specialBadge}</p>
        <h3 className="card-title">{text.title}</h3>
        <p className="small-note">{text.line === '' ? t.pending : text.line}</p>
        {ends !== '' && <p className="small-note">{ends}</p>}
        <a href="#order" className="button-link">
          {t.specialEnquire}
        </a>
      </article>
    )
  }

  return (
    <section className="specials" aria-labelledby="specials-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t.specialKicker}</p>
          <h2 id="specials-heading" className="section-title">
            {t.specialHeading}
          </h2>
        </div>
        <p className="section-note">{t.specialNote}</p>
      </div>
      <CardRail id="special-list" className="special-list" labelledBy="specials-heading" cardCount={showing.length} words={{ previous: t.previous, next: t.next, name: t.specialsRail }}>
        {showing.map(renderSpecial)}
      </CardRail>
    </section>
  )
}
