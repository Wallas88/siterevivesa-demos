/*
 * use-published-height.ts — publishes the header's height as
 * --header-height on the page, so jumping to a section leaves it clear of
 * the sticky header and the phone menu sheet fits the screen
 * (navigation.js did the same).
 */
import { useEffect } from 'react'
import type { RefObject } from 'react'

export function usePublishedHeight(element: RefObject<HTMLElement | null>): void {
  // biome-ignore lint/correctness/useExhaustiveDependencies: observes once; the ref object never changes
  useEffect(observeHeight, [])

  function publish(): void {
    const height = element.current?.getBoundingClientRect().height
    if (height != null) document.documentElement.style.setProperty('--header-height', `${height}px`)
  }

  function observeHeight(): () => void {
    const observer = new ResizeObserver(publish)
    if (element.current != null) observer.observe(element.current)
    return disconnect

    function disconnect(): void {
      observer.disconnect()
    }
  }
}
