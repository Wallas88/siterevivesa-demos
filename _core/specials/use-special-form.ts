/*
 * use-special-form.ts — the "Add a special" form's fields and sending: it
 * hands the draft to the demo's addSpecial, keeps why a draft was refused
 * (as a code the editor puts into words), and empties the form after one
 * is added.
 */
import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Result } from '../result/result.ts'
import type { CoreErrorCode } from '../result/core-errors.ts'
import type { SpecialDraft } from './specials.ts'

export interface SpecialForm {
  draft: SpecialDraft
  error: CoreErrorCode | null
  setField: (field: keyof SpecialDraft, value: string) => void
  submit: (event: FormEvent<HTMLFormElement>) => void
}

const EMPTY_DRAFT: SpecialDraft = { title: '', line: '', endsOn: '' }

export function useSpecialForm(addSpecial: (draft: SpecialDraft) => Result<true, CoreErrorCode>): SpecialForm {
  const [draft, setDraft] = useState<SpecialDraft>(EMPTY_DRAFT)
  const [error, setError] = useState<CoreErrorCode | null>(null)
  return { draft, error, setField, submit }

  function setField(field: keyof SpecialDraft, value: string): void {
    setDraft(withField)

    function withField(current: SpecialDraft): SpecialDraft {
      return { ...current, [field]: value }
    }
  }

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const added = addSpecial(draft)
    setError(added.ok ? null : added.code)
    if (added.ok) setDraft(EMPTY_DRAFT)
  }
}
