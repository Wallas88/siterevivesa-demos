/*
 * QuantityField.tsx — a line's quantity, 1 to 99. The visitor types
 * freely; a whole number in range changes the order at once, and anything
 * else goes back to the line's quantity when the field is left, as the
 * static demo did.
 */
import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { isQuantity } from '../features/order/order-lines.ts'
import { MAX_QUANTITY } from '../features/order/order.ts'

interface QuantityFieldProps {
  id: string
  quantity: number
  label: string
  ariaLabel: string
  onChange: (quantity: number) => void
}

export function QuantityField({ id, quantity, label, ariaLabel, onChange }: QuantityFieldProps) {
  const [text, setText] = useState(String(quantity))

  function change(event: ChangeEvent<HTMLInputElement>): void {
    setText(event.target.value)
    const typed = Number(event.target.value)
    if (event.target.value.trim() !== '' && isQuantity(typed)) onChange(typed)
  }

  function restore(): void {
    setText(String(quantity))
  }

  return (
    <>
      <label className="line-label" htmlFor={id}>
        {label}
      </label>
      <input className="line-quantity" id={id} type="number" min={1} max={MAX_QUANTITY} step={1} value={text} onChange={change} onBlur={restore} aria-label={ariaLabel} />
    </>
  )
}
