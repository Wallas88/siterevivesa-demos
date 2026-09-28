/*
 * use-view.ts — the phone's Website / Admin switch: which view shows, kept
 * in the link (?view=admin) so a reload or a shared link opens the same
 * one, and a jump from the admin to the new job on the website. On wide
 * screens both views show and this only matters for that jump.
 */
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { viewFromSearch, searchForView } from './view-choice.ts'
import type { DemoView } from './view-choice.ts'

export interface ViewControls {
  current: DemoView
  choose: (view: DemoView) => void
  showOnSite: (sectionId: string) => void
}

function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useView(): ViewControls {
  const [current, setCurrent] = useState<DemoView>(firstView)
  return { current, choose, showOnSite }

  function firstView(): DemoView {
    return viewFromSearch(window.location.search)
  }

  function choose(view: DemoView): void {
    setCurrent(view)
    const search = searchForView(window.location.search, view)
    window.history.replaceState(null, '', `${window.location.pathname}${search}${window.location.hash}`)
  }

  // Shows the website first (so the section is laid out), then brings the section into view.
  function showOnSite(sectionId: string): void {
    flushSync(chooseSite)
    document.getElementById(sectionId)?.scrollIntoView({ behavior: reducedMotion() ? 'instant' : 'smooth', block: 'start' })
  }

  function chooseSite(): void {
    choose('site')
  }
}
