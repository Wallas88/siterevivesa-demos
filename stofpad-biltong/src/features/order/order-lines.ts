/*
 * order-lines.ts — changes to the order's lines as pure functions: remove
 * one, set its quantity (1 to 99 whole items; anything else keeps the
 * old quantity, as the static demo did), and find a line by its product,
 * size and preparation. Tested in tests/order.test.ts.
 */
import type { Selection } from '../catalogue/products.ts'
import { MAX_QUANTITY } from './order.ts'

export function sameLine(first: Selection, second: Selection): boolean {
  return first.id === second.id && first.grams === second.grams && first.option === second.option
}

export function removeLine(lines: Selection[], line: Selection): Selection[] {
  return lines.filter(isOther)

  function isOther(candidate: Selection): boolean {
    return !sameLine(candidate, line)
  }
}

export function isQuantity(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= MAX_QUANTITY
}

export function setQuantity(lines: Selection[], line: Selection, quantity: number): Selection[] {
  if (!isQuantity(quantity)) return lines
  return lines.map(withQuantity)

  function withQuantity(candidate: Selection): Selection {
    return sameLine(candidate, line) ? { ...candidate, quantity } : candidate
  }
}
