/*
 * use-job-form.ts — the "Add a job" form's fields and sending: it hands the
 * draft and the shrunk photo to the demo's addJob, shows the outcome in
 * plain words, and empties the form after a job is added.
 */
import { useState } from 'react'
import type { FormEvent } from 'react'
import { AREAS } from '../../content/business.ts'
import type { Result } from '../../../../_core/result/result.ts'
import { ERROR_CODES } from '../../../shared/error-codes.ts'
import type { ErrorCode } from '../../../shared/error-codes.ts'
import { usePhotoPick } from '../../../../_core/photos/use-photo-pick.ts'
import type { PhotoPick } from '../../../../_core/photos/use-photo-pick.ts'
import type { JobDraft } from './jobs.ts'

export type FormStatus = { kind: 'idle' } | { kind: 'sending' } | { kind: 'added' } | { kind: 'failed'; code: ErrorCode }

export interface JobForm {
  draft: JobDraft
  photo: PhotoPick
  status: FormStatus
  setField: (field: keyof JobDraft, value: string) => void
  submit: (event: FormEvent<HTMLFormElement>) => Promise<void>
}

const EMPTY_DRAFT: JobDraft = { title: '', caption: '', suburb: AREAS[0] ?? '' }

export function useJobForm(addJob: (draft: JobDraft, photo: Blob) => Promise<Result<true, ErrorCode>>): JobForm {
  const [draft, setDraft] = useState<JobDraft>(EMPTY_DRAFT)
  const [status, setStatus] = useState<FormStatus>({ kind: 'idle' })
  const photo = usePhotoPick()
  return { draft, photo, status, setField, submit }

  function setField(field: keyof JobDraft, value: string): void {
    setDraft(withField)

    function withField(current: JobDraft): JobDraft {
      return { ...current, [field]: value }
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (photo.photo == null) return setStatus({ kind: 'failed', code: ERROR_CODES.JOB_INVALID })
    setStatus({ kind: 'sending' })
    const added = await addJob(draft, photo.photo)
    if (!added.ok) return setStatus({ kind: 'failed', code: added.code })
    setDraft(EMPTY_DRAFT)
    photo.clear()
    setStatus({ kind: 'added' })
  }
}
