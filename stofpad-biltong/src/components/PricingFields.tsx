/*
 * PricingFields.tsx — how a new product is sold: by weight (price per kg)
 * or by pack (a size and its price). The pack size is greyed rather than
 * hidden when selling by weight, and the price's label changes in place,
 * so choosing moves nothing.
 */
import type { ChangeEvent } from 'react'
import type { AdminWords } from '../content/admin-words.ts'
import { PACK_SIZES } from '../features/catalogue/products.ts'
import type { Pricing, ProductDraft } from '../features/catalogue/products.ts'
import { weight } from '../features/order/order.ts'

interface PricingFieldsProps {
  draft: ProductDraft
  words: AdminWords
  onChange: <Field extends keyof ProductDraft>(field: Field, value: ProductDraft[Field]) => void
}

function isPricing(value: string): value is Pricing {
  return value === 'weight' || value === 'pack'
}

function renderPackSize(grams: number) {
  return (
    <option key={grams} value={grams}>
      {weight(grams)}
    </option>
  )
}

export function PricingFields({ draft, words, onChange }: PricingFieldsProps) {
  const byWeight = draft.pricing === 'weight'

  function changePricing(event: ChangeEvent<HTMLSelectElement>): void {
    if (isPricing(event.target.value)) onChange('pricing', event.target.value)
  }

  function changePackSize(event: ChangeEvent<HTMLSelectElement>): void {
    onChange('packGrams', Number(event.target.value))
  }

  function changePrice(event: ChangeEvent<HTMLInputElement>): void {
    onChange('priceText', event.target.value)
  }

  return (
    <>
      <div className="product-form-pricing">
        <label className="field">
          <span className="field-label">{words.soldBy}</span>
          <select className="field-input" name="product-pricing" value={draft.pricing} onChange={changePricing}>
            <option value="weight">{words.byWeight}</option>
            <option value="pack">{words.byPack}</option>
          </select>
        </label>
        <label className="field">
          <span className="field-label">{words.packSize}</span>
          <select className="field-input" name="product-pack" value={draft.packGrams} onChange={changePackSize} disabled={byWeight}>
            {PACK_SIZES.map(renderPackSize)}
          </select>
        </label>
      </div>
      <label className="field">
        <span className="field-label">{byWeight ? words.pricePerKg : words.packPrice}</span>
        <input className="field-input" name="product-price" value={draft.priceText} onChange={changePrice} inputMode="decimal" required />
      </label>
    </>
  )
}
