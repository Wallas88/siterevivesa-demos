/*
 * ProductRow.tsx — what one slot of the owner's product list shows: its
 * photo and name, then In stock / Out of stock and Remove at the top of
 * the row (so they stay put whatever the row below them holds; out of stock
 * can drop a line from the order, so it counts as resizing a list), then its
 * prices: per kg, or one field per pack. Keyed by product, so a product
 * moving into this slot brings its own fields.
 */
import { randInputText } from '../../../_core/prices/rand-input.ts'
import { photoSrc } from '../../../_core/photos/photo-urls.ts'
import type { PhotoUrls } from '../../../_core/photos/photo-urls.ts'
import { SwapLabel } from '../../../_core/controls/SwapLabel.tsx'
import { MISSING_PHOTO_SRC } from '../content/business.ts'
import { ERROR_MESSAGES } from '../../shared/error-codes.ts'
import type { Result } from '../../../_core/result/result.ts'
import type { CoreErrorCode } from '../../../_core/result/core-errors.ts'
import type { AdminWords } from '../content/admin-words.ts'
import type { Words } from '../content/words.ts'
import type { DemoActions } from '../features/demo/demo-actions.ts'
import type { Language, Pack, Product } from '../features/catalogue/products.ts'
import { weight } from '../features/order/order.ts'
import { PriceInput } from './PriceInput.tsx'

interface ProductRowProps {
  product: Product
  language: Language
  words: Words
  photoUrls: PhotoUrls
  actions: DemoActions
}

const THUMB_WIDTH = 64
const THUMB_HEIGHT = 48

function stockLabel(product: Product, admin: AdminWords): string {
  return product.inStock ? admin.inStock : admin.outOfStock
}

export function ProductRow({ product, language, words, photoUrls, actions }: ProductRowProps) {
  const admin = words.admin
  const name = product.name[language]

  function toggleStock(): void {
    actions.setInStock(product.id, !product.inStock)
  }

  function remove(): void {
    void actions.removeProduct(product.id)
  }

  function saveRate(text: string): Result<unknown, CoreErrorCode> {
    return actions.setRate(product.id, text)
  }

  function renderPack(pack: Pack) {
    function savePack(text: string): Result<unknown, CoreErrorCode> {
      return actions.setPackPrice(product.id, pack.grams, text)
    }

    const startText = pack.cents === null ? '' : randInputText(pack.cents)
    return <PriceInput key={pack.grams} id={`price-${product.id}-${pack.grams}`} label={`${weight(pack.grams)} (R)`} startText={startText} placeholder={admin.pending} errors={ERROR_MESSAGES[language]} save={savePack} />
  }

  return (
    <div className="product-row" key={product.id}>
      <div className="product-row-top">
        <img className="product-row-thumb" src={photoSrc(product.photo, photoUrls, MISSING_PHOTO_SRC)} alt="" width={THUMB_WIDTH} height={THUMB_HEIGHT} loading="lazy" />
        <p className="slot-title">{name}</p>
        <button type="button" className="button button-secondary stock-toggle" onClick={toggleStock} data-resizes-list="" aria-pressed={!product.inStock} aria-label={`${name}: ${stockLabel(product, admin)}`}>
          <SwapLabel labels={[admin.inStock, admin.outOfStock]} shown={product.inStock ? 0 : 1} />
        </button>
        <button type="button" className="button button-secondary product-remove" onClick={remove} data-resizes-list="" aria-label={`${admin.remove}: ${name}`}>
          {admin.remove}
        </button>
      </div>
      <div className="product-row-prices">
        {product.packs == null ? (
          <PriceInput id={`price-${product.id}`} label={admin.pricePerKg} startText={randInputText(product.pricePerKg ?? 0)} placeholder="" errors={ERROR_MESSAGES[language]} save={saveRate} />
        ) : (
          product.packs.map(renderPack)
        )}
      </div>
    </div>
  )
}
