/*
 * sandbox-page.ts — the sandbox-check steps every demo shares that run
 * inside the page (sent there by inPage(), browser/page-measurements.ts):
 * tap a button by its words or label, block storage the way some private
 * windows do, read and use the mock sign-in, add a special, and read what
 * the page has requested. Each function is self-contained, because only its
 * source text reaches the page.
 */

export function tapButton(words: string): boolean {
  const button = [...document.querySelectorAll<HTMLButtonElement>('button')].find(hasWords)
  button?.click()
  return button != null

  function hasWords(candidate: HTMLButtonElement): boolean {
    return candidate.textContent.trim() === words && candidate.getClientRects().length > 0
  }
}

// Installed before the page loads for the fallback check: the browser refuses storage, as some private windows do.
export function blockStorage(): void {
  Object.defineProperty(window, 'indexedDB', { configurable: true, get: refuse })

  function refuse(): never {
    throw new DOMException('Storage is blocked in this window.', 'SecurityError')
  }
}

export interface SignInView {
  shown: boolean
  email: string
  emailReadOnly: boolean
  code: string
  error: string
  keptInTab: string | null
}

// What the mock sign-in shows, and what the tab keeps (sessionStorage) about being signed in.
export function readSignInView(signedInKey: string): SignInView {
  const email = document.querySelector<HTMLInputElement>('.sign-in input[name="demo-email"]')
  return {
    shown: document.querySelector('.sign-in') != null,
    email: email?.value ?? '',
    emailReadOnly: email?.readOnly === true,
    code: (document.querySelector('.demo-code')?.textContent ?? '').replace(/\s/g, ''),
    error: (document.querySelector('.code-error')?.textContent ?? '').trim(),
    keptInTab: sessionStorage.getItem(signedInKey),
  }
}

export function typeAndSendCode(code: string): boolean {
  const input = document.querySelector<HTMLInputElement>('.code-step input[name="code"]')
  const form = input?.closest('form')
  if (input == null || form == null) return false
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, code)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  form.requestSubmit()
  return true
}

export function fillAndSendSpecial(title: string, endsOn: string): boolean {
  const form = document.querySelector<HTMLFormElement>('.special-form')
  const titleInput = form?.querySelector<HTMLInputElement>('input[name="special-title"]')
  const endInput = form?.querySelector<HTMLInputElement>('input[name="special-ends"]')
  if (form == null || titleInput == null || endInput == null) return false
  typeInto(titleInput, title)
  typeInto(endInput, endsOn)
  form.requestSubmit()
  return true

  function typeInto(field: HTMLInputElement, value: string): void {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(field, value)
    field.dispatchEvent(new Event('input', { bubbles: true }))
  }
}

export function tapByLabel(label: string): boolean {
  const button = document.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)
  button?.click()
  return button != null
}

// Every address the page has fetched: the page itself and each resource.
export function readRequests(): string[] {
  return [location.href, ...performance.getEntriesByType('resource').map(nameOf)]

  function nameOf(entry: PerformanceEntry): string {
    return entry.name
  }
}

// The admin's store has opened (it shows aria-busy until then).
export function adminIsReady(): boolean {
  return document.querySelector('.admin[aria-busy="false"]') != null
}

// The text of the first element matching the selector, trimmed; empty when there is none.
export function textAt(selector: string): string {
  return (document.querySelector(selector)?.textContent ?? '').trim()
}

// Every matching element's text, in page order.
export function textsAt(selector: string): string[] {
  return [...document.querySelectorAll(selector)].map(textOf)

  function textOf(element: Element): string {
    return (element.textContent ?? '').trim()
  }
}

export interface TeamView {
  setupShown: boolean
  setupOwner: string
  members: { name: string; meta: string }[]
  note: string
  error: string
  addDisabled: boolean
}

// The panel's first-setup step, or the "People who can sign in" section once it is set up.
export function readTeamView(): TeamView {
  const rows = [...document.querySelectorAll('#admin-team .team-row')]
  return {
    setupShown: document.querySelector('.team-setup') != null,
    setupOwner: textOf(document.querySelector('.team-setup-owner strong')),
    members: rows.map(memberOf),
    note: textOf(document.querySelector('#admin-team .admin-section-lead')),
    error: textOf(document.querySelector('.team-form .form-status')),
    addDisabled: document.querySelector<HTMLButtonElement>('.team-form button[type="submit"]')?.disabled === true,
  }

  function textOf(element: Element | null): string {
    return (element?.textContent ?? '').trim()
  }

  function memberOf(row: Element): { name: string; meta: string } {
    return { name: textOf(row.querySelector('.slot-title')), meta: textOf(row.querySelector('.slot-meta')) }
  }
}

export function fillAndSendMember(name: string): boolean {
  const form = document.querySelector<HTMLFormElement>('.team-form')
  const input = form?.querySelector<HTMLInputElement>('input[name="team-name"]')
  if (form == null || input == null) return false
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, name)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  form.requestSubmit()
  return true
}

// Taps the first-setup button when the step is showing; false when the panel is already set up.
export function passSetup(): boolean {
  const button = document.querySelector<HTMLButtonElement>('.team-setup .button-primary')
  button?.click()
  return button != null
}
