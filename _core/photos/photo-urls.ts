/*
 * photo-urls.ts — photos in a demo: a picture that ships with the site
 * (seed) or one a visitor added (stored in their browser). This turns
 * stored photos into blob: URLs an <img> can show, frees them again, and
 * picks what an item shows. A stored photo the browser no longer has is
 * counted as missing, so a placeholder shows instead of a broken image.
 */
import type { DemoStore } from '../storage/demo-store.ts'

// A seed picture ships with the site; a visitor's photo lives in their own browser.
export type ContentPhoto = { kind: 'seed'; src: string } | { kind: 'stored'; photoId: string }

export type PhotoUrls = Record<string, string>

export interface LoadedPhotos {
  urls: PhotoUrls
  missing: number
}

export async function loadPhotoUrls<Data>(store: DemoStore<Data>, photoIds: string[]): Promise<LoadedPhotos> {
  const found = await Promise.all(photoIds.map(store.loadPhoto))
  const urls: PhotoUrls = {}
  let missing = 0
  found.forEach(addUrl)
  return { urls, missing }

  function addUrl(result: Awaited<ReturnType<DemoStore<Data>['loadPhoto']>>, index: number): void {
    const id = photoIds[index]
    if (id == null || !result.ok || result.value == null) {
      missing += 1
      return
    }
    urls[id] = URL.createObjectURL(result.value)
  }
}

export function freePhotoUrls(urls: PhotoUrls): void {
  for (const url of Object.values(urls)) URL.revokeObjectURL(url)
}

// The picture to show: the seed drawing, the visitor's own photo, or the demo's placeholder.
export function photoSrc(photo: ContentPhoto, urls: PhotoUrls, missingSrc: string): string {
  if (photo.kind === 'seed') return photo.src
  return urls[photo.photoId] ?? missingSrc
}

export function storedPhotoId(photo: ContentPhoto): string | null {
  return photo.kind === 'stored' ? photo.photoId : null
}
