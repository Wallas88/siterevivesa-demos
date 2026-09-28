/*
 * use-preview-url.ts — one blob: URL for the photo being previewed in the
 * "Add a job" form: made when a photo is shown, freed when it changes or
 * the form goes.
 */
import { useEffect, useRef, useState } from 'react'

export interface PreviewUrl {
  url: string | null
  show: (photo: Blob | null) => void
}

export function usePreviewUrl(): PreviewUrl {
  const [url, setUrl] = useState<string | null>(null)
  const current = useRef<string | null>(null)
  useEffect(freeOnUnmount, [])
  return { url, show }

  function show(photo: Blob | null): void {
    if (current.current != null) URL.revokeObjectURL(current.current)
    current.current = photo == null ? null : URL.createObjectURL(photo)
    setUrl(current.current)
  }

  function freeOnUnmount(): () => void {
    return freeLatest

    function freeLatest(): void {
      if (current.current != null) URL.revokeObjectURL(current.current)
    }
  }
}
