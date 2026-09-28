/*
 * open-demo-store.ts — the one place that picks where a visitor's changes
 * are kept: their browser's IndexedDB when it is allowed, otherwise this
 * tab's memory with a plain-words notice. Never a blank screen.
 */
import { CORE_ERROR_CODES } from '../result/core-errors.ts'
import type { CoreErrorCode } from '../result/core-errors.ts'
import { logIssue } from '../result/log-issue.ts'
import type { DemoStore, StoreSetup } from './demo-store.ts'
import { openIndexedDbStore } from './indexed-db-store.ts'
import { createMemoryStore } from './memory-store.ts'

export interface OpenedStore<Data> {
  store: DemoStore<Data>
  // Set when the demo fell back to memory: why, for the notice.
  fallback: CoreErrorCode | null
}

// Some browsers throw on merely reading window.indexedDB when site data is blocked.
const NO_BROWSER_DATABASE = null

function browserDatabase(): IDBFactory | null {
  try {
    return globalThis.indexedDB ?? null
  } catch {
    return NO_BROWSER_DATABASE
  }
}

export async function openDemoStore<Data>(setup: StoreSetup<Data>): Promise<OpenedStore<Data>> {
  const factory = browserDatabase()
  if (factory == null) logIssue(CORE_ERROR_CODES.STORAGE_BLOCKED)
  const opened = factory == null ? null : await openIndexedDbStore(factory, setup)
  if (opened?.ok === true) return { store: opened.value, fallback: null }
  return { store: createMemoryStore<Data>(), fallback: CORE_ERROR_CODES.STORAGE_BLOCKED }
}
