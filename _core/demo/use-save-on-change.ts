/*
 * use-save-on-change.ts — saves a demo's content to the visitor's store
 * after every change, once the store is open. A failed save shows its
 * notice; the change still shows in the page.
 */
import { useEffect } from 'react'
import type { CoreErrorCode } from '../result/core-errors.ts'
import type { DemoStore } from '../storage/demo-store.ts'

export function useSaveOnChange<Data>(store: DemoStore<Data> | null, data: Data, showNotice: (code: CoreErrorCode) => void): void {
  // biome-ignore lint/correctness/useExhaustiveDependencies: saves when the data or the store changes; showNotice is a state setter, which never changes
  useEffect(saveAfterChange, [store, data])

  function saveAfterChange(): void {
    if (store != null) void saveNow(store)
  }

  async function saveNow(openStore: DemoStore<Data>): Promise<void> {
    const saved = await openStore.saveData(data)
    if (!saved.ok) showNotice(saved.code)
  }
}
