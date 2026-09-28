/*
 * run-sandbox.ts — the harness every demo's sandbox-check runs in: serve
 * the build, start headless Chrome, make a real image file to pick (a
 * screenshot of the page, 1600px wide, so shrinking is really exercised),
 * run the demo's own steps, and print the result. Exits 1 on a failed
 * step, 2 when the check itself could not run.
 */
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readConfig } from '../browser/config.ts'
import { startStaticServer } from '../browser/static-server.ts'
import { launchBrowser } from '../browser/chrome.ts'
import type { BrowserPage } from '../browser/chrome.ts'
import type { Session } from './session.ts'

const EXIT_FAILED = 1
const EXIT_BROKEN = 2
const PHOTO_VIEWPORT = { width: 1600, height: 1200 }

async function makePhoto(browser: BrowserPage, origin: string, directory: string): Promise<string | null> {
  await browser.open(`${origin}/`, PHOTO_VIEWPORT, false)
  const png = await browser.screenshot()
  if (!png.ok) return null
  const path = join(directory, 'made-up-photo.png')
  await writeFile(path, Buffer.from(png.value, 'base64'))
  return path
}

async function runSteps(browser: BrowserPage, origin: string, steps: (session: Session) => Promise<void>): Promise<string[]> {
  const directory = await mkdtemp(join(tmpdir(), 'sandbox-check-'))
  try {
    const photoPath = await makePhoto(browser, origin, directory)
    if (photoPath == null) return ['could not make the test photo']
    const session: Session = { browser, origin, photoPath, failures: [] }
    await steps(session)
    return session.failures
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

function reportBroken(code: string, message: string): void {
  console.error(`sandbox-check could not run [${code}]: ${message}`)
  process.exitCode = EXIT_BROKEN
}

async function main(title: string, steps: (session: Session) => Promise<void>): Promise<void> {
  const config = readConfig(process.env)
  if (!config.ok) return reportBroken(config.code, config.message)
  const server = await startStaticServer(config.value.distDirectory)
  if (!server.ok) return reportBroken(server.code, server.message)
  const browser = await launchBrowser(config.value.chromePath)
  if (!browser.ok) {
    await server.value.close()
    return reportBroken(browser.code, browser.message)
  }
  try {
    console.log(`${title}\n`)
    const failures = await runSteps(browser.value, server.value.origin, steps)
    console.log(`\n${failures.length === 0 ? 'Every sandbox step passes.' : `${failures.length} steps failed.`}`)
    if (failures.length > 0) process.exitCode = EXIT_FAILED
  } finally {
    await Promise.all([browser.value.close(), server.value.close()])
  }
}

// The entry each demo's scripts/sandbox-check.ts calls. An escaped rejection is logged as a code and still ends the run.
export async function runSandboxCheck(title: string, steps: (session: Session) => Promise<void>): Promise<void> {
  try {
    await main(title, steps)
  } catch (error) {
    reportBroken('UNEXPECTED', error instanceof Error ? error.message : 'unknown error')
  }
}
