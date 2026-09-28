/*
 * chrome-process.ts — starts a headless Chrome with a throwaway profile,
 * waits for its DevTools port, and stops it again (waiting for it to exit
 * before deleting the profile it is still writing to).
 */
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import type { ChildProcess } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as wait } from 'node:timers/promises'

export interface ChromeProcess {
  port: number | null
  stop: () => Promise<void>
}

const PORT_FILE = 'DevToolsActivePort'
const PORT_WAIT_MS = 100
const PORT_ATTEMPTS = 100
const EXIT_WAIT_MS = 3000
const RM_RETRIES = 3
// Chrome has not written its port file yet.
const PORT_NOT_READY = null
// --no-sandbox: WSL has no setuid sandbox helper; this browser only ever loads our own build from 127.0.0.1.
const CHROME_FLAGS = ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=0']

async function readPortOnce(profileDirectory: string): Promise<number | null> {
  try {
    const contents = await readFile(join(profileDirectory, PORT_FILE), 'utf8')
    const port = Number(contents.split('\n')[0])
    return port > 0 ? port : PORT_NOT_READY
  } catch {
    return PORT_NOT_READY
  }
}

async function waitForPort(profileDirectory: string): Promise<number | null> {
  for (let attempt = 0; attempt < PORT_ATTEMPTS; attempt += 1) {
    const port = await readPortOnce(profileDirectory)
    if (port != null) return port
    await wait(PORT_WAIT_MS)
  }
  return PORT_NOT_READY
}

async function stopChrome(chrome: ChildProcess, profileDirectory: string): Promise<void> {
  if (chrome.exitCode == null) {
    const exited = once(chrome, 'exit')
    chrome.kill()
    await Promise.race([exited, wait(EXIT_WAIT_MS)])
  }
  await rm(profileDirectory, { recursive: true, force: true, maxRetries: RM_RETRIES })
}

export async function startChrome(chromePath: string): Promise<ChromeProcess> {
  const profileDirectory = await mkdtemp(join(tmpdir(), 'ux-check-'))
  const chrome = spawn(chromePath, [...CHROME_FLAGS, `--user-data-dir=${profileDirectory}`, 'about:blank'], { stdio: 'ignore' })
  const port = await waitForPort(profileDirectory)
  return { port, stop: stopThisChrome }

  function stopThisChrome(): Promise<void> {
    return stopChrome(chrome, profileDirectory)
  }
}
