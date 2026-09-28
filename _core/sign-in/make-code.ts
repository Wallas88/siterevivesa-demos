/*
 * make-code.ts — a fresh 6-digit code for each "Send code", from the
 * browser's own random numbers. The tiny bias of taking a remainder does
 * not matter for a code that is shown on screen in a demo.
 */
import { codeFromNumber } from './sign-in-flow.ts'

export function makeCode(): string {
  const random = new Uint32Array(1)
  crypto.getRandomValues(random)
  return codeFromNumber(random[0] ?? 0)
}
