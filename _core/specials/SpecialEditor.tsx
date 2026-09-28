/*
 * SpecialEditor.tsx — the owner's specials and events: a short form (title,
 * one line, optional end date) and the list, each with Remove. The date
 * field has no browser minimum on purpose: a past date gets the demo's own
 * plain-words message (SPECIAL_ENDED), not the browser's.
 */
import type { ChangeEvent } from 'react'
import type { Result } from '../result/result.ts'
import type { CoreErrorCode } from '../result/core-errors.ts'
import { MAX_SPECIAL_LINE_LENGTH, MAX_SPECIAL_TITLE_LENGTH } from './specials.ts'
import type { Special, SpecialDraft } from './specials.ts'
import { useSpecialForm } from './use-special-form.ts'
import type { SpecialWords } from './special-words.ts'
import { SpecialList } from './SpecialList.tsx'

export interface SpecialEditing {
  addSpecial: (draft: SpecialDraft) => Result<true, CoreErrorCode>
  removeSpecial: (id: string) => void
}

interface SpecialEditorProps {
  specials: Special[]
  today: string
  language: string
  words: SpecialWords
  actions: SpecialEditing
  disabled: boolean
}

export function SpecialEditor({ specials, today, language, words, actions, disabled }: SpecialEditorProps) {
  const form = useSpecialForm(actions.addSpecial)

  function changeTitle(event: ChangeEvent<HTMLInputElement>): void {
    form.setField('title', event.target.value)
  }

  function changeLine(event: ChangeEvent<HTMLInputElement>): void {
    form.setField('line', event.target.value)
  }

  function changeEnd(event: ChangeEvent<HTMLInputElement>): void {
    form.setField('endsOn', event.target.value)
  }

  return (
    <>
      <form className="special-form" onSubmit={form.submit}>
        <label className="field">
          <span className="field-label">{words.titleLabel}</span>
          <input className="field-input" name="special-title" value={form.draft.title} onChange={changeTitle} maxLength={MAX_SPECIAL_TITLE_LENGTH} required placeholder={words.titlePlaceholder} />
        </label>
        <label className="field">
          <span className="field-label">{words.lineLabel}</span>
          <input className="field-input" name="special-line" value={form.draft.line} onChange={changeLine} maxLength={MAX_SPECIAL_LINE_LENGTH} />
        </label>
        <label className="field">
          <span className="field-label">
            {words.endsLabel} <span className="field-count">{words.optional}</span>
          </span>
          <input className="field-input" type="date" name="special-ends" value={form.draft.endsOn} onChange={changeEnd} />
        </label>
        <button type="submit" className="button button-secondary" disabled={disabled}>
          {words.add}
        </button>
        <p className="form-status" role="status">
          {form.error == null ? '' : words.errors[form.error]}
        </p>
      </form>
      <SpecialList specials={specials} today={today} language={language} words={words} onRemove={actions.removeSpecial} />
    </>
  )
}
