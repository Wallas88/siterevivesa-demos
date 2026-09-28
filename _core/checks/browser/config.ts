/*
 * config.ts — the only place the ux-check reads the environment. CHROME_PATH
 * points at a Chrome or Chromium binary; a missing value fails fast with its
 * name and what to do.
 */
import { existsSync } from 'node:fs'
import { UX_CHECK_ERRORS, succeed, fail } from './result.ts'
import type { Result } from './result.ts'

export interface UxCheckConfig {
  chromePath: string
  distDirectory: string
}

const DIST_DIRECTORY = 'dist'

export function readConfig(environment: NodeJS.ProcessEnv): Result<UxCheckConfig> {
  const chromePath = environment.CHROME_PATH ?? ''
  if (chromePath.trim() === '') {
    return fail(UX_CHECK_ERRORS.CONFIG_MISSING, 'CHROME_PATH is not set. Point it at a Chrome or Chromium binary, e.g. CHROME_PATH=~/.cache/ms-playwright/chromium-<version>/chrome-linux64/chrome.')
  }
  if (!existsSync(chromePath)) {
    return fail(UX_CHECK_ERRORS.CONFIG_MISSING, `CHROME_PATH points at ${chromePath}, which does not exist. Check the path.`)
  }
  if (!existsSync(`${DIST_DIRECTORY}/index.html`)) {
    return fail(UX_CHECK_ERRORS.DIST_MISSING, 'No build found in dist/. Run npm run build first.')
  }
  return succeed({ chromePath, distDirectory: DIST_DIRECTORY })
}
