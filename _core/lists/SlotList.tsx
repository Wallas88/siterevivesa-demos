/*
 * SlotList.tsx — a list shown as fixed slots (Nothing hops): rows are keyed
 * by position, so moving or removing an item swaps what the slots show
 * while every button stays where it was; each row's content is keyed by
 * its item and fades in. Only the end of the list eases open or closed
 * (use-slot-change.ts), and a closing row has the shape the demo gives it.
 */
import type { ReactNode } from 'react'
import { useSlotChange } from './use-slot-change.ts'

interface SlotListProps<Item> {
  items: Item[]
  className: string
  slotClassName: string
  // The row for one item; the list wraps it in its slot.
  renderItem: (item: Item, index: number) => ReactNode
  // An empty row the same height as a real one, shown while the end of the list closes.
  closingShape: ReactNode
  empty: ReactNode
}

export function SlotList<Item>({ items, className, slotClassName, renderItem, closingShape, empty }: SlotListProps<Item>) {
  const change = useSlotChange(items.length)

  function renderSlot(item: Item, index: number) {
    const opening = index >= change.openingFrom ? ' slot-opening' : ''
    return (
      <li className={`${slotClassName}${opening}`} key={index}>
        <div className="slot-inner">{renderItem(item, index)}</div>
      </li>
    )
  }

  function renderClosing(_unused: unknown, index: number) {
    return (
      <li className={`${slotClassName} slot-closing`} key={`closing-${index}`} aria-hidden="true">
        <div className="slot-inner">{closingShape}</div>
      </li>
    )
  }

  if (items.length === 0 && change.closing === 0) return empty
  return (
    <ol className={className}>
      {items.map(renderSlot)}
      {Array.from({ length: change.closing }, renderClosing)}
    </ol>
  )
}
