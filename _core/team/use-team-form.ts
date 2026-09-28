/*
 * use-team-form.ts — the "Add a person" field: the first name typed, the
 * address it will sign in with on the demo's domain (shown as it is
 * typed), and why a name was refused, as a code the form puts into words.
 */
import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Result } from '../result/result.ts'
import type { CoreErrorCode } from '../result/core-errors.ts'

export interface TeamForm {
  name: string
  error: CoreErrorCode | null
  setName: (name: string) => void
  submit: (event: FormEvent<HTMLFormElement>) => void
}

export function useTeamForm(addMember: (name: string) => Result<true, CoreErrorCode>): TeamForm {
  const [name, setName] = useState('')
  const [error, setError] = useState<CoreErrorCode | null>(null)
  return { name, error, setName, submit }

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const added = addMember(name)
    setError(added.ok ? null : added.code)
    if (added.ok) setName('')
  }
}

// What the typed name will sign in as, for the hint under the field; empty until something is typed.
export function previewEmail(name: string, domain: string): string {
  const trimmed = name.trim().toLowerCase()
  return trimmed === '' ? '' : `${trimmed}@${domain}`
}
