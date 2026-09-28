/*
 * use-card-rail.ts — one card rail for a component: a ref for the rail,
 * whether it is at either end (so previous/next can be disabled), its
 * event handlers, and stepping one card. The ends are read again when the
 * rail scrolls, resizes or its cards change.
 */
import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent, PointerEvent, RefObject } from 'react'
import { endDrag, onClickCapture, onDragStart, onKeyDown, onPointerDown, onPointerLeave, onPointerMove, reportEnds, stepBy } from './rail-handlers.ts'
import type { RailState } from './rail-handlers.ts'
import type { RailEnds } from './rail-rules.ts'

export interface CardRail {
  ref: RefObject<HTMLDivElement | null>
  ends: RailEnds
  step: (direction: number) => void
  handlers: {
    onScroll: () => void
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => void
    onPointerMove: (event: PointerEvent<HTMLDivElement>) => void
    onPointerUp: (event: PointerEvent<HTMLDivElement>) => void
    onPointerCancel: (event: PointerEvent<HTMLDivElement>) => void
    onLostPointerCapture: (event: PointerEvent<HTMLDivElement>) => void
    onPointerLeave: (event: PointerEvent<HTMLDivElement>) => void
    onClickCapture: (event: MouseEvent<HTMLDivElement>) => void
    onDragStart: (event: MouseEvent<HTMLDivElement>) => void
  }
}

function makeRail(state: RailState): Omit<CardRail, 'ends'> {
  const release = endDrag.bind(null, state)
  return {
    ref: state.rail,
    step: stepBy.bind(null, state),
    handlers: {
      onScroll: reportEnds.bind(null, state),
      onKeyDown: onKeyDown.bind(null, state),
      onPointerDown: onPointerDown.bind(null, state),
      onPointerMove: onPointerMove.bind(null, state),
      onPointerUp: release,
      onPointerCancel: release,
      onLostPointerCapture: release,
      onPointerLeave: onPointerLeave.bind(null, state),
      onClickCapture: onClickCapture.bind(null, state),
      onDragStart,
    },
  }
}

// cardCount: when the cards change (a filter, a new product), the ends are read again.
export function useCardRail(cardCount: number): CardRail {
  const [ends, setEnds] = useState<RailEnds>({ atStart: true, atEnd: false })
  const railRef = useRef<HTMLDivElement | null>(null)
  const [rail] = useState(buildRail)
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-reads the ends when the card count changes; the rail's handlers never change
  useEffect(watchSize, [cardCount])
  return { ...rail, ends }

  function buildRail(): Omit<CardRail, 'ends'> {
    return makeRail({ rail: railRef, drag: null, suppressClick: false, showEnds: setEnds })
  }

  function watchSize(): () => void {
    rail.handlers.onScroll()
    const observer = new ResizeObserver(rail.handlers.onScroll)
    if (railRef.current != null) observer.observe(railRef.current)
    return disconnect

    function disconnect(): void {
      observer.disconnect()
    }
  }
}
