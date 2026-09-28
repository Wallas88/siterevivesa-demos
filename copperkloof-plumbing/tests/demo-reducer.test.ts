/*
 * demo-reducer.test.ts — each admin change applied to made-up demo data,
 * and reset bringing back the seed.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { demoReducer, seedData } from '../src/features/demo/demo-reducer.ts'
import type { DemoData } from '../src/features/storage/saved-demo.ts'
import type { Job } from '../src/features/jobs/jobs.ts'
import { SEED_HOURS } from '../src/content/seed.ts'

function job(id: string): Job {
  return { id, title: `Job ${id}`, caption: '', suburb: 'Testvale', photo: { kind: 'stored', photoId: `photo-${id}` }, featured: false }
}

function data(): DemoData {
  return { jobs: [job('a'), job('b')], prices: [{ id: 'fix', label: 'A fix', cents: 10_000 }], hours: SEED_HOURS, specials: [], team: null }
}

function idOf(item: Job): string {
  return item.id
}

test('a new job shows first', function addsJob() {
  const next = demoReducer(data(), { type: 'jobAdded', job: job('new') })
  assert.deepEqual(next.jobs.map(idOf), ['new', 'a', 'b'])
})

test('removing, moving and featuring change only the jobs', function changesJobs() {
  const start = data()
  const removed = demoReducer(start, { type: 'jobRemoved', id: 'a' })
  const moved = demoReducer(start, { type: 'jobMoved', id: 'b', direction: 'up' })
  const featured = demoReducer(start, { type: 'jobFeatured', id: 'b' })
  assert.deepEqual(removed.jobs.map(idOf), ['b'])
  assert.deepEqual(moved.jobs.map(idOf), ['b', 'a'])
  assert.equal(featured.jobs[1]?.featured, true)
  assert.equal(removed.prices, start.prices)
})

test('a move that changes nothing keeps the same data', function keepsSameData() {
  const start = data()
  assert.equal(demoReducer(start, { type: 'jobMoved', id: 'a', direction: 'up' }), start)
})

test('a price change and a rename show in the price list', function changesPrices() {
  const priced = demoReducer(data(), { type: 'priceSet', id: 'fix', cents: 25_000 })
  const renamed = demoReducer(priced, { type: 'priceRenamed', id: 'fix', label: 'Big fix' })
  assert.deepEqual(renamed.prices, [{ id: 'fix', label: 'Big fix', cents: 25_000 }])
})

test('reset brings back the seed jobs and prices', function resets() {
  assert.deepEqual(demoReducer(data(), { type: 'reset' }), seedData())
})

test('loaded data replaces what was there', function loads() {
  const loaded = data()
  assert.equal(demoReducer(seedData(), { type: 'loaded', data: loaded }), loaded)
})

test('the seed has one featured job and a price for every service', function seedIsSound() {
  const seed = seedData()
  assert.equal(seed.jobs.filter(isFeatured).length, 1)
  assert.ok(seed.prices.length > 0)

  function isFeatured(item: Job): boolean {
    return item.featured
  }
})

test('hours and specials changes leave jobs and prices alone', function changesContent() {
  const start = data()
  const closed = demoReducer(start, { type: 'dayOpenSet', day: 'sat', open: false })
  const added = demoReducer(start, { type: 'specialAdded', special: { id: 's', title: 'Offer', line: '', endsOn: null } })
  assert.equal(closed.hours[5]?.open, false)
  assert.equal(added.specials[0]?.id, 's')
  assert.equal(closed.jobs, start.jobs)
  assert.equal(demoReducer(added, { type: 'specialRemoved', id: 's' }).specials.length, 0)
})

test('the seed has a full week of hours and no special that has ended', function seedContent() {
  const seed = seedData()
  assert.equal(seed.hours.length, 7)
  assert.ok(seed.specials.every(hasNoEnd))

  function hasNoEnd(special: { endsOn: string | null }): boolean {
    return special.endsOn == null
  }
})
