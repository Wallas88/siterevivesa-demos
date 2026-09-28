/*
 * protocol-client.ts — one DevTools tab over a WebSocket: open it, send a
 * command, wait for its reply. The ux-check speaks the protocol directly
 * (Node 24 has fetch and WebSocket) rather than adding a dependency.
 */
import { UX_CHECK_ERRORS, succeed, fail } from './result.ts'
import type { Result } from './result.ts'

export interface ProtocolReply {
  id?: number
  result?: Record<string, unknown>
  error?: { message: string }
}

export interface ProtocolClient {
  send: (method: string, params?: Record<string, unknown>) => Promise<ProtocolReply>
  close: () => void
}

async function openTab(port: number): Promise<Result<string>> {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })
    const target = (await response.json()) as { webSocketDebuggerUrl?: string }
    if (target.webSocketDebuggerUrl == null) return fail(UX_CHECK_ERRORS.BROWSER_FAILED, 'Chrome opened a tab without a debugging address. Try again.')
    return succeed(target.webSocketDebuggerUrl)
  } catch {
    return fail(UX_CHECK_ERRORS.BROWSER_FAILED, 'Chrome started but would not open a tab. Try again.')
  }
}

// Resolves once the socket is open, rejects on its first error.
function waitForOpen(socket: WebSocket): Promise<void> {
  return new Promise<void>(settleOnOpen)

  function settleOnOpen(resolveOpen: () => void, rejectOpen: (error: Error) => void): void {
    socket.addEventListener('open', resolveOpen, { once: true })
    socket.addEventListener('error', rejectWithReason, { once: true })

    function rejectWithReason(): void {
      rejectOpen(new Error('socket error'))
    }
  }
}

function clientFor(socket: WebSocket): ProtocolClient {
  const waiting = new Map<number, (reply: ProtocolReply) => void>()
  let nextId = 0
  socket.addEventListener('message', deliver)
  return { send, close: closeSocket }

  function deliver(event: MessageEvent): void {
    const reply = JSON.parse(String(event.data)) as ProtocolReply
    const settle = reply.id == null ? undefined : waiting.get(reply.id)
    if (settle == null || reply.id == null) return
    waiting.delete(reply.id)
    settle(reply)
  }

  function send(method: string, params: Record<string, unknown> = {}): Promise<ProtocolReply> {
    nextId += 1
    const id = nextId
    const reply = new Promise<ProtocolReply>(register)
    socket.send(JSON.stringify({ id, method, params }))
    return reply

    function register(resolveReply: (reply: ProtocolReply) => void): void {
      waiting.set(id, resolveReply)
    }
  }

  function closeSocket(): void {
    socket.close()
  }
}

export async function connectToTab(port: number): Promise<Result<ProtocolClient>> {
  const tab = await openTab(port)
  if (!tab.ok) return tab
  const socket = new WebSocket(tab.value)
  try {
    await waitForOpen(socket)
    return succeed(clientFor(socket))
  } catch {
    return fail(UX_CHECK_ERRORS.BROWSER_FAILED, 'Could not connect to Chrome. Try again.')
  }
}
