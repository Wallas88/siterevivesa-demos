/*
 * JobForm.tsx — "Add a job": a photo (camera or files), a title, a short
 * caption and a suburb. The photo is shrunk in the browser and the job
 * shows on the website the moment it is added. The status line has its
 * own two-line space, and the button keeps its width while it works.
 */
import type { ChangeEvent, FormEvent } from 'react'
import { AREAS } from '../content/business.ts'
import { MAX_CAPTION_LENGTH, MAX_TITLE_LENGTH } from '../features/jobs/jobs.ts'
import type { JobDraft } from '../features/jobs/jobs.ts'
import { useJobForm } from '../features/jobs/use-job-form.ts'
import type { FormStatus } from '../features/jobs/use-job-form.ts'
import type { Result } from '../../../_core/result/result.ts'
import { PhotoPicker } from '../../../_core/photos/PhotoPicker.tsx'
import { SwapLabel } from '../../../_core/controls/SwapLabel.tsx'
import { ERROR_MESSAGES } from '../../shared/error-codes.ts'
import type { ErrorCode } from '../../shared/error-codes.ts'
import { PHOTO_WORDS } from '../content/words.ts'

interface JobFormProps {
  addJob: (draft: JobDraft, photo: Blob) => Promise<Result<true, ErrorCode>>
  disabled: boolean
  onShowNewJob: () => void
}

function renderArea(area: string) {
  return (
    <option key={area} value={area}>
      {area}
    </option>
  )
}

function statusText(status: FormStatus): string {
  return status.kind === 'failed' ? ERROR_MESSAGES[status.code] : ''
}

export function JobForm({ addJob, disabled, onShowNewJob }: JobFormProps) {
  const form = useJobForm(addJob)
  const sending = form.status.kind === 'sending'

  function sendForm(event: FormEvent<HTMLFormElement>): void {
    void form.submit(event)
  }

  function changeTitle(event: ChangeEvent<HTMLInputElement>): void {
    form.setField('title', event.target.value)
  }

  function changeCaption(event: ChangeEvent<HTMLTextAreaElement>): void {
    form.setField('caption', event.target.value)
  }

  function changeSuburb(event: ChangeEvent<HTMLSelectElement>): void {
    form.setField('suburb', event.target.value)
  }

  return (
    <form className="job-form" onSubmit={sendForm}>
      <PhotoPicker pick={form.photo} disabled={disabled} words={PHOTO_WORDS} />
      <label className="field">
        <span className="field-label">Title</span>
        <input className="field-input" name="title" value={form.draft.title} onChange={changeTitle} maxLength={MAX_TITLE_LENGTH} required placeholder="New geyser fitted" />
      </label>
      <label className="field">
        <span className="field-label">
          Short caption <span className="field-count">{`${form.draft.caption.length}/${MAX_CAPTION_LENGTH}`}</span>
        </span>
        <textarea className="field-input field-textarea" name="caption" rows={2} value={form.draft.caption} onChange={changeCaption} maxLength={MAX_CAPTION_LENGTH} />
      </label>
      <label className="field">
        <span className="field-label">Suburb</span>
        <select className="field-input" name="suburb" value={form.draft.suburb} onChange={changeSuburb}>
          {AREAS.map(renderArea)}
        </select>
      </label>
      <button type="submit" className="button button-primary" disabled={disabled || sending || form.photo.busy}>
        <SwapLabel labels={['Add to website', 'Adding…']} shown={sending ? 1 : 0} />
      </button>
      <div className="form-status">
        {form.status.kind === 'added' ? (
          <button type="button" className="button button-secondary" onClick={onShowNewJob}>
            Added. See it on your website
          </button>
        ) : (
          <p role="status">{statusText(form.status)}</p>
        )}
      </div>
    </form>
  )
}
