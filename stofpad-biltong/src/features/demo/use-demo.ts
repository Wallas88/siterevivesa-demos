/*
 * use-demo.ts — Stofpad's content for the views: products, hours and
 * specials, with the admin actions. The shared hook does the loading,
 * saving and photo URLs; this passes it Stofpad's reducer, seed, store
 * setup and actions.
 */
import { useContentDemo } from '../../../../_core/demo/use-content-demo.ts'
import type { ContentDemo } from '../../../../_core/demo/use-content-demo.ts'
import type { ErrorCode } from '../../../shared/error-codes.ts'
import { DEMO_SETUP } from '../storage/saved-demo.ts'
import { DEMO_OWNER_EMAIL, DEMO_OWNER_NAME, TEAM_DOMAIN } from '../../content/business.ts'
import type { DemoData } from '../storage/saved-demo.ts'
import { createDemoActions } from './demo-actions.ts'
import type { DemoActions } from './demo-actions.ts'
import { demoReducer, seedData } from './demo-reducer.ts'
import type { DemoAction } from './demo-reducer.ts'

export type Demo = ContentDemo<DemoData, DemoActions, ErrorCode>

function loadedAction(data: DemoData): DemoAction {
  return { type: 'loaded', data }
}

export function useDemo(today: string): Demo {
  return useContentDemo({ setup: DEMO_SETUP, reducer: demoReducer, seed: seedData, loadedAction, createActions: createDemoActions, today, signedIn: { email: DEMO_OWNER_EMAIL, name: DEMO_OWNER_NAME }, teamDomain: TEAM_DOMAIN })
}
