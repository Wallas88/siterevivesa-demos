/*
 * seo.ts — the page's title and description in each language, unchanged
 * from the static demo (seo.mjs): English is the static HTML's, Afrikaans
 * replaces it when chosen.
 */
import type { Language } from '../features/catalogue/products.ts'

export interface PageMetadata {
  title: string
  description: string
  locale: string
}

export const METADATA: Record<Language, PageMetadata> = {
  en: {
    title: 'Stofpad Biltong | Biltong & Droëwors in Klipkraal',
    description: 'Visit Stofpad Biltong on R30, just outside Klipkraal. Browse biltong, droëwors and snacks, choose your weight and arrange your order on WhatsApp.',
    locale: 'en_ZA',
  },
  af: {
    title: 'Stofpad Biltong | Biltong & Droëwors in Klipkraal',
    description: 'Besoek Stofpad Biltong op die R30, net buite Klipkraal. Kies biltong, droëwors en happies in jou voorkeurgewig en reël jou bestelling op WhatsApp.',
    locale: 'af_ZA',
  },
}
