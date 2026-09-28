/*
 * use-shop.ts — the visitor's side of the shop in one place: the order,
 * what each card has picked, the toast, and the two things a visitor does
 * that touch more than one of them (adding to the order, which shows a
 * toast; changing language, which clears it).
 */
import { SETTINGS } from '../../content/catalogue.ts'
import { SHOP_WORDS } from '../../content/i18n.ts'
import { ERROR_MESSAGES } from '../../../shared/error-codes.ts'
import type { Language, Product } from '../catalogue/products.ts'
import type { LanguageControl } from '../language/use-language.ts'
import { useOrder } from '../order/use-order.ts'
import type { Order } from '../order/use-order.ts'
import { useSelections } from '../order/use-selections.ts'
import type { Selections } from '../order/use-selections.ts'
import { useToast } from '../order/use-toast.ts'

export interface Shop {
  order: Order
  selections: Selections
  toastMessage: string
  addToOrder: (product: Product) => void
  chooseLanguage: (language: Language) => void
}

export function useShop(products: Product[], language: LanguageControl): Shop {
  const order = useOrder(products, language.language, SETTINGS)
  const selections = useSelections()
  const toast = useToast()
  return { order, selections, toastMessage: toast.message, addToOrder, chooseLanguage }

  function addToOrder(product: Product): void {
    const added = order.add(selections.selectionFor(product))
    toast.show(added.ok ? SHOP_WORDS[language.language].added : ERROR_MESSAGES[language.language][added.code])
  }

  function chooseLanguage(next: Language): void {
    language.choose(next)
    toast.clear()
  }
}
