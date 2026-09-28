/*
 * sandbox-page.ts — Stofpad's sandbox steps that run inside the page
 * (sent there by inPage()): read what the shop and the admin show, fill
 * and send the "Add a product" form, type a price, and click an element
 * by selector. The steps every demo shares are in
 * ../../../_core/checks/sandbox/sandbox-page.ts. Each function is
 * self-contained, because only its source text reaches the page.
 */

export interface ShopState {
  ready: boolean
  productNames: string[]
  firstPhoto: { src: string; naturalWidth: number } | null
  previewShown: boolean
  adminStatus: string
  whatsappHref: string
  orderCount: string
  htmlLang: string
  specialTitles: string[]
  sundayHours: string
  specialError: string
  requests: string[]
}

export function readShopState(): ShopState {
  const photo = document.querySelector<HTMLImageElement>('.product img')
  return {
    ready: document.querySelector('.admin[aria-busy="false"]') != null,
    productNames: [...document.querySelectorAll('.product .card-title')].map(textOf),
    firstPhoto: photo == null ? null : { src: photo.currentSrc || photo.src, naturalWidth: photo.naturalWidth },
    previewShown: document.querySelector('.photo-preview-image') != null,
    adminStatus: textOf(document.querySelector('.admin-status')),
    whatsappHref: document.querySelector<HTMLAnchorElement>('.whatsapp-order')?.href ?? '',
    orderCount: textOf(document.querySelector('.order-count')),
    htmlLang: document.documentElement.lang,
    specialTitles: [...document.querySelectorAll('.special-card .card-title')].map(textOf),
    sundayHours: sundayText(),
    specialError: textOf(document.querySelector('.special-form .form-status')),
    requests: [location.href, ...performance.getEntriesByType('resource').map(nameOf)],
  }

  function textOf(element: Element | null): string {
    return (element?.textContent ?? '').trim()
  }

  function nameOf(entry: PerformanceEntry): string {
    return entry.name
  }

  // Sunday is the last of the seven rows, in either language.
  function sundayText(): string {
    const rows = document.querySelectorAll('.hours-list .hours-time')
    return textOf(rows[rows.length - 1] ?? null)
  }
}

// Types into React's controlled fields the way a visitor would (the native setter, then an input event), then sends.
export function fillAndSendProduct(name: string, price: string): boolean {
  const form = document.querySelector<HTMLFormElement>('.product-form')
  const nameInput = form?.querySelector<HTMLInputElement>('input[name="product-name"]')
  const priceInput = form?.querySelector<HTMLInputElement>('input[name="product-price"]')
  if (form == null || nameInput == null || priceInput == null) return false
  typeInto(nameInput, name)
  typeInto(priceInput, price)
  form.requestSubmit()
  return true

  function typeInto(field: HTMLInputElement, value: string): void {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(field, value)
    field.dispatchEvent(new Event('input', { bubbles: true }))
  }
}

export function typePrice(selector: string, value: string): boolean {
  const input = document.querySelector<HTMLInputElement>(selector)
  if (input == null) return false
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  return true
}

// Clicks the first match; false when there is none or it is disabled.
export function clickSelector(selector: string): boolean {
  const element = document.querySelector<HTMLElement>(selector)
  if (element == null || (element instanceof HTMLButtonElement && element.disabled)) return false
  element.click()
  return true
}
