/*
 * use-load-demo.ts — runs load-demo.ts once when the page opens and hands
 * the result to the demo: its saved content, its photo URLs, any notice,
 * and the store to keep using. Until then the store is null and the admin
 * waits.
 */
import { useEffect, useState } from 'react'
import type { CoreErrorCode } from '../result/core-errors.ts'
import type { DemoStore } from '../storage/demo-store.ts'
import type { PhotoUrls } from '../photos/photo-urls.ts'
import { loadDemo } from './load-demo.ts'
import type { DemoSetup } from './load-demo.ts'

export interface LoadTargets<Data> {
  setup: DemoSetup<Data>
  loaded: (data: Data) => void
  replacePhotoUrls: (urls: PhotoUrls) => void
  showNotice: (code: CoreErrorCode | null) => void
}

export function useLoadDemo<Data>(targets: LoadTargets<Data>): DemoStore<Data> | null {
  const [store, setStore] = useState<DemoStore<Data> | null>(null)
  // biome-ignore lint/correctness/useExhaustiveDependencies: loads once; the targets are a fixed setup, a dispatch, state setters and a fixed photo control, which never change
  useEffect(loadOnMount, [])
  return store

  function loadOnMount(): void {
    void startDemo()
  }

  async function startDemo(): Promise<void> {
    const loaded = await loadDemo(targets.setup)
    targets.replacePhotoUrls(loaded.photoUrls)
    if (loaded.data != null) targets.loaded(loaded.data)
    targets.showNotice(loaded.notice)
    setStore(loaded.store)
  }
}
