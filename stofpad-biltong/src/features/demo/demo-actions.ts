/*
 * demo-actions.ts — what each Stofpad admin button does, in order: check
 * first, keep the photo in the browser, then change the products. Prices
 * are typed in rand and read by the shared reader; an empty pack price
 * means "to be confirmed", as the static demo's maize 1 kg pack was.
 * Hours, specials and Reset are the shared actions.
 */
import { succeed, fail } from '../../../../_core/result/result.ts'
import type { Result } from '../../../../_core/result/result.ts'
import type { CoreErrorCode } from '../../../../_core/result/core-errors.ts'
import { parseRand } from '../../../../_core/prices/rand-input.ts'
import { createContentActions } from '../../../../_core/demo/content-actions.ts'
import type { ContentActions } from '../../../../_core/demo/content-actions.ts'
import type { ActionDependencies as CoreActionDependencies } from '../../../../_core/demo/use-content-demo.ts'
import { ERROR_CODES } from '../../../shared/error-codes.ts'
import type { ErrorCode } from '../../../shared/error-codes.ts'
import { PRODUCT_CATEGORIES } from '../../content/catalogue.ts'
import { checkProductDraft, MAX_PRODUCTS, productById } from '../catalogue/products.ts'
import type { Product, ProductDraft } from '../catalogue/products.ts'
import type { DemoData } from '../storage/saved-demo.ts'
import type { DemoAction } from './demo-reducer.ts'

export interface DemoActions extends ContentActions {
  addProduct: (draft: ProductDraft, photo: Blob | null) => Promise<Result<true, ErrorCode>>
  removeProduct: (id: string) => Promise<void>
  setRate: (id: string, text: string) => Result<number, CoreErrorCode>
  setPackPrice: (id: string, grams: number, text: string) => Result<number | null, CoreErrorCode>
  setInStock: (id: string, inStock: boolean) => void
}

export type ActionDependencies = CoreActionDependencies<DemoData, DemoAction, ErrorCode>

// Validated before the first write: a refused product leaves nothing behind.
async function addProduct(deps: ActionDependencies, draft: ProductDraft, photo: Blob | null): Promise<Result<true, ErrorCode>> {
  const checked = checkProductDraft(draft, PRODUCT_CATEGORIES)
  if (!checked.ok) return checked
  if (photo == null) return fail(ERROR_CODES.PRODUCT_INVALID)
  if (deps.latestData().products.length >= MAX_PRODUCTS) return fail(ERROR_CODES.PRODUCTS_FULL)
  const photoId = crypto.randomUUID()
  const saved = await deps.store.savePhoto(photoId, photo)
  if (!saved.ok) return saved
  deps.keepPhotoUrl(photoId, photo)
  const product: Product = { id: crypto.randomUUID(), ...checked.value, photo: { kind: 'stored', photoId } }
  deps.dispatch({ type: 'productAdded', product })
  deps.markAdded(product.id)
  return succeed(true)
}

async function removeProduct(deps: ActionDependencies, id: string): Promise<void> {
  const product = productById(deps.latestData().products, id)
  deps.dispatch({ type: 'productRemoved', id })
  if (product?.photo.kind !== 'stored') return
  deps.dropPhotoUrl(product.photo.photoId)
  const deleted = await deps.store.deletePhoto(product.photo.photoId)
  if (!deleted.ok) deps.showNotice(deleted.code)
}

function setRate(deps: ActionDependencies, id: string, text: string): Result<number, CoreErrorCode> {
  const parsed = parseRand(text)
  if (parsed.ok) deps.dispatch({ type: 'rateSet', id, cents: parsed.value })
  return parsed
}

// An empty field leaves the pack's price "to be confirmed".
function setPackPrice(deps: ActionDependencies, id: string, grams: number, text: string): Result<number | null, CoreErrorCode> {
  if (text.trim() === '') {
    deps.dispatch({ type: 'packPriceSet', id, grams, cents: null })
    return succeed(null)
  }
  const parsed = parseRand(text)
  if (parsed.ok) deps.dispatch({ type: 'packPriceSet', id, grams, cents: parsed.value })
  return parsed
}

function setInStock(deps: ActionDependencies, id: string, inStock: boolean): void {
  deps.dispatch({ type: 'stockSet', id, inStock })
}

export function createDemoActions(deps: ActionDependencies): DemoActions {
  return {
    addProduct: addProduct.bind(null, deps),
    removeProduct: removeProduct.bind(null, deps),
    setRate: setRate.bind(null, deps),
    setPackPrice: setPackPrice.bind(null, deps),
    setInStock: setInStock.bind(null, deps),
    ...createContentActions(deps),
  }
}
