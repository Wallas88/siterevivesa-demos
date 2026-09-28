/*
 * use-scrolled.ts — whether the page has scrolled past the first few
 * pixels, which tightens the header (navigation.js, 21 Sep 2026). Only
 * the padding changes; the layout never rearranges on scroll.
 */
import { useEffect, useState } from 'react'

export const SCROLLED_AFTER_PX = 8

export function isScrolledPast(scrollY: number): boolean {
  return scrollY > SCROLLED_AFTER_PX
}

export function useScrolled(): boolean {
  const [scrolled, setScrolled] = useState(false)
  // biome-ignore lint/correctness/useExhaustiveDependencies: listens once; update only calls a state setter, which never changes
  useEffect(listenToScroll, [])
  return scrolled

  function update(): void {
    setScrolled(isScrolledPast(window.scrollY))
  }

  function listenToScroll(): () => void {
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('pageshow', update)
    return stopListening

    function stopListening(): void {
      window.removeEventListener('scroll', update)
      window.removeEventListener('pageshow', update)
    }
  }
}
