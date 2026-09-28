/*
 * OrderSummary.tsx — the courier choice (its price comes from the same
 * setting the order charges), the total or known subtotal, the pending
 * note, the message to review and the WhatsApp button. It eases open when
 * the first line is added and closed when the last goes, instead of
 * snapping as the static demo's hidden block did.
 */
import type { ChangeEvent } from 'react'
import type { ShopWordKey } from '../content/i18n.ts'
import { money } from '../features/order/order.ts'
import type { Order } from '../features/order/use-order.ts'
import { MessageFold } from './MessageFold.tsx'

interface OrderSummaryProps {
  order: Order
  courierCents: number
  t: Record<ShopWordKey, string>
}

export function OrderSummary({ order, courierCents, t }: OrderSummaryProps) {
  const open = order.lines.length > 0

  function chooseCourier(event: ChangeEvent<HTMLInputElement>): void {
    order.setCourier(event.target.checked)
  }

  return (
    <div className="order-summary" data-open={open}>
      <div className="fold-inner" inert={!open}>
        <label className="courier-option">
          <input className="courier-box" type="checkbox" checked={order.courier} onChange={chooseCourier} />
          <span>{`${t.courier} — ${money(courierCents)}`}</span>
        </label>
        <p className="small-note">{t.deliveryNote}</p>
        <div className="order-total" aria-live="polite">
          <span>{order.totals.pending ? t.known : t.total}</span>
          <strong className="order-total-amount">{money(order.totals.cents)}</strong>
        </div>
        <p className="small-note pending-note" data-shown={order.totals.pending}>
          {t.excludes}
        </p>
        <MessageFold label={t.review} message={order.message} />
        <a className="button button-primary whatsapp-order" href={order.link} target="_blank" rel="noreferrer">
          {t.whatsapp}
        </a>
      </div>
    </div>
  )
}
