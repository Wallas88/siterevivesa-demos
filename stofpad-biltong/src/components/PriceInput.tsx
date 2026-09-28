/*
 * PriceInput.tsx — one price field in the product list (per kg, or one
 * pack), with a hint line kept for a typing slip. An empty pack price
 * reads as "to be confirmed", shown as the field's placeholder.
 */
import type { ChangeEvent } from 'react'
import type { Result } from '../../../_core/result/result.ts'
import type { CoreErrorCode } from '../../../_core/result/core-errors.ts'
import { usePriceField } from '../features/catalogue/use-price-field.ts'

interface PriceInputProps {
  id: string
  label: string
  startText: string
  placeholder: string
  errors: Record<CoreErrorCode, string>
  save: (text: string) => Result<unknown, CoreErrorCode>
}

export function PriceInput({ id, label, startText, placeholder, errors, save }: PriceInputProps) {
  const field = usePriceField(startText, save)

  function change(event: ChangeEvent<HTMLInputElement>): void {
    field.change(event.target.value)
  }

  return (
    <label className="field price-input">
      <span className="field-label">{label}</span>
      <input className="field-input" id={id} value={field.text} onChange={change} inputMode="decimal" placeholder={placeholder} aria-invalid={field.hint != null} aria-describedby={`${id}-hint`} />
      <span className="price-hint" id={`${id}-hint`}>
        {field.hint == null ? '' : errors[field.hint]}
      </span>
    </label>
  )
}
