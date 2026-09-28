/*
 * demo-reducer.ts — every change the admin panel can make to the demo, as
 * one pure reducer over the jobs and prices. The website and the admin
 * both read the result, which is why a change shows on the site at once.
 * Tested in tests/demo-reducer.test.ts.
 */
import { SEED_HOURS, SEED_JOBS, SEED_PRICES, SEED_SPECIALS } from '../../content/seed.ts'
import { contentReducer } from '../../../../_core/demo/content-reducer.ts'
import type { ContentAction } from '../../../../_core/demo/content-reducer.ts'
import { addJob, removeJob, moveJob, toggleFeatured } from '../jobs/jobs.ts'
import type { Job, MoveDirection } from '../jobs/jobs.ts'
import { setPrice, renameItem } from '../prices/price-list.ts'
import type { DemoData } from '../storage/saved-demo.ts'

export type DemoAction =
  | { type: 'loaded'; data: DemoData }
  | { type: 'jobAdded'; job: Job }
  | { type: 'jobRemoved'; id: string }
  | { type: 'jobMoved'; id: string; direction: MoveDirection }
  | { type: 'jobFeatured'; id: string }
  | { type: 'priceSet'; id: string; cents: number }
  | { type: 'priceRenamed'; id: string; label: string }
  | ContentAction
  | { type: 'reset' }

export function seedData(): DemoData {
  return { jobs: SEED_JOBS, prices: SEED_PRICES, hours: SEED_HOURS, specials: SEED_SPECIALS, team: null }
}

function withJobs(data: DemoData, jobs: Job[]): DemoData {
  return jobs === data.jobs ? data : { ...data, jobs }
}

export function demoReducer(data: DemoData, action: DemoAction): DemoData {
  switch (action.type) {
    case 'loaded':
      return action.data
    case 'jobAdded': {
      const added = addJob(data.jobs, action.job)
      return added.ok ? withJobs(data, added.value) : data
    }
    case 'jobRemoved':
      return withJobs(data, removeJob(data.jobs, action.id))
    case 'jobMoved':
      return withJobs(data, moveJob(data.jobs, action.id, action.direction))
    case 'jobFeatured':
      return withJobs(data, toggleFeatured(data.jobs, action.id))
    case 'priceSet':
      return { ...data, prices: setPrice(data.prices, action.id, action.cents) }
    case 'priceRenamed':
      return { ...data, prices: renameItem(data.prices, action.id, action.label) }
    case 'reset':
      return seedData()
    default:
      return contentReducer(data, action)
  }
}
