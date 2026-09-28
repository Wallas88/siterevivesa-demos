/*
 * sandbox-page.ts — Copperkloof's sandbox steps that run inside the page
 * (sent there by inPage()): read what the website and admin show, and fill
 * and send the "Add a job" form. The steps every demo shares are in
 * ../../../_core/checks/sandbox/sandbox-page.ts. Each function is
 * self-contained, because only its source text reaches the page.
 */

export interface PageState {
  ready: boolean
  siteTitles: string[]
  adminStatus: string
  previewShown: boolean
  // The new job's picture on the website: its address and its drawn width.
  addedPhoto: { src: string; naturalWidth: number } | null
  addedCardShown: boolean
  requests: string[]
}

export function readPageState(addedTitle: string): PageState {
  const titles = [...document.querySelectorAll('.job-card-title')].map(textOf)
  const card = [...document.querySelectorAll('.job-card')].find(hasTitle)
  const photo = card?.querySelector('img') ?? null
  const entries = performance.getEntriesByType('resource').map(nameOf)
  return {
    ready: document.querySelector('.admin[aria-busy="false"]') != null,
    siteTitles: titles,
    adminStatus: textOf(document.querySelector('.admin-status')),
    previewShown: document.querySelector('.photo-preview-image') != null,
    addedPhoto: photo == null ? null : { src: photo.currentSrc || photo.src, naturalWidth: photo.naturalWidth },
    addedCardShown: card != null && card.getClientRects().length > 0,
    requests: [location.href, ...entries],
  }

  function textOf(element: Element | null): string {
    return (element?.textContent ?? '').trim()
  }

  function hasTitle(element: Element): boolean {
    return textOf(element.querySelector('.job-card-title')) === addedTitle
  }

  function nameOf(entry: PerformanceEntry): string {
    return entry.name
  }
}

// Types into React's controlled fields the way a visitor would (the native setter, then an input event), then sends.
export function fillAndSendJob(title: string, caption: string): boolean {
  const form = document.querySelector<HTMLFormElement>('.job-form')
  const titleInput = form?.querySelector<HTMLInputElement>('input[name="title"]')
  const captionInput = form?.querySelector<HTMLTextAreaElement>('textarea[name="caption"]')
  if (form == null || titleInput == null || captionInput == null) return false
  typeInto(titleInput, HTMLInputElement.prototype, title)
  typeInto(captionInput, HTMLTextAreaElement.prototype, caption)
  form.requestSubmit()
  return true

  function typeInto(field: HTMLElement, prototype: object, value: string): void {
    Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(field, value)
    field.dispatchEvent(new Event('input', { bubbles: true }))
  }
}

export interface SiteExtras {
  specialTitles: string[]
  sundayHours: string
  specialError: string
}

// The website's specials and Sunday's hours, and the admin's special-form message.
export function readSiteExtras(): SiteExtras {
  const rows = [...document.querySelectorAll('.hours-row')]
  const sunday = rows.find(isSunday)
  return {
    specialTitles: [...document.querySelectorAll('.special-card .special-title')].map(textOf),
    sundayHours: textOf(sunday?.querySelector('.hours-time') ?? null),
    specialError: textOf(document.querySelector('.special-form .form-status')),
  }

  function textOf(element: Element | null): string {
    return (element?.textContent ?? '').trim()
  }

  function isSunday(row: Element): boolean {
    return textOf(row.querySelector('.hours-day')) === 'Sunday'
  }
}
