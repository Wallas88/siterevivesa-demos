/*
 * use-content-demo.ts — the one hook a demo's views use for its content:
 * the current data, photo URLs, any notice, the "just added" and reset
 * markers, and the demo's own actions. It loads the visitor's saved demo
 * once and saves after every change; components never touch storage. The
 * demo passes its reducer, seed, setup and how to build its actions.
 */
import { useMemo, useReducer, useRef, useState } from 'react'
import type { Dispatch } from 'react'
import type { DemoStore } from '../storage/demo-store.ts'
import { createMemoryStore } from '../storage/memory-store.ts'
import type { PhotoUrls } from '../photos/photo-urls.ts'
import { usePhotoUrls } from '../photos/use-photo-urls.ts'
import type { DemoSetup } from './load-demo.ts'
import { useDemoMarks } from './use-demo-marks.ts'
import { useLoadDemo } from './use-load-demo.ts'
import { useSaveOnChange } from './use-save-on-change.ts'

// What every demo's actions are given: the store, the reducer's dispatch, and the view's markers.
export interface ActionDependencies<Data, Action, Code extends string> {
  store: DemoStore<Data>
  dispatch: Dispatch<Action>
  latestData: () => Data
  keepPhotoUrl: (photoId: string, photo: Blob) => void
  dropPhotoUrl: (photoId: string) => void
  dropAllPhotoUrls: () => void
  showNotice: (code: Code) => void
  // The website marks this item "Just added" until another one is.
  markAdded: (itemId: string) => void
  // Counts resets, so editors holding their own text start again from the seed.
  markReset: () => void
  // Today's date, "YYYY-MM-DD", from the one place that reads the clock (specials/use-today.ts).
  today: () => string
  // Who is signed in to the mock, and the domain people added to the panel get.
  signedIn: { email: string; name: string }
  teamDomain: string
}

export interface ContentDemoSetup<Data, Action, Actions, Code extends string> {
  setup: DemoSetup<Data>
  reducer: (data: Data, action: Action) => Data
  seed: () => Data
  loadedAction: (data: Data) => Action
  createActions: (deps: ActionDependencies<Data, Action, Code>) => Actions
  today: string
  signedIn: { email: string; name: string }
  teamDomain: string
}

export interface ContentDemo<Data, Actions, Code extends string> {
  ready: boolean
  data: Data
  photoUrls: PhotoUrls
  notice: Code | null
  lastAddedId: string | null
  resetCount: number
  actions: Actions
}

export function useContentDemo<Data, Action, Actions, Code extends string>(demo: ContentDemoSetup<Data, Action, Actions, Code>): ContentDemo<Data, Actions, Code> {
  const [data, dispatch] = useReducer(demo.reducer, undefined, demo.seed)
  const [notice, setNotice] = useState<Code | null>(null)
  const photos = usePhotoUrls()
  const marks = useDemoMarks()
  const store = useLoadDemo({ setup: demo.setup, loaded: dispatchLoaded, replacePhotoUrls: photos.replace, showNotice: setNotice as (code: string | null) => void })
  const latest = useRef({ data, today: demo.today })
  latest.current = { data, today: demo.today }
  // biome-ignore lint/correctness/useExhaustiveDependencies: rebuilt when the store opens; every other helper here only uses state setters, refs and fixed controls, which never change
  const actions = useMemo(buildActions, [store])
  useSaveOnChange(store, data, setNotice as (code: string) => void)
  return { ready: store != null, data, photoUrls: photos.urls, notice, lastAddedId: marks.lastAddedId, resetCount: marks.resetCount, actions }

  function dispatchLoaded(loaded: Data): void {
    dispatch(demo.loadedAction(loaded))
  }

  function buildActions(): Actions {
    const photoUrls = { keepPhotoUrl: photos.keep, dropPhotoUrl: photos.drop, dropAllPhotoUrls: photos.dropAll }
    const markers = { showNotice: setNotice, markAdded: marks.markAdded, markReset: marks.markReset }
    const people = { signedIn: demo.signedIn, teamDomain: demo.teamDomain }
    return demo.createActions({ store: store ?? createMemoryStore<Data>(), dispatch, latestData, today: latestToday, ...markers, ...photoUrls, ...people })
  }

  function latestData(): Data {
    return latest.current.data
  }

  function latestToday(): string {
    return latest.current.today
  }
}
