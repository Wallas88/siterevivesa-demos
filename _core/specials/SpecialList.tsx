/*
 * SpecialList.tsx — the owner's specials as fixed slots (SlotList):
 * removing one fades the next into its place instead of moving the Remove
 * buttons. A special past its end date stays listed, marked as hidden
 * from the website.
 */
import { SlotList } from '../lists/SlotList.tsx'
import { endText, isShowing, specialText } from './specials.ts'
import type { Special } from './specials.ts'
import type { SpecialWords } from './special-words.ts'

interface SpecialListProps {
  specials: Special[]
  today: string
  language: string
  words: SpecialWords
  onRemove: (id: string) => void
}

const CLOSING_SHAPE = <div className="special-row" />

export function SpecialList({ specials, today, language, words, onRemove }: SpecialListProps) {
  function renderSpecial(special: Special) {
    const ends = endText(special.endsOn, words.endDate)
    const status = !isShowing(special, today) ? words.ended : ends === '' ? words.showsUntilRemoved : ends
    const title = specialText(special, language).title

    function remove(): void {
      onRemove(special.id)
    }

    return (
      <div className="special-row">
        <div className="special-row-text" key={special.id}>
          <p className="slot-title">{title}</p>
          <p className="slot-meta">{status}</p>
        </div>
        <button type="button" className="button button-secondary" onClick={remove} data-resizes-list="" aria-label={`${words.remove}: ${title}`}>
          {words.remove}
        </button>
      </div>
    )
  }

  return <SlotList items={specials} className="slot-list" slotClassName="slot" renderItem={renderSpecial} closingShape={CLOSING_SHAPE} empty={<p className="slot-list-empty">{words.empty}</p>} />
}
