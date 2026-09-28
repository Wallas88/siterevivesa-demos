/*
 * rail-handlers.ts — what a card rail does with the mouse, keys and its
 * previous/next buttons, as the static demo did: touch scrolls natively;
 * a mouse drag starts after a deliberate move, captures the pointer,
 * scrolls, snaps to a card on release and swallows the click that ends
 * it; arrow keys and the buttons step one card; the ends are reported so
 * the buttons can be disabled. Each handler is a plain function of the
 * rail's state, bound once by use-card-rail.ts.
 */
import type { KeyboardEvent, MouseEvent, PointerEvent, RefObject } from 'react'
import { cardStep, isDeliberateDrag, railEnds, snapDestination } from './rail-rules.ts'
import type { RailEnds } from './rail-rules.ts'

interface Drag {
  pointerId: number
  startX: number
  startScroll: number
  moved: boolean
}

export interface RailState {
  rail: RefObject<HTMLDivElement | null>
  drag: Drag | null
  suppressClick: boolean
  showEnds: (ends: RailEnds) => void
}

const IGNORED_TARGETS = 'select, input, textarea, label'
const MAIN_BUTTON = 0

function scrollBehaviour(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
}

function stepOf(rail: HTMLDivElement): number {
  const card = rail.firstElementChild
  return card == null ? 0 : cardStep(card.getBoundingClientRect().width, Number.parseFloat(getComputedStyle(rail).columnGap))
}

export function reportEnds(state: RailState): void {
  const rail = state.rail.current
  if (rail != null) state.showEnds(railEnds(rail.scrollLeft, rail.scrollWidth, rail.clientWidth))
}

export function stepBy(state: RailState, direction: number): void {
  const rail = state.rail.current
  if (rail != null) rail.scrollBy({ left: direction * stepOf(rail), behavior: scrollBehaviour() })
}

export function onKeyDown(state: RailState, event: KeyboardEvent<HTMLDivElement>): void {
  if (event.target !== state.rail.current || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return
  event.preventDefault()
  stepBy(state, event.key === 'ArrowRight' ? 1 : -1)
}

export function onPointerDown(state: RailState, event: PointerEvent<HTMLDivElement>): void {
  state.suppressClick = false
  const target = event.target as Element
  if (event.pointerType !== 'mouse' || event.button !== MAIN_BUTTON || target.closest(IGNORED_TARGETS) != null) return
  state.drag = { pointerId: event.pointerId, startX: event.clientX, startScroll: state.rail.current?.scrollLeft ?? 0, moved: false }
}

export function onPointerMove(state: RailState, event: PointerEvent<HTMLDivElement>): void {
  const rail = state.rail.current
  const drag = state.drag
  if (rail == null || drag == null || drag.pointerId !== event.pointerId) return
  const distance = event.clientX - drag.startX
  if (!drag.moved && !isDeliberateDrag(distance)) return
  if (!drag.moved) {
    drag.moved = true
    rail.classList.add('is-dragging')
    rail.setPointerCapture(event.pointerId)
  }
  event.preventDefault()
  rail.scrollLeft = drag.startScroll - distance
}

export function endDrag(state: RailState, event: PointerEvent<HTMLDivElement>): void {
  const rail = state.rail.current
  const drag = state.drag
  if (rail == null || drag == null || drag.pointerId !== event.pointerId) return
  state.drag = null
  state.suppressClick = drag.moved
  rail.classList.remove('is-dragging')
  if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId)
  const step = stepOf(rail)
  if (drag.moved && step > 0) rail.scrollTo({ left: snapDestination(rail.scrollLeft, step, rail.scrollWidth - rail.clientWidth), behavior: scrollBehaviour() })
}

// A press that never moved and left the rail ends like a release.
export function onPointerLeave(state: RailState, event: PointerEvent<HTMLDivElement>): void {
  if (state.drag != null && !state.drag.moved) endDrag(state, event)
}

// The click that ends a drag must not also press the card's button.
export function onClickCapture(state: RailState, event: MouseEvent<HTMLDivElement>): void {
  if (!state.suppressClick || event.detail === 0) return
  state.suppressClick = false
  event.preventDefault()
  event.stopPropagation()
}

export function onDragStart(event: MouseEvent<HTMLDivElement>): void {
  event.preventDefault()
}
