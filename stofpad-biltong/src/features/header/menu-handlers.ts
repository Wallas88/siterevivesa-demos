/*
 * menu-handlers.ts — when the phone menu sheet closes, as navigation.js
 * did: a tap on one of its links, a press outside the header, Escape
 * (focus goes back to the menu button), or focus leaving the header.
 * Plain functions of the menu's state, bound once by use-menu-sheet.ts;
 * the page-wide ones are listened for only while the sheet is open.
 */
import type { RefObject } from 'react'

export interface MenuState {
  header: RefObject<HTMLElement | null>
  toggle: RefObject<HTMLButtonElement | null>
  isOpen: () => boolean
  setOpen: (open: boolean) => void
}

export function toggleMenu(state: MenuState): void {
  state.setOpen(!state.isOpen())
}

export function closeOnLinkTap(state: MenuState, event: Event): void {
  if (event.target instanceof Element && event.target.closest('a[href]') != null) state.setOpen(false)
}

export function closeOnOutsidePress(state: MenuState, event: Event): void {
  const header = state.header.current
  if (header != null && event.target instanceof Node && !header.contains(event.target)) state.setOpen(false)
}

export function closeOnEscape(state: MenuState, event: KeyboardEvent): void {
  if (event.key !== 'Escape' || !state.isOpen()) return
  state.setOpen(false)
  state.toggle.current?.focus()
}

export function closeWhenFocusLeaves(state: MenuState, event: FocusEvent): void {
  const header = state.header.current
  if (header != null && !(event.relatedTarget instanceof Node && header.contains(event.relatedTarget))) state.setOpen(false)
}

// While the sheet is open: a link tap, a press outside, Escape, or focus leaving the header closes it. Returns the way to stop listening.
export function listenForClose(state: MenuState): () => void {
  const header = state.header.current
  const onPress = closeOnOutsidePress.bind(null, state)
  const onKey = closeOnEscape.bind(null, state)
  const onFocusOut = closeWhenFocusLeaves.bind(null, state)
  const onLinkTap = closeOnLinkTap.bind(null, state)
  header?.addEventListener('click', onLinkTap)
  document.addEventListener('click', onPress)
  document.addEventListener('keydown', onKey)
  header?.addEventListener('focusout', onFocusOut)
  return stopListening

  function stopListening(): void {
    document.removeEventListener('click', onPress)
    document.removeEventListener('keydown', onKey)
    header?.removeEventListener('focusout', onFocusOut)
    header?.removeEventListener('click', onLinkTap)
  }
}
