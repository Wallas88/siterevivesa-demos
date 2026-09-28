/*
 * page-helpers.ts — small functions the in-page measurements share. They run
 * inside the page under test: inPage() (page-measurements.ts) sends their
 * source ahead of every measurement, so they must stay self-contained and
 * keep their names. Colour maths follows WCAG 2 relative luminance.
 */

export interface Box {
  width: number
  height: number
}

export type Rgba = [number, number, number, number]
export type Rgb = [number, number, number]

export function describeControl(element: Element): string {
  const firstClass = String(element.getAttribute('class') ?? '').split(' ')[0] ?? ''
  return `${element.tagName.toLowerCase()}${firstClass !== '' ? `.${firstClass}` : ''}`
}

export function labelOf(element: Element): string {
  return (element.getAttribute('aria-label') ?? element.textContent ?? '').trim().slice(0, 28)
}

export function hasOwnText(element: Element): boolean {
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '') return true
  }
  return false
}

export function isShown(element: Element): boolean {
  const rect = element.getBoundingClientRect()
  const style = getComputedStyle(element)
  return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden'
}

// A link inside running text is exempt from target size (WCAG 2.5.8 inline exception).
export function isInlineInText(element: Element): boolean {
  const parent = element.parentElement
  if (getComputedStyle(element).display !== 'inline' || parent == null) return false
  return hasOwnText(parent)
}

// The element's box grown by an absolutely positioned ::after, if it has one.
export function hitBox(element: Element): Box {
  const rect = element.getBoundingClientRect()
  const after = getComputedStyle(element, '::after')
  if (after.content === 'none' || after.position !== 'absolute') return { width: Math.round(rect.width), height: Math.round(rect.height) }
  const left = Math.min(rect.left, rect.left + (parseFloat(after.left) || 0))
  const top = Math.min(rect.top, rect.top + (parseFloat(after.top) || 0))
  const right = Math.max(rect.right, rect.right - (parseFloat(after.right) || 0))
  const bottom = Math.max(rect.bottom, rect.bottom - (parseFloat(after.bottom) || 0))
  return { width: Math.round(right - left), height: Math.round(bottom - top) }
}

// Any CSS colour (rgb, oklab, color-mix…) resolved to sRGB by painting one pixel.
export function toRgba(paint: CanvasRenderingContext2D, colour: string): Rgba {
  paint.clearRect(0, 0, 1, 1)
  paint.fillStyle = colour
  paint.fillRect(0, 0, 1, 1)
  const data = paint.getImageData(0, 0, 1, 1).data
  return [data[0] ?? 0, data[1] ?? 0, data[2] ?? 0, (data[3] ?? 0) / 255]
}

export function composite(top: Rgba, bottom: Rgb): Rgb {
  const alpha = top[3]
  return [top[0] * alpha + bottom[0] * (1 - alpha), top[1] * alpha + bottom[1] * (1 - alpha), top[2] * alpha + bottom[2] * (1 - alpha)]
}

export function linearChannel(channel: number): number {
  const value = channel / 255
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

export function contrastRatio(first: Rgb, second: Rgb): number {
  const luminances = [first, second].map(relativeLuminance).sort(descending)
  return ((luminances[0] ?? 0) + 0.05) / ((luminances[1] ?? 0) + 0.05)

  function relativeLuminance(colour: Rgb): number {
    return 0.2126 * linearChannel(colour[0]) + 0.7152 * linearChannel(colour[1]) + 0.0722 * linearChannel(colour[2])
  }

  function descending(a: number, b: number): number {
    return b - a
  }
}

// The solid colour behind an element, or null when an image or gradient is in the way.
export function backgroundBehind(paint: CanvasRenderingContext2D, element: Element): Rgb | null {
  const layers: Rgba[] = []
  for (let current: Element | null = element; current != null; current = current.parentElement) {
    const style = getComputedStyle(current)
    if (style.backgroundImage !== 'none') return null
    const layer = toRgba(paint, style.backgroundColor)
    if (layer[3] > 0) layers.push(layer)
    if (layer[3] >= 1) break
  }
  // Outermost layer first, each one painted under the next; white is the page's own canvas.
  return layers.reduceRight(paintOver, [255, 255, 255] as Rgb)

  function paintOver(below: Rgb, layer: Rgba): Rgb {
    return composite(layer, below)
  }
}

export function fontSize(element: Element): string {
  return getComputedStyle(element).fontSize
}

export function fontWeight(element: Element): string {
  return getComputedStyle(element).fontWeight
}

export function textColour(element: Element): string {
  return getComputedStyle(element).color
}

export function distinct(values: string[]): string[] {
  return [...new Set(values)]
}

// Text folded inside a closed <details> is not on screen; only its summary row is.
export function isFoldedAway(element: Element): boolean {
  const details = element.closest('details')
  return details != null && !details.open && element.closest('summary') == null
}

// The flow-check's in-page helpers (flow-check/flow-page.ts): stable ids, boxes, names, finding and reading an element, pausing.
export interface FlowBox {
  id: string
  name: string
  y: number
  height: number
}

export function flowNextId(prefix: string): string {
  const store = window as unknown as { flowCount?: number }
  store.flowCount = (store.flowCount ?? 0) + 1
  return `${prefix}-${store.flowCount}`
}

export function flowIsShown(element: Element): boolean {
  return element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden'
}

export function flowName(element: Element): string {
  const heading = element.querySelector('.page-card-name, .card-title, h2, h3')
  return (element.getAttribute('aria-label') ?? heading?.textContent ?? element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40)
}

// Every visible, non-exempt match with a stable id kept in data-<key>.
export function flowBoxes(selector: string, key: string, exempt: string): FlowBox[] {
  const boxes: FlowBox[] = []
  for (const element of document.querySelectorAll<HTMLElement>(selector)) {
    if (!flowIsShown(element) || element.closest(exempt) != null) continue
    element.dataset[key] ??= flowNextId(key)
    const rect = element.getBoundingClientRect()
    boxes.push({ id: element.dataset[key] ?? '', name: flowName(element), y: rect.top, height: rect.height })
  }
  return boxes
}

// An element by CSS selector, or the first button whose text starts with the given words.
export function flowControl(selector: string | undefined, text: string | undefined): HTMLElement | null {
  if (selector != null) return document.querySelector<HTMLElement>(selector)
  for (const button of document.querySelectorAll<HTMLElement>('button')) if (text != null && button.textContent.trim().startsWith(text)) return button
  return null
}

export function flowRead(selector: string, property: 'height' | 'opacity'): number {
  const element = document.querySelector(selector)
  if (element == null) return Number.NaN
  return property === 'height' ? element.getBoundingClientRect().height : Number(getComputedStyle(element).opacity)
}

export function flowPause(ms: number): Promise<void> {
  return new Promise(waitFor)

  function waitFor(resolveWait: () => void): void {
    setTimeout(resolveWait, ms)
  }
}
