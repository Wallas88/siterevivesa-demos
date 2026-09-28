/*
 * use-selections.ts — what each product card has picked (weight or pack,
 * preparation). A card that was never touched shows the product's first
 * selection (250 g or 5 kg, first option), as the static demo did.
 */
import { useState } from 'react'
import { firstSelection } from '../catalogue/products.ts'
import type { Product, Selection } from '../catalogue/products.ts'

export interface Selections {
  selectionFor: (product: Product) => Selection
  choose: (product: Product, change: Partial<Pick<Selection, 'grams' | 'option'>>) => void
}

export function useSelections(): Selections {
  const [picked, setPicked] = useState<Record<string, Selection>>({})
  return { selectionFor, choose }

  function selectionFor(product: Product): Selection {
    return picked[product.id] ?? firstSelection(product)
  }

  function choose(product: Product, change: Partial<Pick<Selection, 'grams' | 'option'>>): void {
    setPicked(withChange)

    function withChange(current: Record<string, Selection>): Record<string, Selection> {
      return { ...current, [product.id]: { ...(current[product.id] ?? firstSelection(product)), ...change } }
    }
  }
}
