/*
 * chrome.ts — the browser page the ux-check drives: open a URL at a viewport
 * (touch or not), evaluate a measurement, press Tab, tap or hover a point
 * (the flow-check), switch reduced motion, run a script before page load,
 * take a screenshot, put files in a file input (the sandbox-check), close.
 * Built on chrome-process.ts and protocol-client.ts.
 */
import { setTimeout as wait } from 'node:timers/promises'
import { startChrome } from './chrome-process.ts'
import { connectToTab } from './protocol-client.ts'
import type { ProtocolClient } from './protocol-client.ts'
import { UX_CHECK_ERRORS, succeed, fail } from './result.ts'
import type { Result } from './result.ts'

export interface Viewport {
  width: number
  height: number
}

export interface Point {
  x: number
  y: number
}

export interface BrowserPage {
  open: (url: string, viewport: Viewport, touch: boolean) => Promise<void>
  evaluate: <T>(expression: string) => Promise<Result<T>>
  pressTab: () => Promise<void>
  // A finger tap, or a mouse click that rests on the point first.
  tap: (point: Point, touch: boolean) => Promise<void>
  hover: (point: Point) => Promise<void>
  setReducedMotion: (reduced: boolean) => Promise<void>
  addStartupScript: (source: string) => Promise<void>
  // The visible page as a base64 PNG.
  screenshot: () => Promise<Result<string>>
  // Puts files from disk into the first input matching the selector, as if the visitor picked them.
  setInputFiles: (selector: string, paths: string[]) => Promise<Result<true>>
  close: () => Promise<void>
}

interface EvaluateResult {
  result?: { value?: unknown }
  exceptionDetails?: { text?: string }
}

const SETTLE_MS = 1500
const TAB_KEY = { key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }
const PHONE_SCALE = 2
const DESKTOP_SCALE = 1

// Taps, hovers and the reduced-motion switch the flow-check drives.
function inputsFor(client: ProtocolClient): Pick<BrowserPage, 'tap' | 'hover' | 'setReducedMotion'> {
  return { tap, hover, setReducedMotion }

  async function tap(point: Point, touch: boolean): Promise<void> {
    if (touch) {
      await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] })
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      return
    }
    await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 })
    await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 })
  }

  async function hover(point: Point): Promise<void> {
    await client.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y })
  }

  async function setReducedMotion(reduced: boolean): Promise<void> {
    await client.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }] })
  }
}

// The sandbox-check's screenshot and file picking.
function filesFor(client: ProtocolClient): Pick<BrowserPage, 'screenshot' | 'setInputFiles'> {
  return { screenshot, setInputFiles }

  async function screenshot(): Promise<Result<string>> {
    const reply = await client.send('Page.captureScreenshot', { format: 'png' })
    const data = reply.result?.data
    return typeof data === 'string' ? succeed(data) : fail(UX_CHECK_ERRORS.PAGE_FAILED, 'Chrome took no screenshot. Try again.')
  }

  async function setInputFiles(selector: string, paths: string[]): Promise<Result<true>> {
    const documentReply = await client.send('DOM.getDocument', { depth: 0 })
    const root = (documentReply.result?.root as { nodeId?: number } | undefined)?.nodeId
    const found = await client.send('DOM.querySelector', { nodeId: root ?? 0, selector })
    const nodeId = found.result?.nodeId
    if (typeof nodeId !== 'number' || nodeId === 0) return fail(UX_CHECK_ERRORS.PAGE_FAILED, `No element matches ${selector}. Check the page still has it.`)
    const set = await client.send('DOM.setFileInputFiles', { nodeId, files: paths })
    return set.error == null ? succeed(true) : fail(UX_CHECK_ERRORS.PAGE_FAILED, `Chrome would not set the file (${set.error.message}).`)
  }
}

function pageFor(client: ProtocolClient, stopChrome: () => Promise<void>): BrowserPage {
  return { open, evaluate, pressTab, ...inputsFor(client), ...filesFor(client), addStartupScript, close }

  async function open(url: string, viewport: Viewport, touch: boolean): Promise<void> {
    await Promise.all([client.send('Page.enable'), client.send('Runtime.enable')])
    await client.send('Emulation.setDeviceMetricsOverride', { width: viewport.width, height: viewport.height, deviceScaleFactor: touch ? PHONE_SCALE : DESKTOP_SCALE, mobile: touch })
    await client.send('Emulation.setTouchEmulationEnabled', { enabled: touch, maxTouchPoints: touch ? 1 : 0 })
    await client.send('Page.navigate', { url })
    await wait(SETTLE_MS)
  }

  async function evaluate<T>(expression: string): Promise<Result<T>> {
    const reply = await client.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    const outcome = reply.result as EvaluateResult | undefined
    if (reply.error == null && outcome?.exceptionDetails == null) return succeed(outcome?.result?.value as T)
    return fail(UX_CHECK_ERRORS.PAGE_FAILED, `A measurement failed inside the page (${outcome?.exceptionDetails?.text ?? reply.error?.message ?? 'no detail'}). Check the page loads in the preview.`)
  }

  async function pressTab(): Promise<void> {
    await client.send('Input.dispatchKeyEvent', { type: 'keyDown', ...TAB_KEY })
    await client.send('Input.dispatchKeyEvent', { type: 'keyUp', ...TAB_KEY })
  }

  async function addStartupScript(source: string): Promise<void> {
    await client.send('Page.addScriptToEvaluateOnNewDocument', { source })
  }

  async function close(): Promise<void> {
    client.close()
    await stopChrome()
  }
}

export async function launchBrowser(chromePath: string): Promise<Result<BrowserPage>> {
  const chrome = await startChrome(chromePath)
  if (chrome.port == null) {
    await chrome.stop()
    return fail(UX_CHECK_ERRORS.BROWSER_FAILED, 'Chrome did not start. Check CHROME_PATH, and that its system libraries are installed (libnss3, libnspr4, libasound2t64).')
  }
  const client = await connectToTab(chrome.port)
  if (!client.ok) {
    await chrome.stop()
    return client
  }
  return succeed(pageFor(client.value, chrome.stop))
}
