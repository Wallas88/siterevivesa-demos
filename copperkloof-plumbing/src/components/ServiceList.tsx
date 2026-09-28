/*
 * ServiceList.tsx — the website's "What we do" section: each service with
 * its example price from the owner's price list, so a price edited in the
 * admin shows here at once.
 */
import { SERVICES } from '../content/business.ts'
import type { Service } from '../content/business.ts'
import { formatRand, priceFor } from '../features/prices/price-list.ts'
import type { PriceItem } from '../features/prices/price-list.ts'

interface ServiceListProps {
  prices: PriceItem[]
}

export function ServiceList({ prices }: ServiceListProps) {
  function renderService(service: Service) {
    const price = priceFor(prices, service.priceId)
    return (
      <li className="service-card" key={service.priceId}>
        <h3 className="service-name">{service.name}</h3>
        <p className="service-summary">{service.summary}</p>
        {price != null && (
          <p className="service-price">
            {price.label}: {formatRand(price.cents)}
          </p>
        )}
      </li>
    )
  }

  return (
    <section className="site-section" id="services">
      <h2 className="site-section-title">What we do</h2>
      <p className="site-section-lead">Example prices, set by the owner in the admin.</p>
      <ul className="service-grid">{SERVICES.map(renderService)}</ul>
    </section>
  )
}
