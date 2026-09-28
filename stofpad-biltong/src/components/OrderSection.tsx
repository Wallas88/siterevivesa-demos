/*
 * OrderSection.tsx — "Your favourites, together.": the order's lines, a
 * note when some are left out because they went out of stock, and the
 * summary with the WhatsApp hand-off (the one demo allowed to contact
 * anyone: SiteReviveSA's own number, Waldo, 21 Sep 2026).
 */
import { useRef } from 'react'
import type { ShopWordKey } from '../content/i18n.ts'
import type { Language, Product } from '../features/catalogue/products.ts'
import type { Order } from '../features/order/use-order.ts'
import { OrderLines } from './OrderLines.tsx'
import { OrderSummary } from './OrderSummary.tsx'

interface OrderSectionProps {
  order: Order
  products: Product[]
  language: Language
  courierCents: number
  t: Record<ShopWordKey, string>
}

export function OrderSection({ order, products, language, courierCents, t }: OrderSectionProps) {
  const heading = useRef<HTMLHeadingElement | null>(null)

  return (
    <section id="order" className="order-section" aria-labelledby="order-heading">
      <div className="order-intro">
        <p className="eyebrow">{t.order}</p>
        <h2 id="order-heading" className="section-title" tabIndex={-1} ref={heading}>
          {t.orderHeading}
        </h2>
        <p className="section-note">{t.confirmation}</p>
      </div>
      <div className="order-panel">
        <OrderLines order={order} products={products} language={language} t={t} heading={heading} />
        <p className="small-note left-out-note" data-shown={order.leftOut > 0}>
          {t.outOfStockNote}
        </p>
        <OrderSummary order={order} courierCents={courierCents} t={t} />
      </div>
    </section>
  )
}
