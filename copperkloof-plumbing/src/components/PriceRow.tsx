/*
 * PriceRow.tsx — one item in the price editor: its name and its amount in
 * rand. A typing slip shows a hint in the space kept under the row, and
 * the website keeps the last good price meanwhile.
 */
import type { ChangeEvent } from 'react'
import { MAX_LABEL_LENGTH } from '../features/prices/price-list.ts'
import type { PriceItem } from '../features/prices/price-list.ts'
import { usePriceField } from '../features/prices/use-price-field.ts'
import type { PriceEditing } from '../features/prices/use-price-field.ts'

interface PriceRowProps {
  item: PriceItem
  editing: PriceEditing
}

export function PriceRow({ item, editing }: PriceRowProps) {
  const field = usePriceField(item, editing)
  const hintId = `price-hint-${item.id}`

  function changeLabel(event: ChangeEvent<HTMLInputElement>): void {
    field.changeLabel(event.target.value)
  }

  function changeAmount(event: ChangeEvent<HTMLInputElement>): void {
    field.changeAmount(event.target.value)
  }

  return (
    <li className="price-row">
      <label className="field price-row-label">
        <span className="field-label">Item</span>
        <input className="field-input" value={field.labelText} onChange={changeLabel} maxLength={MAX_LABEL_LENGTH} />
      </label>
      <label className="field price-row-amount">
        <span className="field-label">Price (R)</span>
        <input className="field-input" value={field.amountText} onChange={changeAmount} inputMode="decimal" aria-invalid={field.hint != null} aria-describedby={hintId} />
      </label>
      <p className="price-row-hint" id={hintId}>
        {field.hint ?? ''}
      </p>
    </li>
  )
}
