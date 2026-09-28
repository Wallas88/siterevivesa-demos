/*
 * HoursEditor.tsx — the owner's opening hours: seven fixed rows, each with
 * an Open/Closed switch and two times. Closing a day greys its times
 * rather than hiding them, so nothing moves. The demo keys it by its reset
 * count, so Reset brings the typed times back too.
 */
import type { DayHours } from './opening-hours.ts'
import type { HoursEditing } from './use-day-hours.ts'
import type { HoursWords } from './hours-words.ts'
import { HoursRow } from './HoursRow.tsx'

interface HoursEditorProps {
  hours: DayHours[]
  actions: HoursEditing
  words: HoursWords
}

export function HoursEditor({ hours, actions, words }: HoursEditorProps) {
  function renderRow(row: DayHours) {
    return <HoursRow key={row.day} row={row} editing={actions} words={words} />
  }

  return (
    <>
      <p className="admin-section-lead">{words.lead}</p>
      <ul className="hours-editor">{hours.map(renderRow)}</ul>
    </>
  )
}
