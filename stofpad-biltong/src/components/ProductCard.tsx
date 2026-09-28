/*
 * ProductCard.tsx — one product in the rail: photo, category, name,
 * description, the rate per kg (weight products), the weight or pack and
 * preparation choices, the live estimated price, and Add to order. An
 * out-of-stock product says so on its button (the label keeps its width)
 * and cannot be added. Every card is the same height whatever it holds
 * (two-line title and description, the rate and preparation rows kept),
 * so the rail never changes height when the owner adds or removes one.
 */
import type { ChangeEvent } from 'react'
import { photoSrc } from '../../../_core/photos/photo-urls.ts'
import type { PhotoUrls } from '../../../_core/photos/photo-urls.ts'
import { SwapLabel } from '../../../_core/controls/SwapLabel.tsx'
import { CATEGORIES, isCategory } from '../content/catalogue.ts'
import type { ShopWordKey } from '../content/i18n.ts'
import { MISSING_PHOTO_SRC } from '../content/business.ts'
import { sizesFor } from '../features/catalogue/products.ts'
import type { Language, Product, Selection } from '../features/catalogue/products.ts'
import { linePrice, money, weight } from '../features/order/order.ts'

interface ProductCardProps {
  product: Product
  selection: Selection
  language: Language
  t: Record<ShopWordKey, string>
  photoUrls: PhotoUrls
  weights: number[]
  onChoose: (product: Product, change: Partial<Pick<Selection, 'grams' | 'option'>>) => void
  onAdd: (product: Product) => void
}

const PHOTO_WIDTH = 480
const PHOTO_HEIGHT = 360

function sizeLabel(product: Product, grams: number, t: Record<ShopWordKey, string>): string {
  const pack = product.packs?.find(isSize)
  if (pack == null) return weight(grams)
  return `${weight(grams)} — ${pack.cents === null ? t.pending : money(pack.cents)}`

  function isSize(candidate: { grams: number }): boolean {
    return candidate.grams === grams
  }
}

function categoryName(category: string, language: Language): string {
  return isCategory(category) ? CATEGORIES[category][language] : category
}

export function ProductCard({ product, selection, language, t, photoUrls, weights, onChoose, onAdd }: ProductCardProps) {
  const price = linePrice(selection, product)

  function chooseSize(event: ChangeEvent<HTMLSelectElement>): void {
    onChoose(product, { grams: Number(event.target.value) })
  }

  function chooseOption(event: ChangeEvent<HTMLSelectElement>): void {
    onChoose(product, { option: event.target.value })
  }

  function add(): void {
    onAdd(product)
  }

  function renderSize(grams: number) {
    return (
      <option key={grams} value={grams}>
        {sizeLabel(product, grams, t)}
      </option>
    )
  }

  function renderOption(option: string) {
    return (
      <option key={option} value={option}>
        {option}
      </option>
    )
  }

  return (
    <article className={product.inStock ? 'product' : 'product is-out'} data-id={product.id}>
      <img src={photoSrc(product.photo, photoUrls, MISSING_PHOTO_SRC)} alt={product.name[language]} width={PHOTO_WIDTH} height={PHOTO_HEIGHT} loading="lazy" decoding="async" />
      <div className="product-body">
        <p className="eyebrow">{categoryName(product.category, language)}</p>
        <h3 className="card-title">{product.name[language]}</h3>
        <p className="product-description">{product.description[language]}</p>
        <p className="rate" data-empty={product.pricePerKg == null}>
          {product.pricePerKg == null ? '' : `${money(product.pricePerKg)} / kg`}
        </p>
        <label className="product-label" htmlFor={`size-${product.id}`}>
          {t.size}
        </label>
        <select className="product-select" id={`size-${product.id}`} value={selection.grams} onChange={chooseSize}>
          {sizesFor(product, weights).map(renderSize)}
        </select>
        <div className="product-options" data-empty={product.options.length === 0} inert={product.options.length === 0}>
          <label className="product-label" htmlFor={`option-${product.id}`}>
            {t.preparation}
          </label>
          <select className="product-select" id={`option-${product.id}`} value={selection.option} onChange={chooseOption}>
            {product.options.length === 0 ? <option value="" /> : product.options.map(renderOption)}
          </select>
        </div>
        <div className="product-bottom">
          <p className="product-price" aria-live="polite">
            {price === null ? t.pending : `${t.estimate}: ${money(price)}`}
          </p>
          <button className="button button-primary product-add" type="button" onClick={add} disabled={!product.inStock} data-resizes-list="">
            <SwapLabel labels={[t.add, t.outOfStock]} shown={product.inStock ? 0 : 1} />
          </button>
        </div>
      </div>
    </article>
  )
}
