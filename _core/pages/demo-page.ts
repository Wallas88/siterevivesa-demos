/*
 * demo-page.ts — a page the browser checks open, and the one way they set
 * a tab up before opening it: the demo's saved content deleted (so every
 * page starts from its seed) and the mock sign-in on or off. An admin
 * page is checked both on the panel's first-setup step and past it.
 */

export interface DemoPage {
  path: string
  label: string
  signedIn: boolean
  // Start past the panel's first setup (done by tapping its button), or on it.
  setUp: boolean
}

export interface TabSetup {
  databaseName: string
  signedInKey: string
  signedInValue: string
  // Other choices the demo keeps in localStorage (Stofpad's language), cleared so every page starts the same.
  localKeys: string[]
}

function removeLocal(key: string): string {
  return `localStorage.removeItem(${JSON.stringify(key)})`
}

// Run inside the page, then the page is opened again.
export function tabStateExpression(setup: TabSetup, signedIn: boolean): string {
  const key = JSON.stringify(setup.signedInKey)
  const signIn = signedIn ? `sessionStorage.setItem(${key}, ${JSON.stringify(setup.signedInValue)})` : `sessionStorage.removeItem(${key})`
  const clearLocal = setup.localKeys.map(removeLocal).join('\n  ')
  return `new Promise(function resetTab(done) {
  ${signIn}
  ${clearLocal}
  const request = indexedDB.deleteDatabase(${JSON.stringify(setup.databaseName)})
  request.onsuccess = done
  request.onerror = done
  request.onblocked = done
})`
}
