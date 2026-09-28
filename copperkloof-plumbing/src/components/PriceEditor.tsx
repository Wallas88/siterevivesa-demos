/*
 * PriceEditor.tsx — the owner's example price list: rename an item or type
 * a new amount, and the website's "What we do" shows it at once. Keyed by
 * the reset count in AdminPanel, so Reset brings the typed text back too.
 */
import type { PriceItem } from '../features/prices/price-list.ts'
import type { PriceEditing } from '../features/prices/use-price-field.ts'
import { PriceRow } from './PriceRow.tsx'

interface PriceEditorProps {
  prices: PriceItem[]
  editing: PriceEditing
}

export function PriceEditor({ prices, editing }: PriceEditorProps) {
  function renderRow(item: PriceItem) {
    return <PriceRow key={item.id} item={item} editing={editing} />
  }

  return <ul className="price-list">{prices.map(renderRow)}</ul>
}
