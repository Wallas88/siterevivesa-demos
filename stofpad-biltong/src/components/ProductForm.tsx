/*
 * ProductForm.tsx — "Add a product" from the phone: a photo (camera or
 * files), a name, one optional line, a category, and how it is sold (by
 * weight with a price per kg, or by pack with a size and price:
 * PricingFields.tsx). The product shows in the shop the moment it is
 * added.
 */
import type { ChangeEvent, FormEvent } from 'react'
import { PhotoPicker } from '../../../_core/photos/PhotoPicker.tsx'
import { SwapLabel } from '../../../_core/controls/SwapLabel.tsx'
import { CATEGORIES, PRODUCT_CATEGORIES } from '../content/catalogue.ts'
import type { Category } from '../content/catalogue.ts'
import type { Words } from '../content/words.ts'
import { ERROR_MESSAGES } from '../../shared/error-codes.ts'
import { MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH } from '../features/catalogue/products.ts'
import type { Language } from '../features/catalogue/products.ts'
import type { DemoActions } from '../features/demo/demo-actions.ts'
import { useProductForm } from '../features/catalogue/use-product-form.ts'
import type { FormStatus } from '../features/catalogue/use-product-form.ts'
import { PricingFields } from './PricingFields.tsx'

interface ProductFormProps {
  addProduct: DemoActions['addProduct']
  disabled: boolean
  language: Language
  words: Words
  onShowNew: () => void
}

function statusText(status: FormStatus, language: Language): string {
  return status.kind === 'failed' ? ERROR_MESSAGES[language][status.code] : ''
}

export function ProductForm({ addProduct, disabled, language, words, onShowNew }: ProductFormProps) {
  const form = useProductForm(addProduct)
  const admin = words.admin

  function sendForm(event: FormEvent<HTMLFormElement>): void {
    void form.submit(event)
  }

  function change(field: 'name' | 'description' | 'category') {
    return changeText

    function changeText(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
      form.setField(field, event.target.value)
    }
  }

  function renderCategory(category: Category) {
    return (
      <option key={category} value={category}>
        {CATEGORIES[category][language]}
      </option>
    )
  }

  return (
    <form className="product-form" onSubmit={sendForm}>
      <PhotoPicker pick={form.photo} disabled={disabled} words={words.photo} />
      <label className="field">
        <span className="field-label">{admin.name}</span>
        <input className="field-input" name="product-name" value={form.draft.name} onChange={change('name')} maxLength={MAX_NAME_LENGTH} required placeholder={admin.namePlaceholder} />
      </label>
      <label className="field">
        <span className="field-label">{admin.description}</span>
        <input className="field-input" name="product-description" value={form.draft.description} onChange={change('description')} maxLength={MAX_DESCRIPTION_LENGTH} />
      </label>
      <label className="field">
        <span className="field-label">{admin.category}</span>
        <select className="field-input" name="product-category" value={form.draft.category} onChange={change('category')}>
          {PRODUCT_CATEGORIES.map(renderCategory)}
        </select>
      </label>
      <PricingFields draft={form.draft} words={admin} onChange={form.setField} />
      <button type="submit" className="button button-primary" disabled={disabled || form.status.kind === 'sending' || form.photo.busy}>
        <SwapLabel labels={[admin.add, admin.adding]} shown={form.status.kind === 'sending' ? 1 : 0} />
      </button>
      <div className="form-status">
        {form.status.kind === 'added' ? (
          <button type="button" className="button button-secondary" onClick={onShowNew}>
            {admin.added}
          </button>
        ) : (
          <p role="status">{statusText(form.status, language)}</p>
        )}
      </div>
    </form>
  )
}
