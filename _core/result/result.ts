/*
 * result.ts — the Result shape every fallible step returns, so nothing
 * throws across a seam: a value, or an error code. Codes stay codes here;
 * each demo turns a code into words in the visitor's language (its own
 * error list), so the same core serves an English and a bilingual demo.
 */

export type Result<T, Code extends string = string> = { ok: true; value: T } | { ok: false; code: Code }

export function succeed<T>(value: T): { ok: true; value: T } {
  return { ok: true, value }
}

export function fail<Code extends string>(code: Code): { ok: false; code: Code } {
  return { ok: false, code }
}
