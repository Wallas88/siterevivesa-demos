/*
 * use-photo-urls.ts — keeps the blob: URL for each photo in the browser,
 * and frees each one when its job goes, on reset, and when the page
 * closes, so photos don't pile up in memory. The controls are made once,
 * so their identity never changes.
 */
import { useEffect, useRef, useState } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'
import { freePhotoUrls } from './photo-urls.ts'
import type { PhotoUrls } from './photo-urls.ts'

interface PhotoUrlChanges {
  keep: (photoId: string, photo: Blob) => void
  drop: (photoId: string) => void
  dropAll: () => void
  replace: (urls: PhotoUrls) => void
}

export interface PhotoUrlControls extends PhotoUrlChanges {
  urls: PhotoUrls
}

type SetUrls = Dispatch<SetStateAction<PhotoUrls>>

function keepPhoto(setUrls: SetUrls, photoId: string, photo: Blob): void {
  const url = URL.createObjectURL(photo)
  setUrls(withPhoto)

  function withPhoto(current: PhotoUrls): PhotoUrls {
    return { ...current, [photoId]: url }
  }
}

function dropPhoto(setUrls: SetUrls, latest: RefObject<PhotoUrls>, photoId: string): void {
  const url = latest.current[photoId]
  if (url != null) URL.revokeObjectURL(url)
  setUrls(withoutPhoto)

  function withoutPhoto(current: PhotoUrls): PhotoUrls {
    const { [photoId]: _dropped, ...rest } = current
    return rest
  }
}

function replaceAll(setUrls: SetUrls, latest: RefObject<PhotoUrls>, next: PhotoUrls): void {
  freePhotoUrls(latest.current)
  setUrls(next)
}

function photoUrlChanges(setUrls: SetUrls, latest: RefObject<PhotoUrls>): PhotoUrlChanges {
  return {
    keep: keepPhoto.bind(null, setUrls),
    drop: dropPhoto.bind(null, setUrls, latest),
    dropAll: replaceAll.bind(null, setUrls, latest, {}),
    replace: replaceAll.bind(null, setUrls, latest),
  }
}

export function usePhotoUrls(): PhotoUrlControls {
  const [urls, setUrls] = useState<PhotoUrls>({})
  const latest = useRef(urls)
  latest.current = urls
  const [changes] = useState(makeChanges)
  useEffect(freeOnUnmount, [])
  return { urls, ...changes }

  function makeChanges(): PhotoUrlChanges {
    return photoUrlChanges(setUrls, latest)
  }

  function freeOnUnmount(): () => void {
    return freeLatest

    function freeLatest(): void {
      freePhotoUrls(latest.current)
    }
  }
}
