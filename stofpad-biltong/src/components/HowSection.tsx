/*
 * HowSection.tsx — "Good food. Simple ordering.": the three numbered
 * steps from choosing to confirming on WhatsApp.
 */
import type { ShopWordKey } from '../content/i18n.ts'

interface HowSectionProps {
  t: Record<ShopWordKey, string>
}

const STEPS = [
  { step: 'step1', title: 'step1Title', body: 'step1Body' },
  { step: 'step2', title: 'step2Title', body: 'step2Body' },
  { step: 'step3', title: 'step3Title', body: 'step3Body' },
] as const

export function HowSection({ t }: HowSectionProps) {
  function renderStep(keys: (typeof STEPS)[number]) {
    return (
      <article className="step" key={keys.step}>
        <span className="step-number">{t[keys.step]}</span>
        <h3 className="card-title">{t[keys.title]}</h3>
        <p className="section-note">{t[keys.body]}</p>
      </article>
    )
  }

  return (
    <section id="how" className="how" aria-labelledby="how-heading">
      <h2 id="how-heading" className="section-title">
        {t.simple}
      </h2>
      <div className="steps">{STEPS.map(renderStep)}</div>
    </section>
  )
}
