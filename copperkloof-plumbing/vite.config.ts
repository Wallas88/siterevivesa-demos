/*
 * vite.config.ts — the Vite build for the demo. `vite preview` sends the
 * same security headers the edge serves from public/_headers (the shared
 * plugin); keep them identical (tests/security-headers.test.ts).
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { previewSecurityHeaders } from '../_core/tooling/preview-headers.ts'

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), camera=(), microphone=(), payment=()',
  'X-Robots-Tag': 'noindex, nofollow',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
}

export default defineConfig({
  plugins: [react(), previewSecurityHeaders(SECURITY_HEADERS)],
})
