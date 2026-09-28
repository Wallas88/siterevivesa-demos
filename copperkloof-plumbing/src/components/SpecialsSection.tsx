/*
 * SpecialsSection.tsx — the website's "Specials and events": what the owner
 * added in the admin, minus any past its end date (decided in
 * specials.ts with today's date passed in).
 */
import { endText, specialsForSite } from '../../../_core/specials/specials.ts'
import type { Special } from '../../../_core/specials/specials.ts'
import { SPECIAL_WORDS } from '../content/words.ts'

interface SpecialsSectionProps {
  specials: Special[]
  today: string
}

function renderSpecial(special: Special) {
  const ends = endText(special.endsOn, SPECIAL_WORDS.endDate)
  return (
    <li className="special-card" key={special.id}>
      <h3 className="special-title">{special.title}</h3>
      {special.line !== '' && <p className="special-line">{special.line}</p>}
      {ends !== '' && <p className="special-end">{ends}</p>}
    </li>
  )
}

export function SpecialsSection({ specials, today }: SpecialsSectionProps) {
  const showing = specialsForSite(specials, today)
  return (
    <section className="site-section" id="specials">
      <h2 className="site-section-title">Specials and events</h2>
      {showing.length === 0 ? <p className="site-section-lead">No specials right now. New ones show here as soon as they are added.</p> : <ul className="special-grid">{showing.map(renderSpecial)}</ul>}
    </section>
  )
}
