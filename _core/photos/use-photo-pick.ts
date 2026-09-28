/*
 * use-photo-pick.ts — the photo chosen in the "Add a job" form: shrunk in
 * the browser as soon as it is picked (so the preview shows what the site
 * will show), with a plain-words error when it can't be used.
 */
import { useState } from 'react'
import type { CoreErrorCode } from '../result/core-errors.ts'
import { resizePhoto } from './resize-photo.ts'
import { usePreviewUrl } from './use-preview-url.ts'

export interface PhotoPick {
  photo: Blob | null
  previewUrl: string | null
  error: CoreErrorCode | null
  busy: boolean
  pick: (file: File | null) => Promise<void>
  clear: () => void
}

export function usePhotoPick(): PhotoPick {
  const [photo, setPhoto] = useState<Blob | null>(null)
  const [error, setError] = useState<CoreErrorCode | null>(null)
  const [busy, setBusy] = useState(false)
  const preview = usePreviewUrl()
  return { photo, previewUrl: preview.url, error, busy, pick, clear }

  function show(next: Blob | null): void {
    setPhoto(next)
    preview.show(next)
  }

  async function pick(file: File | null): Promise<void> {
    if (file == null) return
    setBusy(true)
    setError(null)
    const resized = await resizePhoto(file)
    setBusy(false)
    if (resized.ok) show(resized.value)
    else setError(resized.code)
  }

  function clear(): void {
    show(null)
    setError(null)
  }
}
