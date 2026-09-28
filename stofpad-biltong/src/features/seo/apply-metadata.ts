/*
 * apply-metadata.ts — puts one language's title, description and social
 * card tags on the page, and sets html lang, as seo.mjs did. The document
 * is passed in so the behaviour is testable with a stand-in.
 */
import { METADATA } from '../../content/seo.ts'
import type { Language } from '../catalogue/products.ts'

export interface MetadataDocument {
  title: string
  documentElement: { lang: string }
  querySelector: (selector: string) => { setAttribute: (name: string, value: string) => void } | null
}

function setContent(page: MetadataDocument, selector: string, content: string): void {
  page.querySelector(selector)?.setAttribute('content', content)
}

export function applyMetadata(page: MetadataDocument, language: Language): void {
  const { title, description, locale } = METADATA[language]
  page.documentElement.lang = language
  page.title = title
  setContent(page, 'meta[name="description"]', description)
  setContent(page, 'meta[property="og:title"]', title)
  setContent(page, 'meta[property="og:description"]', description)
  setContent(page, 'meta[property="og:locale"]', locale)
}
