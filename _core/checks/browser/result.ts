/*
 * result.ts — the ux-check's error codes and the Result shape every step
 * returns, so a failing step reports a code and a plain message instead of
 * throwing across the script.
 */

export const UX_CHECK_ERRORS = {
  CONFIG_MISSING: 'CONFIG_MISSING',
  DIST_MISSING: 'DIST_MISSING',
  SERVER_FAILED: 'SERVER_FAILED',
  BROWSER_FAILED: 'BROWSER_FAILED',
  PAGE_FAILED: 'PAGE_FAILED',
} as const

export type UxCheckErrorCode = (typeof UX_CHECK_ERRORS)[keyof typeof UX_CHECK_ERRORS]

export type Result<T> = { ok: true; value: T } | { ok: false; code: UxCheckErrorCode; message: string }

export function succeed<T>(value: T): Result<T> {
  return { ok: true, value }
}

export function fail<T>(code: UxCheckErrorCode, message: string): Result<T> {
  return { ok: false, code, message }
}
