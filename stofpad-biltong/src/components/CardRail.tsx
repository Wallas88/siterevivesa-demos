/*
 * CardRail.tsx — a sideways-scrolling rail of cards with previous/next
 * buttons under it (disabled at either end), mouse dragging and arrow
 * keys, as the static demo's rails worked. The buttons sit in the same
 * place whatever the rail shows (Nothing hops).
 */
import type { ReactNode } from 'react'
import { useCardRail } from '../features/rail/use-card-rail.ts'

export interface RailWords {
  previous: string
  next: string
  name: string
}

interface CardRailProps {
  id: string
  className: string
  labelledBy: string
  cardCount: number
  words: RailWords
  children: ReactNode
}

// The arrows are drawn, not typed, so they add no text size to the section.
function RailArrow({ direction }: { direction: 'previous' | 'next' }) {
  return (
    <svg className="rail-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === 'next' ? 'M5 12h14M13 6l6 6-6 6' : 'M19 12H5M11 6l-6 6 6 6'} />
    </svg>
  )
}

export function CardRail({ id, className, labelledBy, cardCount, words, children }: CardRailProps) {
  const rail = useCardRail(cardCount)

  function previous(): void {
    rail.step(-1)
  }

  function next(): void {
    rail.step(1)
  }

  return (
    <>
      {/* biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region must take focus so keyboard users can scroll it with the arrow keys (WCAG 2.1.1) */}
      <div className={className} id={id} ref={rail.ref} tabIndex={0} role="region" aria-labelledby={labelledBy} {...rail.handlers}>
        {children}
      </div>
      <div className="rail-controls">
        <button type="button" aria-controls={id} aria-label={`${words.previous} ${words.name}`} onClick={previous} disabled={rail.ends.atStart}>
          <RailArrow direction="previous" />
        </button>
        <button type="button" aria-controls={id} aria-label={`${words.next} ${words.name}`} onClick={next} disabled={rail.ends.atEnd}>
          <RailArrow direction="next" />
        </button>
      </div>
    </>
  )
}
