/*
 * ProductList.tsx — the owner's products as fixed slots (the shared
 * SlotList, Nothing hops): removing one fades the next into its place and
 * only the end of the list eases closed. The whole list is keyed by the
 * reset count in AdminPanel, so Reset brings typed prices back too.
 */
import { SlotList } from '../../../_core/lists/SlotList.tsx'
import type { PhotoUrls } from '../../../_core/photos/photo-urls.ts'
import type { Words } from '../content/words.ts'
import type { DemoActions } from '../features/demo/demo-actions.ts'
import type { Language, Product } from '../features/catalogue/products.ts'
import { ProductRow } from './ProductRow.tsx'

interface ProductListProps {
  products: Product[]
  language: Language
  words: Words
  photoUrls: PhotoUrls
  actions: DemoActions
}

const CLOSING_SHAPE = <div className="product-row-top" />

export function ProductList({ products, language, words, photoUrls, actions }: ProductListProps) {
  function renderProduct(product: Product) {
    return <ProductRow key={product.id} product={product} language={language} words={words} photoUrls={photoUrls} actions={actions} />
  }

  return <SlotList items={products} className="slot-list" slotClassName="slot" renderItem={renderProduct} closingShape={CLOSING_SHAPE} empty={<p className="slot-list-empty">{words.admin.empty}</p>} />
}
