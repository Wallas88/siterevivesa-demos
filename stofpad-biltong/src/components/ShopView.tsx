/*
 * ShopView.tsx — the whole shop the visitor sees, in the static demo's
 * order: header, hero, specials, products, order, how to order, and (new)
 * opening hours, then the footer. The shop is a size container, so on a
 * wide screen beside the admin it lays itself out for the width it has.
 * A language change fades the main content in again.
 */
import type { PhotoUrls } from '../../../_core/photos/photo-urls.ts'
import type { ShopWordKey } from '../content/i18n.ts'
import type { Words } from '../content/words.ts'
import { SETTINGS } from '../content/catalogue.ts'
import type { Language, Product } from '../features/catalogue/products.ts'
import type { DemoData } from '../features/storage/saved-demo.ts'
import type { Order } from '../features/order/use-order.ts'
import type { Selections } from '../features/order/use-selections.ts'
import { StofpadSprite } from './StofpadMark.tsx'
import { ShopHeader } from './ShopHeader.tsx'
import { Hero } from './Hero.tsx'
import { SpecialsSection } from './SpecialsSection.tsx'
import { CatalogueSection } from './CatalogueSection.tsx'
import { OrderSection } from './OrderSection.tsx'
import { HowSection } from './HowSection.tsx'
import { ShopHours } from './ShopHours.tsx'
import { ShopFooter } from './ShopFooter.tsx'

interface ShopViewProps {
  data: DemoData
  photoUrls: PhotoUrls
  today: string
  language: Language
  t: Record<ShopWordKey, string>
  words: Words
  order: Order
  selections: Selections
  onChooseLanguage: (language: Language) => void
  onAdd: (product: Product) => void
}

function countItems(order: Order): number {
  return order.lines.reduce(addQuantity, 0)

  function addQuantity(sum: number, line: { quantity: number }): number {
    return sum + line.quantity
  }
}

export function ShopView({ data, photoUrls, today, language, t, words, order, selections, onChooseLanguage, onAdd }: ShopViewProps) {
  return (
    <div className="shop">
      <StofpadSprite />
      <a className="skip-link" href="#products">
        {t.skip}
      </a>
      <ShopHeader t={t} language={language} onChooseLanguage={onChooseLanguage} orderCount={countItems(order)} />
      <main className="shop-main" key={language}>
        <Hero t={t} />
        <SpecialsSection specials={data.specials} today={today} language={language} t={t} dateWords={words.specials.endDate} />
        <CatalogueSection products={data.products} selections={selections} language={language} t={t} photoUrls={photoUrls} weights={SETTINGS.weights} onAdd={onAdd} />
        <OrderSection order={order} products={data.products} language={language} courierCents={SETTINGS.courierCents} t={t} />
        <HowSection t={t} />
        <ShopHours hours={data.hours} words={words.hours} t={t} />
      </main>
      <ShopFooter />
    </div>
  )
}
