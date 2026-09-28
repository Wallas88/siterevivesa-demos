/*
 * use-order.ts — the visitor's order: its lines, courier or not, and what
 * follows from them against the shop as it is now (the owner may change a
 * price, mark a product out of stock or remove it): the lines the shop can
 * take, how many were left out, the totals, the WhatsApp message and link.
 * The order is not saved, as in the static demo.
 */
import { useState } from 'react'
import type { Result } from '../../../../_core/result/result.ts'
import type { ErrorCode } from '../../../shared/error-codes.ts'
import type { Language, Product, Selection } from '../catalogue/products.ts'
import { addLine, linesInShop, totals } from './order.ts'
import type { OrderSettings, OrderTotals } from './order.ts'
import { orderMessage, whatsappLink } from './order-message.ts'
import { removeLine, setQuantity } from './order-lines.ts'

export interface Order {
  lines: Selection[]
  leftOut: number
  courier: boolean
  totals: OrderTotals
  message: string
  link: string
  add: (selection: Selection) => Result<Selection[], ErrorCode>
  remove: (line: Selection) => void
  changeQuantity: (line: Selection, quantity: number) => void
  setCourier: (courier: boolean) => void
}

export function useOrder(products: Product[], language: Language, settings: OrderSettings): Order {
  const [allLines, setAllLines] = useState<Selection[]>([])
  const [courierChosen, setCourier] = useState(false)
  const lines = linesInShop(allLines, products, settings.weights)
  // An empty order has no courier (the static demo unticked it).
  const courier = courierChosen && lines.length > 0
  const message = orderMessage(lines, courier, language, products, settings)
  const summary = { totals: totals(lines, courier, products, settings), message, link: whatsappLink(message, settings) }
  return { lines, leftOut: allLines.length - lines.length, courier, ...summary, add, remove, changeQuantity, setCourier }

  function add(selection: Selection): Result<Selection[], ErrorCode> {
    const added = addLine(allLines, selection, products, settings.weights)
    if (added.ok) setAllLines(added.value)
    return added
  }

  function remove(line: Selection): void {
    setAllLines(removeLine(allLines, line))
  }

  function changeQuantity(line: Selection, quantity: number): void {
    setAllLines(setQuantity(allLines, line, quantity))
  }
}
