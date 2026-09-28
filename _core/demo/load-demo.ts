/*
 * load-demo.ts — what happens when a demo opens, in order: pick the store
 * (the browser's, or memory with a notice), read what this visitor saved,
 * and turn their photos into URLs. Never throws; whatever goes wrong
 * becomes the notice code, and the demo still starts.
 */
import { CORE_ERROR_CODES } from '../result/core-errors.ts'
import type { CoreErrorCode } from '../result/core-errors.ts'
import type { DemoStore, StoreSetup } from '../storage/demo-store.ts'
import { openDemoStore } from '../storage/open-demo-store.ts'
import { loadPhotoUrls } from '../photos/photo-urls.ts'
import type { PhotoUrls } from '../photos/photo-urls.ts'

export interface LoadedDemo<Data> {
  store: DemoStore<Data>
  // null when this visitor has saved nothing yet (or it could not be read): the seed shows.
  data: Data | null
  photoUrls: PhotoUrls
  notice: CoreErrorCode | null
}

export interface DemoSetup<Data> extends StoreSetup<Data> {
  // The ids of the visitor's own photos in their saved data.
  photoIdsOf: (data: Data) => string[]
}

export async function loadDemo<Data>(setup: DemoSetup<Data>): Promise<LoadedDemo<Data>> {
  const opened = await openDemoStore(setup)
  const saved = await opened.store.loadData()
  if (!saved.ok) return { store: opened.store, data: null, photoUrls: {}, notice: saved.code }
  if (saved.value == null) return { store: opened.store, data: null, photoUrls: {}, notice: opened.fallback }
  const photos = await loadPhotoUrls(opened.store, setup.photoIdsOf(saved.value))
  return { store: opened.store, data: saved.value, photoUrls: photos.urls, notice: photos.missing > 0 ? CORE_ERROR_CODES.PHOTO_MISSING : opened.fallback }
}
