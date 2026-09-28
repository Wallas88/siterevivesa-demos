/*
 * HoursSection.tsx — the website's opening hours section: the shared
 * seven-row list (it never changes height), labelled as example hours.
 */
import { HoursList } from '../../../_core/hours/HoursList.tsx'
import type { DayHours } from '../../../_core/hours/opening-hours.ts'
import { HOURS_WORDS } from '../content/words.ts'

interface HoursSectionProps {
  hours: DayHours[]
}

export function HoursSection({ hours }: HoursSectionProps) {
  return (
    <section className="site-section" id="hours">
      <h2 className="site-section-title">Opening hours</h2>
      <p className="site-section-lead">Example hours, set by the owner in the admin.</p>
      <HoursList hours={hours} words={HOURS_WORDS} />
    </section>
  )
}
