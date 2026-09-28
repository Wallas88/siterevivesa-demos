/*
 * sandbox-rules.ts — the sandbox-check's decisions as pure functions: which
 * requests left the page's own origin, and whether the website shows the
 * seed jobs again. Tested in tests/sandbox-check.test.ts.
 */

// Every request that went anywhere but the page's own origin (blob: and data: never reach the network).
export function offOriginRequests(requestNames: string[], origin: string): string[] {
  return requestNames.filter(isElsewhere)

  function isElsewhere(name: string): boolean {
    if (name.startsWith('blob:') || name.startsWith('data:')) return false
    return new URL(name).origin !== origin
  }
}

// The same titles in the same order: what the website shows after a reset.
export function showsSeed(shownTitles: string[], seedTitles: string[]): boolean {
  return shownTitles.length === seedTitles.length && shownTitles.every(matchesSeed)

  function matchesSeed(title: string, index: number): boolean {
    return title === seedTitles[index]
  }
}
