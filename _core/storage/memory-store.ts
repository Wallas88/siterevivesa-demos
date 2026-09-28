/*
 * memory-store.ts — the DemoStore adapter for when the browser refuses
 * storage (some private windows, blocked site data): the demo still works,
 * and changes last until the tab closes. Also the store the tests use.
 */
import { succeed } from '../result/result.ts'
import type { Result } from '../result/result.ts'
import type { CoreErrorCode } from '../result/core-errors.ts'
import type { DemoStore } from './demo-store.ts'

interface MemoryState<Data> {
  saved: Data | null
  photos: Map<string, Blob>
}

async function loadData<Data>(state: MemoryState<Data>): Promise<Result<Data | null, CoreErrorCode>> {
  return succeed(state.saved)
}

async function saveData<Data>(state: MemoryState<Data>, data: Data): Promise<Result<true, CoreErrorCode>> {
  state.saved = data
  return succeed(true)
}

async function savePhoto<Data>(state: MemoryState<Data>, photoId: string, photo: Blob): Promise<Result<true, CoreErrorCode>> {
  state.photos.set(photoId, photo)
  return succeed(true)
}

async function loadPhoto<Data>(state: MemoryState<Data>, photoId: string): Promise<Result<Blob | null, CoreErrorCode>> {
  return succeed(state.photos.get(photoId) ?? null)
}

async function deletePhoto<Data>(state: MemoryState<Data>, photoId: string): Promise<Result<true, CoreErrorCode>> {
  state.photos.delete(photoId)
  return succeed(true)
}

async function clear<Data>(state: MemoryState<Data>): Promise<Result<true, CoreErrorCode>> {
  state.saved = null
  state.photos.clear()
  return succeed(true)
}

export function createMemoryStore<Data>(): DemoStore<Data> {
  const state: MemoryState<Data> = { saved: null, photos: new Map() }
  return {
    mode: 'memory',
    loadData: loadData.bind(null, state) as DemoStore<Data>['loadData'],
    saveData: saveData.bind(null, state) as DemoStore<Data>['saveData'],
    savePhoto: savePhoto.bind(null, state),
    loadPhoto: loadPhoto.bind(null, state),
    deletePhoto: deletePhoto.bind(null, state),
    clear: clear.bind(null, state),
  }
}
