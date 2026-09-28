/*
 * OrderLines.tsx — the order's lines as fixed slots (the shared SlotList,
 * Nothing hops): removing a line fades the next into its place, so the
 * Remove button under the finger keeps its place and its focus, as the
 * static demo moved focus to the next Remove. Removing the last line
 * moves focus to the order's heading instead.
 */
import type { RefObject } from 'react'
import { SlotList } from '../../../_core/lists/SlotList.tsx'
import type { ShopWordKey } from '../content/i18n.ts'
import { productById } from '../features/catalogue/products.ts'
import type { Language, Product, Selection } from '../features/catalogue/products.ts'
import { linePrice, money, weight } from '../features/order/order.ts'
import type { Order } from '../features/order/use-order.ts'
import { QuantityField } from './QuantityField.tsx'

interface OrderLinesProps {
  order: Order
  products: Product[]
  language: Language
  t: Record<ShopWordKey, string>
  heading: RefObject<HTMLHeadingElement | null>
}

const CLOSING_SHAPE = <div className="order-line" />

function lineKey(line: Selection): string {
  return `${line.id}-${line.grams}-${line.option}`
}

export function OrderLines({ order, products, language, t, heading }: OrderLinesProps) {
  function renderLine(line: Selection, index: number) {
    const product = productById(products, line.id)
    if (product == null) return null
    const price = linePrice(line, product)
    const describe = `${product.name[language]}, ${weight(line.grams)} ${line.option}`

    function remove(): void {
      order.remove(line)
      if (index >= order.lines.length - 1) heading.current?.focus()
    }

    function changeQuantity(quantity: number): void {
      order.changeQuantity(line, quantity)
    }

    return (
      <article className="order-line" key={lineKey(line)}>
        <div className="order-line-text">
          <h3 className="line-title">{product.name[language]}</h3>
          <p className="line-meta">{`${weight(line.grams)}${line.option ? ` · ${line.option}` : ''}`}</p>
          <strong className="line-price">{price === null ? t.pending : money(price)}</strong>
        </div>
        <div className="line-controls">
          <QuantityField key={lineKey(line)} id={`quantity-${index}`} quantity={line.quantity} label={t.quantity} ariaLabel={`${t.quantity}: ${describe}`} onChange={changeQuantity} />
          <button type="button" className="line-remove" onClick={remove} data-resizes-list="" aria-label={`${t.remove}: ${describe}`}>
            {t.remove}
          </button>
        </div>
      </article>
    )
  }

  return <SlotList items={order.lines} className="order-lines" slotClassName="order-slot" renderItem={renderLine} closingShape={CLOSING_SHAPE} empty={<p className="empty-order">{t.empty}</p>} />
}
