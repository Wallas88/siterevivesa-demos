/*
 * demo-reducer.ts — every change the admin can make to Stofpad's content,
 * as one pure reducer over products, hours and specials. The shop and the
 * admin both read the result, which is why a change shows in the shop and
 * in the WhatsApp message at once. Tested in tests/demo-reducer.test.ts.
 */
import { SEED_HOURS, SEED_PRODUCTS, SEED_SPECIALS } from '../../content/seed.ts'
import { contentReducer } from '../../../../_core/demo/content-reducer.ts'
import type { ContentAction } from '../../../../_core/demo/content-reducer.ts'
import { addProduct, removeProduct, setInStock, setPackPrice, setRate } from '../catalogue/products.ts'
import type { Product } from '../catalogue/products.ts'
import type { DemoData } from '../storage/saved-demo.ts'

export type DemoAction =
  | { type: 'loaded'; data: DemoData }
  | { type: 'productAdded'; product: Product }
  | { type: 'productRemoved'; id: string }
  | { type: 'rateSet'; id: string; cents: number }
  | { type: 'packPriceSet'; id: string; grams: number; cents: number | null }
  | { type: 'stockSet'; id: string; inStock: boolean }
  | ContentAction
  | { type: 'reset' }

export function seedData(): DemoData {
  return { products: SEED_PRODUCTS, hours: SEED_HOURS, specials: SEED_SPECIALS, team: null }
}

function withProducts(data: DemoData, products: Product[]): DemoData {
  return products === data.products ? data : { ...data, products }
}

export function demoReducer(data: DemoData, action: DemoAction): DemoData {
  switch (action.type) {
    case 'loaded':
      return action.data
    case 'productAdded': {
      const added = addProduct(data.products, action.product)
      return added.ok ? withProducts(data, added.value) : data
    }
    case 'productRemoved':
      return withProducts(data, removeProduct(data.products, action.id))
    case 'rateSet':
      return withProducts(data, setRate(data.products, action.id, action.cents))
    case 'packPriceSet':
      return withProducts(data, setPackPrice(data.products, action.id, action.grams, action.cents))
    case 'stockSet':
      return withProducts(data, setInStock(data.products, action.id, action.inStock))
    case 'reset':
      return seedData()
    default:
      return contentReducer(data, action)
  }
}
