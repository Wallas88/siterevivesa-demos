/*
 * use-product-form.ts — the "Add a product" form's fields, photo and
 * sending: it hands the draft and the shrunk photo to the demo's
 * addProduct, keeps why a draft was refused (as a code the form puts into
 * words), and empties the form after a product is added.
 */
import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Result } from '../../../../_core/result/result.ts'
import { usePhotoPick } from '../../../../_core/photos/use-photo-pick.ts'
import type { PhotoPick } from '../../../../_core/photos/use-photo-pick.ts'
import type { ErrorCode } from '../../../shared/error-codes.ts'
import { PRODUCT_CATEGORIES } from '../../content/catalogue.ts'
import { PACK_SIZES } from './products.ts'
import type { ProductDraft } from './products.ts'

export type FormStatus = { kind: 'idle' } | { kind: 'sending' } | { kind: 'added' } | { kind: 'failed'; code: ErrorCode }

export interface ProductForm {
  draft: ProductDraft
  photo: PhotoPick
  status: FormStatus
  setField: <Field extends keyof ProductDraft>(field: Field, value: ProductDraft[Field]) => void
  submit: (event: FormEvent<HTMLFormElement>) => Promise<void>
}

const EMPTY_DRAFT: ProductDraft = { name: '', description: '', category: PRODUCT_CATEGORIES[0] ?? '', pricing: 'weight', priceText: '', packGrams: PACK_SIZES[0] ?? 0 }

export function useProductForm(addProduct: (draft: ProductDraft, photo: Blob | null) => Promise<Result<true, ErrorCode>>): ProductForm {
  const [draft, setDraft] = useState<ProductDraft>(EMPTY_DRAFT)
  const [status, setStatus] = useState<FormStatus>({ kind: 'idle' })
  const photo = usePhotoPick()
  return { draft, photo, status, setField, submit }

  function setField<Field extends keyof ProductDraft>(field: Field, value: ProductDraft[Field]): void {
    setDraft(withField)

    function withField(current: ProductDraft): ProductDraft {
      return { ...current, [field]: value }
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setStatus({ kind: 'sending' })
    const added = await addProduct(draft, photo.photo)
    if (!added.ok) return setStatus({ kind: 'failed', code: added.code })
    setDraft(EMPTY_DRAFT)
    photo.clear()
    setStatus({ kind: 'added' })
  }
}
