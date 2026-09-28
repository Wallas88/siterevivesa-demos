/*
 * HoursRow.tsx — one weekday in the hours editor: its name, an Open/Closed
 * switch whose label keeps its width, opening and closing times, and a
 * hint line kept for a closing time before the opening time.
 */
import type { ChangeEvent } from 'react'
import type { DayHours } from './opening-hours.ts'
import { useDayHours } from './use-day-hours.ts'
import type { HoursEditing } from './use-day-hours.ts'
import type { HoursWords } from './hours-words.ts'
import { SwapLabel } from '../controls/SwapLabel.tsx'

interface HoursRowProps {
  row: DayHours
  editing: HoursEditing
  words: HoursWords
}

export function HoursRow({ row, editing, words }: HoursRowProps) {
  const field = useDayHours(row, editing)
  const name = words.dayNames[row.day]
  const hintId = `hours-hint-${row.day}`

  function changeOpens(event: ChangeEvent<HTMLInputElement>): void {
    field.changeOpens(event.target.value)
  }

  function changeCloses(event: ChangeEvent<HTMLInputElement>): void {
    field.changeCloses(event.target.value)
  }

  return (
    <li className="hours-editor-row">
      <p className="hours-editor-day">{name}</p>
      <button type="button" className="button button-secondary hours-toggle" onClick={field.toggleOpen} aria-pressed={row.open} aria-label={`${name}: ${row.open ? words.open : words.closed}`} data-day={row.day}>
        <SwapLabel labels={[words.open, words.closed]} shown={row.open ? 0 : 1} />
      </button>
      <label className="field">
        <span className="field-label">{words.opens}</span>
        <input className="field-input" type="time" value={field.opens} onChange={changeOpens} disabled={!row.open} aria-describedby={hintId} />
      </label>
      <label className="field">
        <span className="field-label">{words.closes}</span>
        <input className="field-input" type="time" value={field.closes} onChange={changeCloses} disabled={!row.open} aria-invalid={field.hint != null} aria-describedby={hintId} />
      </label>
      <p className="hours-editor-hint" id={hintId}>
        {field.hint == null ? '' : words.errors[field.hint]}
      </p>
    </li>
  )
}
