/*
 * source-files.ts — finds every TypeScript file under the source roots and
 * parses it. A file that won't parse is returned as a failure with its path,
 * so one broken file doesn't hide the rest.
 */
import { readdir, readFile } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { parseSource } from './ast.ts'
import { lineStarts } from './lines.ts'
import type { SourceFile } from './source-file.ts'
import { SOURCE_EXTENSIONS } from './limits.ts'

export interface ParseFailure {
  path: string
  reason: string
}

async function filesUnder(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true, recursive: true })
  const found: string[] = []
  for (const entry of entries) {
    if (entry.isFile() && SOURCE_EXTENSIONS.includes(extname(entry.name))) found.push(join(entry.parentPath, entry.name))
  }
  return found
}

async function loadFile(path: string): Promise<SourceFile | ParseFailure> {
  const code = await readFile(path, 'utf8')
  try {
    return { path, code, ast: parseSource(path, code), starts: lineStarts(code) }
  } catch (error) {
    return { path, reason: error instanceof Error ? (error.message.split('\n')[0] ?? 'parse error') : 'parse error' }
  }
}

export async function loadSourceFiles(roots: string[]): Promise<(SourceFile | ParseFailure)[]> {
  const perRoot = await Promise.all(roots.map(filesUnder))
  const paths = perRoot.flat().sort()
  return Promise.all(paths.map(loadFile))
}

export function isParseFailure(file: SourceFile | ParseFailure): file is ParseFailure {
  return 'reason' in file
}
