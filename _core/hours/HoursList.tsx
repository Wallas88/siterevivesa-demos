/*
 * HoursList.tsx — opening hours as a website shows them: always seven
 * rows, one per weekday, so changing a day in the admin changes words,
 * never the list's height.
 */
import { hoursText } from './opening-hours.ts'
import type { DayHours, HoursTextWords } from './opening-hours.ts'

interface HoursListProps {
  hours: DayHours[]
  words: HoursTextWords
}

export function HoursList({ hours, words }: HoursListProps) {
  function renderDay(row: DayHours) {
    return (
      <div className="hours-row" key={row.day}>
        <dt className="hours-day">{words.dayNames[row.day]}</dt>
        <dd className="hours-time">{hoursText(row, words)}</dd>
      </div>
    )
  }

  return <dl className="hours-list">{hours.map(renderDay)}</dl>
}
