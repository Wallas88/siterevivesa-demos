/*
 * ShopHours.tsx — the shop's opening hours (new with the admin): the
 * shared seven-row list in the visitor's language, labelled as example
 * hours. It never changes height when a day changes.
 */
import { HoursList } from '../../../_core/hours/HoursList.tsx'
import type { DayHours, HoursTextWords } from '../../../_core/hours/opening-hours.ts'
import type { ShopWordKey } from '../content/i18n.ts'

interface ShopHoursProps {
  hours: DayHours[]
  words: HoursTextWords
  t: Record<ShopWordKey, string>
}

export function ShopHours({ hours, words, t }: ShopHoursProps) {
  return (
    <section id="hours" className="hours-section" aria-labelledby="hours-heading">
      <div className="section-heading">
        <h2 id="hours-heading" className="section-title">
          {t.hoursHeading}
        </h2>
        <p className="section-note">{t.hoursNote}</p>
      </div>
      <HoursList hours={hours} words={words} />
    </section>
  )
}
