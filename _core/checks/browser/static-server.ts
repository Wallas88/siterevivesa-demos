/*
 * static-server.ts — serves the finished build from dist/ on a free local
 * port, the way the Worker's assets binding would: /path/ serves
 * path/index.html, an unknown path serves 404.html.
 */
import { createServer } from 'node:http'
import type { IncomingMessage, ServerResponse, Server } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { UX_CHECK_ERRORS, succeed, fail } from './result.ts'
import type { Result } from './result.ts'

export interface StaticServer {
  origin: string
  close: () => Promise<void>
}

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
}
const NOT_FOUND_PAGE = '404.html'
const LOCALHOST = '127.0.0.1'

function contentTypeFor(path: string): string {
  return CONTENT_TYPES[extname(path)] ?? 'application/octet-stream'
}

// A request path mapped onto dist/, refusing anything that climbs out of it.
function filePathFor(root: string, urlPath: string): string | null {
  const cleanPath = decodeURIComponent(urlPath.split('?')[0] ?? '/')
  const withIndex = cleanPath.endsWith('/') ? `${cleanPath}index.html` : cleanPath
  const resolved = normalize(join(root, withIndex))
  return resolved.startsWith(normalize(root)) ? resolved : null
}

async function sendFile(response: ServerResponse, path: string, status: number): Promise<void> {
  const body = await readFile(path)
  response.writeHead(status, { 'content-type': contentTypeFor(path) })
  response.end(body)
}

// The file for a request, or the 404 page the Worker would serve instead.
async function respond(root: string, request: IncomingMessage, response: ServerResponse): Promise<void> {
  const path = filePathFor(root, request.url ?? '/')
  const notFound = join(root, NOT_FOUND_PAGE)
  if (path == null) return sendFile(response, notFound, 404)
  try {
    await sendFile(response, path, 200)
  } catch {
    await sendFile(response, notFound, 404)
  }
}

function handlerFor(root: string): (request: IncomingMessage, response: ServerResponse) => void {
  return handle

  function handle(request: IncomingMessage, response: ServerResponse): void {
    void respondOrFail(request, response)
  }

  async function respondOrFail(request: IncomingMessage, response: ServerResponse): Promise<void> {
    try {
      await respond(root, request, response)
    } catch {
      response.writeHead(500)
      response.end()
    }
  }
}

// Chrome holds keep-alive connections open; close them or close() waits on them.
function closerFor(server: Server): () => Promise<void> {
  return closeServer

  function closeServer(): Promise<void> {
    server.closeAllConnections()
    return new Promise<void>(waitForClose)
  }

  function waitForClose(resolveClosed: () => void): void {
    server.close(resolveClosed)
  }
}

function listenOnFreePort(server: Server): Promise<Result<StaticServer>> {
  return new Promise<Result<StaticServer>>(listen)

  function listen(settle: (value: Result<StaticServer>) => void): void {
    server.once('error', onError)
    server.listen(0, LOCALHOST, onListening)

    function onListening(): void {
      const address = server.address()
      if (address == null || typeof address === 'string') {
        settle(fail(UX_CHECK_ERRORS.SERVER_FAILED, 'The local server started without a port. Try again.'))
        return
      }
      settle(succeed({ origin: `http://${LOCALHOST}:${address.port}`, close: closerFor(server) }))
    }

    function onError(error: Error): void {
      settle(fail(UX_CHECK_ERRORS.SERVER_FAILED, `The local server could not start (${error.name}). Try again.`))
    }
  }
}

export function startStaticServer(root: string): Promise<Result<StaticServer>> {
  return listenOnFreePort(createServer(handlerFor(root)))
}
