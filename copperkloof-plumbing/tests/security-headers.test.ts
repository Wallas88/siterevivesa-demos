/*
 * security-headers.test.ts — the security headers the Worker serves
 * (public/_headers) and the ones the local preview sends (vite.config.ts)
 * stay identical, so a preview can't pass with a policy production doesn't
 * have. Also the demo rules: never indexed, and photos allowed only from
 * the page itself, data: and the visitor's own blob: URLs.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const HEADER_NAMES = ['Content-Security-Policy', 'X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'X-Robots-Tag']

function servedValue(name: string): string | null {
  const match = readFileSync('public/_headers', 'utf8').match(new RegExp(`^\\s*${name}:\\s*(.+)$`, 'm'))
  return match?.[1]?.trim() ?? null
}

function previewValue(name: string): string | null {
  // The value is one quoted string; a CSP is double-quoted because it contains 'self'.
  const match = readFileSync('vite.config.ts', 'utf8').match(new RegExp(`'${name}':\\s*\\n?\\s*(?:"([^"]+)"|'([^']+)')`))
  return (match?.[1] ?? match?.[2])?.trim() ?? null
}

test('the preview sends the same security headers the Worker serves', checkHeadersMatch)

function checkHeadersMatch(): void {
  for (const name of HEADER_NAMES) {
    const served = servedValue(name)
    assert.ok(served != null, `${name} is in public/_headers`)
    assert.equal(previewValue(name), served, `${name} differs between public/_headers and vite.config.ts`)
  }
}

test('the demo is never indexed: header and meta tag', function neverIndexed() {
  assert.equal(servedValue('X-Robots-Tag'), 'noindex, nofollow')
  assert.match(readFileSync('index.html', 'utf8'), /<meta name="robots" content="noindex/)
})

test('the policy allows no network calls and images only from here, data: and blob:', function tightPolicy() {
  const policy = servedValue('Content-Security-Policy') ?? ''
  assert.match(policy, /connect-src 'none'/)
  assert.match(policy, /img-src 'self' data: blob:;/)
})

test('every page carries the demo notice word for word', function carriesNotice() {
  const notice = 'Demo website by SiteReviveSA. Branding, imagery and service details are illustrative.'
  assert.ok(readFileSync('src/content/business.ts', 'utf8').includes(notice))
  assert.ok(readFileSync('index.html', 'utf8').includes(notice))
})
