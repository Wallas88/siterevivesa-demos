/*
 * use-price-field.ts — one row of the price editor: the owner types freely,
 * a valid amount goes to the website at once, and a typing slip shows a
 * plain-words hint (in space kept for it) instead of changing the site.
 */
import { useState } from 'react'
import type { Result } from '../../../../_core/result/result.ts'
import type { CoreErrorCode } from '../../../../_core/result/core-errors.ts'
import { ERROR_MESSAGES } from '../../../shared/error-codes.ts'
import { randInputText } from '../../../../_core/prices/rand-input.ts'
import type { PriceItem } from './price-list.ts'

export interface PriceField {
  amountText: string
  labelText: string
  hint: string | null
  changeAmount: (text: string) => void
  changeLabel: (text: string) => void
}

export interface PriceEditing {
  setPrice: (id: string, text: string) => Result<number, CoreErrorCode>
  renamePrice: (id: string, label: string) => void
}

export function usePriceField(item: PriceItem, editing: PriceEditing): PriceField {
  const [amountText, setAmountText] = useState(randInputText(item.cents))
  const [labelText, setLabelText] = useState(item.label)
  const [hint, setHint] = useState<string | null>(null)
  return { amountText, labelText, hint, changeAmount, changeLabel }

  function changeAmount(text: string): void {
    setAmountText(text)
    const set = editing.setPrice(item.id, text)
    setHint(set.ok ? null : ERROR_MESSAGES[set.code])
  }

  function changeLabel(text: string): void {
    setLabelText(text)
    editing.renamePrice(item.id, text)
  }
}
