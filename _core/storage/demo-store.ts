/*
 * demo-store.ts — the seam between a demo and wherever a visitor's changes
 * are kept. Two adapters sit behind it: indexed-db-store.ts (the visitor's
 * own browser, surviving a reload) and memory-store.ts (this tab only, when
 * the browser won't let the page save). Nothing ever leaves the browser.
 * Every method returns a Result; none throws. Data is each demo's own
 * content shape.
 */
import type { Result } from '../result/result.ts'
import type { CoreErrorCode } from '../result/core-errors.ts'

// 'browser': kept across reloads; 'memory': gone when the tab closes.
export type StoreMode = 'browser' | 'memory'

export interface DemoStore<Data> {
  mode: StoreMode
  // null when nothing is saved yet.
  loadData: () => Promise<Result<Data | null, CoreErrorCode>>
  saveData: (data: Data) => Promise<Result<true, CoreErrorCode>>
  savePhoto: (photoId: string, photo: Blob) => Promise<Result<true, CoreErrorCode>>
  // null when the photo is not there (cleared by the browser, for one).
  loadPhoto: (photoId: string) => Promise<Result<Blob | null, CoreErrorCode>>
  deletePhoto: (photoId: string) => Promise<Result<true, CoreErrorCode>>
  clear: () => Promise<Result<true, CoreErrorCode>>
}

// What a demo tells the store: its own database, and how to trust what was saved.
export interface StoreSetup<Data> {
  databaseName: string
  // Bump when Data changes shape; an older save then starts fresh.
  version: number
  // The saved data in the demo's own shape, or null when it is from another version or doesn't fit.
  readSaved: (saved: unknown) => Data | null
}
