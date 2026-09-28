/*
 * use-menu-sheet.ts — the phone menu sheet's open state and its controls.
 * The listeners that close it (a link tap, a press outside, Escape, focus
 * leaving the header) are attached only while it is open (menu-handlers.ts).
 */
import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { listenForClose, toggleMenu } from './menu-handlers.ts'
import type { MenuState } from './menu-handlers.ts'

export interface MenuSheet {
  open: boolean
  header: RefObject<HTMLElement | null>
  toggle: RefObject<HTMLButtonElement | null>
  onToggle: () => void
}

export function useMenuSheet(): MenuSheet {
  const [open, setOpen] = useState(false)
  const openRef = useRef(open)
  openRef.current = open
  const header = useRef<HTMLElement | null>(null)
  const toggle = useRef<HTMLButtonElement | null>(null)
  const [state] = useState<MenuState>(makeState)
  useEffect(listenWhileOpen, [open, state])
  return { open, header, toggle, onToggle: toggleMenu.bind(null, state) }

  function makeState(): MenuState {
    return { header, toggle, isOpen: readOpen, setOpen }
  }

  function readOpen(): boolean {
    return openRef.current
  }

  function listenWhileOpen(): (() => void) | undefined {
    return open ? listenForClose(state) : undefined
  }
}
