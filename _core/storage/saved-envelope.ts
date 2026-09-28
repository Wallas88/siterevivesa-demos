/*
 * saved-envelope.ts — how saved data is wrapped (a version number beside
 * the data) and unwrapped. Saved data is untrusted: anything from another
 * version, or not the right shape, is refused, and the demo's own reader
 * checks the data itself. Pure; tested in tests/saved-envelope.test.ts.
 */

export interface SavedEnvelope<Data> {
  version: number
  data: Data
}

export type Fields = Record<string, unknown>

export function isFields(value: unknown): value is Fields {
  return typeof value === 'object' && value != null && !Array.isArray(value)
}

export function isText(value: unknown): value is string {
  return typeof value === 'string'
}

export function toSavedEnvelope<Data>(version: number, data: Data): SavedEnvelope<Data> {
  return { version, data }
}

// The data inside, when the envelope is this version; otherwise null.
export function openSavedEnvelope(saved: unknown, version: number): Fields | null {
  if (!isFields(saved) || saved.version !== version || !isFields(saved.data)) return null
  return saved.data
}

// Every item read, or null when any one doesn't fit: a half-trusted list is not shown.
export function readList<T>(value: unknown, readItem: (item: unknown) => T | null): T[] | null {
  if (!Array.isArray(value)) return null
  const items = value.map(readItem)
  return items.every(isPresent) ? items : null

  function isPresent(item: T | null): item is T {
    return item != null
  }
}
