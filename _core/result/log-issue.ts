/*
 * log-issue.ts — the one place the demos log. Codes and counts only, never
 * a visitor's words or photos. Nothing leaves the browser: this writes to
 * the console and nowhere else.
 */

export function logIssue(code: string, count = 1): void {
  console.warn(JSON.stringify({ code, count }))
}
