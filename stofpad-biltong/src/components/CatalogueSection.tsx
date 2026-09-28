/*
 * CatalogueSection.tsx — "Our biltong & products": the category filters
 * (controls above the rail, so switching moves nothing above it), the
 * product count, and the product rail. Switching category starts the rail
 * at its first card again and fades the new cards in.
 */
import { useState } from 'react'
import type { PhotoUrls } from '../../../_core/photos/photo-urls.ts'
import { CATEGORIES, PRODUCT_CATEGORIES } from '../content/catalogue.ts'
import type { CategoryFilter } from '../content/catalogue.ts'
import type { ShopWordKey } from '../content/i18n.ts'
import type { Language, Product, Selection } from '../features/catalogue/products.ts'
import type { Selections } from '../features/order/use-selections.ts'
import { CardRail } from './CardRail.tsx'
import { ProductCard } from './ProductCard.tsx'

interface CatalogueSectionProps {
  products: Product[]
  selections: Selections
  language: Language
  t: Record<ShopWordKey, string>
  photoUrls: PhotoUrls
  weights: number[]
  onAdd: (product: Product) => void
}

const FILTERS: CategoryFilter[] = ['all', ...PRODUCT_CATEGORIES]

function inCategory(products: Product[], category: CategoryFilter): Product[] {
  return category === 'all' ? products : products.filter(isInCategory)

  function isInCategory(product: Product): boolean {
    return product.category === category
  }
}

export function CatalogueSection({ products, selections, language, t, photoUrls, weights, onAdd }: CatalogueSectionProps) {
  const [category, setCategory] = useState<CategoryFilter>('all')
  const visible = inCategory(products, category)

  function renderFilter(filter: CategoryFilter) {
    function choose(): void {
      setCategory(filter)
    }

    return (
      <button type="button" className="category-filter" key={filter} aria-pressed={filter === category} aria-controls="product-list" onClick={choose}>
        {CATEGORIES[filter][language]}
      </button>
    )
  }

  function renderProduct(product: Product) {
    const selection: Selection = selections.selectionFor(product)
    return <ProductCard key={product.id} product={product} selection={selection} language={language} t={t} photoUrls={photoUrls} weights={weights} onChoose={selections.choose} onAdd={onAdd} />
  }

  return (
    <section className="catalogue" id="products" aria-labelledby="catalogue-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t.good}</p>
          <h2 id="catalogue-heading" className="section-title">
            {t.catalogue}
          </h2>
        </div>
        <p className="section-note">{t.catalogueIntro}</p>
      </div>
      <div className="catalogue-toolbar">
        <div className="category-filters" role="group" aria-label={t.filter}>
          {FILTERS.map(renderFilter)}
        </div>
        <span className="product-count" role="status">{`${visible.length} ${t.allCount}`}</span>
      </div>
      <p className="swipe-hint">{t.swipe}</p>
      <CardRail key={category} id="product-list" className="products" labelledBy="catalogue-heading" cardCount={visible.length} words={{ previous: t.previous, next: t.next, name: t.productsRail }}>
        {visible.map(renderProduct)}
      </CardRail>
    </section>
  )
}
