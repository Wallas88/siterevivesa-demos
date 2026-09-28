/*
 * preview-headers.ts — a Vite plugin that makes `vite preview` send the
 * same security headers the edge serves from public/_headers (Workers
 * static assets applies that file; Vite's preview server never reads it).
 * Each demo passes its own headers from vite.config.ts, and its
 * security-headers test keeps the two identical.
 */
import type { Plugin, PreviewServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

export function previewSecurityHeaders(headers: Record<string, string>): Plugin {
  return { name: 'preview-security-headers', configurePreviewServer }

  function addSecurityHeaders(_request: IncomingMessage, response: ServerResponse, next: () => void): void {
    for (const [name, value] of Object.entries(headers)) response.setHeader(name, value)
    next()
  }

  // Installed directly (not returned) so it runs before Vite's own static-file middleware.
  function configurePreviewServer(server: PreviewServer): void {
    server.middlewares.use(addSecurityHeaders)
  }
}
