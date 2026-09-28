/*
 * use-price-field.ts — one price in the product list: the owner types
 * freely, a valid amount goes to the shop and the WhatsApp message at
 * once, and a typing slip shows a plain-words hint in space kept for it
 * while the shop keeps the last good price.
 */
import { useState } from 'react'
import type { Result } from '../../../../_core/result/result.ts'
import type { CoreErrorCode } from '../../../../_core/result/core-errors.ts'

export interface PriceField {
  text: string
  hint: CoreErrorCode | null
  change: (text: string) => void
}

export function usePriceField(startText: string, save: (text: string) => Result<unknown, CoreErrorCode>): PriceField {
  const [text, setText] = useState(startText)
  const [hint, setHint] = useState<CoreErrorCode | null>(null)
  return { text, hint, change }

  function change(next: string): void {
    setText(next)
    const saved = save(next)
    setHint(saved.ok ? null : saved.code)
  }
}
