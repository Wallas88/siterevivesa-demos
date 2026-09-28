/*
 * use-language.ts — the visitor's language (English or Afrikaans) for the
 * whole demo, shop and admin: read once from what they chose before, kept
 * when changed, and applied to the page itself (html lang, title,
 * description and the social-card tags, as the static demo's seo.mjs did).
 */
import { useEffect, useState } from 'react'
import { logIssue } from '../../../../_core/result/log-issue.ts'
import type { Language } from '../catalogue/products.ts'
import { readSavedLanguage, saveLanguage } from './saved-language.ts'
import { applyMetadata } from '../seo/apply-metadata.ts'

export interface LanguageControl {
  language: Language
  choose: (language: Language) => void
}

const LANGUAGE_NOT_KEPT = 'LANGUAGE_NOT_KEPT'

export function useLanguage(): LanguageControl {
  const [language, setLanguage] = useState<Language>(readSavedLanguage)
  useEffect(applyToPage, [language])
  return { language, choose }

  function applyToPage(): void {
    applyMetadata(document, language)
  }

  function choose(next: Language): void {
    setLanguage(next)
    if (!saveLanguage(next)) logIssue(LANGUAGE_NOT_KEPT)
  }
}
