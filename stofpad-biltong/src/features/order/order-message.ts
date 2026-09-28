/*
 * order-message.ts — the WhatsApp message and link for an order, word for
 * word as the static demo built them (order.mjs and script.js, 21 Sep
 * 2026), in English or Afrikaans. It always ends "Sent from the Stofpad
 * Biltong demo on siterevivesa.com." (or the Afrikaans), and the link goes
 * to SiteReviveSA's own number: the one demo allowed to contact anyone
 * (Waldo, 21 Sep 2026). Tested against the old outputs character for
 * character (tests/order-message.test.ts).
 */
import { productById } from '../catalogue/products.ts'
import type { Language, Product, Selection } from '../catalogue/products.ts'
import { linePrice, money, totals, weight } from './order.ts'
import type { OrderSettings, OrderTotals } from './order.ts'

const MESSAGE_WORDS = {
  en: {
    greeting: 'Hi Stofpad Biltong (demo), I would like to order:',
    pending: 'Price to be confirmed',
    courier: 'Courier (subject to confirmation)',
    collection: 'Collection / arrange directly with the shop',
    known: 'Known subtotal',
    total: 'Estimated total',
    excludes: 'Excludes products with prices still to be confirmed.',
    confirm: 'Please confirm availability, final packed weight, delivery and payment.',
    sentFrom: 'Sent from the Stofpad Biltong demo on siterevivesa.com.',
  },
  af: {
    greeting: 'Hallo Stofpad Biltong (demo), ek wil graag bestel:',
    pending: 'Prys moet bevestig word',
    courier: 'Koerier (onderhewig aan bevestiging)',
    collection: 'Afhaal / reël direk met die winkel',
    known: 'Bekende subtotaal',
    total: 'Geskatte totaal',
    excludes: 'Sluit produkte uit waarvan pryse nog bevestig moet word.',
    confirm: 'Bevestig asseblief beskikbaarheid, finale gewig, aflewering en betaling.',
    sentFrom: 'Gestuur vanaf die Stofpad Biltong-demo op siterevivesa.com.',
  },
}

function detailLine(line: Selection, products: Product[], language: Language): string {
  const product = productById(products, line.id)
  if (product == null) return ''
  const price = linePrice(line, product)
  const option = line.option ? ` — ${line.option}` : ''
  return `${line.quantity} × ${weight(line.grams)} ${product.name[language]}${option} — ${price === null ? MESSAGE_WORDS[language].pending : money(price)}`
}

function closingLines(summary: OrderTotals, courier: boolean, language: Language, settings: OrderSettings): string[] {
  const words = MESSAGE_WORDS[language]
  return [
    courier ? `${words.courier} — ${money(settings.courierCents)}` : words.collection,
    `${summary.pending ? words.known : words.total}: ${money(summary.cents)}`,
    ...(summary.pending ? [words.excludes] : []),
    words.confirm,
    '',
    words.sentFrom,
  ]
}

export function orderMessage(lines: Selection[], courier: boolean, language: Language, products: Product[], settings: OrderSettings): string {
  const summary = totals(lines, courier, products, settings)
  const details = lines.map(detailFor)
  return [MESSAGE_WORDS[language].greeting, '', ...details, '', ...closingLines(summary, courier, language, settings)].join('\n')

  function detailFor(line: Selection): string {
    return detailLine(line, products, language)
  }
}

// A real WhatsApp link: it opens a chat to SiteReviveSA's own number with the order filled in; nothing is sent until the visitor presses Send.
export function whatsappLink(message: string, settings: OrderSettings): string {
  return `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(message)}`
}
