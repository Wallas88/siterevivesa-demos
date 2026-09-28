/*
 * bundle.ts — the gzipped size of the JavaScript a visitor downloads, and
 * the demo's CSS. The demo is one page with no split code, so every .js
 * file in the build belongs to it.
 */
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

export interface PageJavascript {
  page: string
  gzipKb: number
}

export interface BundleSize {
  javascriptByPage: PageJavascript[]
  css: string
}

const BYTES_PER_KB = 1024
const ONE_PAGE = '/'

function isCss(name: string): boolean {
  return name.endsWith('.css')
}

function isJavascript(name: string): boolean {
  return name.endsWith('.js')
}

export async function readBundle(distDirectory: string): Promise<BundleSize> {
  const assetsDirectory = join(distDirectory, 'assets')
  const names = await readdir(assetsDirectory)
  const [css, javascript] = await Promise.all([Promise.all(names.filter(isCss).map(readText)), Promise.all(names.filter(isJavascript).map(readBytes))])
  const bytes = javascript.reduce(addGzipped, 0)
  return { javascriptByPage: [{ page: ONE_PAGE, gzipKb: Math.round((bytes / BYTES_PER_KB) * 10) / 10 }], css: css.join('\n') }

  function readText(name: string): Promise<string> {
    return readFile(join(assetsDirectory, name), 'utf8')
  }

  function readBytes(name: string): Promise<Buffer> {
    return readFile(join(assetsDirectory, name))
  }

  function addGzipped(total: number, file: Buffer): number {
    return total + gzipSync(file).length
  }
}
