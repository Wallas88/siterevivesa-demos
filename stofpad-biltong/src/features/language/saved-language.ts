/*
 * saved-language.ts — the one place Stofpad reads and keeps the visitor's
 * language choice (localStorage, as the static demo did, under the same
 * key). Storage is optional: when the browser refuses it, English is the
 * named fallback and the choice lasts until the page closes.
 */
import type { Language } from '../catalogue/products.ts'

export const LANGUAGE_KEY = 'stofpad-language'
export const DEFAULT_LANGUAGE: Language = 'en'
const AFRIKAANS: Language = 'af'
// The browser would not keep the choice (site data blocked); the caller logs it.
const NOT_KEPT = false
const KEPT = true

export function readSavedLanguage(): Language {
  try {
    return globalThis.localStorage?.getItem(LANGUAGE_KEY) === AFRIKAANS ? AFRIKAANS : DEFAULT_LANGUAGE
  } catch {
    // Site data blocked: English, the static page's own language.
    return DEFAULT_LANGUAGE
  }
}

export function saveLanguage(language: Language): boolean {
  try {
    globalThis.localStorage?.setItem(LANGUAGE_KEY, language)
    return KEPT
  } catch {
    return NOT_KEPT
  }
}
