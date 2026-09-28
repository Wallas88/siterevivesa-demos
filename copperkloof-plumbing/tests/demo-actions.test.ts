/*
 * demo-actions.test.ts — what the admin buttons do, in order, against the
 * memory store and a recording dispatch: a refused job leaves nothing
 * behind, an added job keeps its photo, a removed job frees it, reset
 * clears the store, and a price is changed only when it reads as rand.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { createDemoActions } from '../src/features/demo/demo-actions.ts'
import type { ActionDependencies } from '../src/features/demo/demo-actions.ts'
import { demoReducer, seedData } from '../src/features/demo/demo-reducer.ts'
import type { DemoAction } from '../src/features/demo/demo-reducer.ts'
import { createMemoryStore } from '../../_core/storage/memory-store.ts'
import type { DemoData } from '../src/features/storage/saved-demo.ts'
import { AREAS } from '../src/content/business.ts'
import { MAX_JOBS } from '../src/features/jobs/jobs.ts'
import type { Job } from '../src/features/jobs/jobs.ts'

interface Recording {
  actions: DemoAction[]
  kept: string[]
  dropped: string[]
  notices: string[]
  data: DemoData
}

type Harness = Recording & { deps: ActionDependencies }

function current(run: Recording): DemoData {
  return run.data
}

function record(run: Recording, action: DemoAction): void {
  run.actions.push(action)
  run.data = demoReducer(run.data, action)
}

function note(list: string[], entry: string): void {
  list.push(entry)
}

function todayForTests(): string {
  return TEST_TODAY
}

function harness(start: DemoData = seedData()): Harness {
  const run: Recording = { actions: [], kept: [], dropped: [], notices: [], data: start }
  const deps: ActionDependencies = {
    store: createMemoryStore<DemoData>(),
    dispatch: record.bind(null, run),
    latestData: current.bind(null, run),
    keepPhotoUrl: note.bind(null, run.kept),
    dropPhotoUrl: note.bind(null, run.dropped),
    dropAllPhotoUrls: note.bind(null, run.dropped, '*'),
    showNotice: note.bind(null, run.notices),
    markAdded: note.bind(null, run.notices),
    markReset: note.bind(null, run.notices, 'reset'),
    today: todayForTests,
    signedIn: { email: 'owner@testshop.example', name: 'Owner' },
    teamDomain: 'testshop.example',
  }
  return Object.assign(run, { deps })
}

const TEST_TODAY = '2030-05-15'
const PHOTO = new Blob(['made-up photo bytes'], { type: 'image/jpeg' })
const AREA = AREAS[0] ?? ''

test('a job with no title is refused before anything is kept', async function refusesFirst() {
  const run = harness()
  const added = await createDemoActions(run.deps).addJob({ title: ' ', caption: '', suburb: AREA }, PHOTO)
  assert.equal(added.ok, false)
  assert.deepEqual(run.actions, [])
  assert.deepEqual(run.kept, [])
})

test('an added job keeps its photo in the store and shows first', async function addsJob() {
  const run = harness()
  const added = await createDemoActions(run.deps).addJob({ title: 'New tap', caption: 'Shiny', suburb: AREA }, PHOTO)
  assert.ok(added.ok)
  const first = run.data.jobs[0]
  assert.equal(first?.title, 'New tap')
  assert.equal(first?.photo.kind, 'stored')
  const photoId = first?.photo.kind === 'stored' ? first.photo.photoId : ''
  assert.deepEqual(await run.deps.store.loadPhoto(photoId), { ok: true, value: PHOTO })
})

test('a full list refuses a new job and keeps no photo', async function refusesWhenFull() {
  const full = { ...seedData(), jobs: Array.from({ length: MAX_JOBS }, makeJob) }
  const run = harness(full)
  const added = await createDemoActions(run.deps).addJob({ title: 'One more', caption: '', suburb: AREA }, PHOTO)
  assert.equal(added.ok ? 'OK' : added.code, 'JOBS_FULL')
  assert.deepEqual(run.kept, [])

  function makeJob(_value: unknown, index: number): Job {
    return { id: `j${index}`, title: 't', caption: '', suburb: AREA, photo: { kind: 'seed', src: '/x.svg' }, featured: false }
  }
})

test('removing a job with its own photo frees that photo', async function removesWithPhoto() {
  const run = harness()
  const actions = createDemoActions(run.deps)
  await actions.addJob({ title: 'Temp', caption: '', suburb: AREA }, PHOTO)
  const added = run.data.jobs[0]
  const photoId = added?.photo.kind === 'stored' ? added.photo.photoId : ''
  await actions.removeJob(added?.id ?? '')
  assert.deepEqual(run.dropped, [photoId])
  assert.deepEqual(await run.deps.store.loadPhoto(photoId), { ok: true, value: null })
})

test('reset clears the store and brings back the seed', async function resets() {
  const run = harness()
  const actions = createDemoActions(run.deps)
  await actions.addJob({ title: 'Temp', caption: '', suburb: AREA }, PHOTO)
  await actions.resetDemo()
  assert.deepEqual(run.data, seedData())
  assert.ok(run.dropped.includes('*'))
})

test('a price that is not rand changes nothing', function refusesBadPrice() {
  const run = harness()
  const priceId = seedData().prices[0]?.id ?? ''
  const set = createDemoActions(run.deps).setPrice(priceId, 'cheap')
  assert.equal(set.ok, false)
  assert.deepEqual(run.actions, [])
})

test('new opening times that close before they open are refused and change nothing', function refusesHours() {
  const run = harness()
  const set = createDemoActions(run.deps).setDayTimes('mon', '17:00', '07:00')
  assert.equal(set.ok ? 'OK' : set.code, 'HOURS_INVALID')
  assert.deepEqual(run.actions, [])
})

test('good opening times and closing a day show in the hours', function setsHours() {
  const run = harness()
  const actions = createDemoActions(run.deps)
  assert.ok(actions.setDayTimes('sat', '09:00', '12:00').ok)
  actions.setDayOpen('mon', false)
  assert.equal(run.data.hours.find(isSaturday)?.closes, '12:00')
  assert.equal(run.data.hours[0]?.open, false)

  function isSaturday(row: { day: string }): boolean {
    return row.day === 'sat'
  }
})

test('a special ending yesterday is refused against the passed-in today', function refusesEnded() {
  const run = harness()
  const added = createDemoActions(run.deps).addSpecial({ title: 'Old sale', line: '', endsOn: '2030-05-14' })
  assert.equal(added.ok ? 'OK' : added.code, 'SPECIAL_ENDED')
})

test('an added special goes first and can be removed again', function addsAndRemovesSpecial() {
  const run = harness()
  const actions = createDemoActions(run.deps)
  assert.ok(actions.addSpecial({ title: 'Spring offer', line: 'One line', endsOn: '2030-06-01' }).ok)
  const first = run.data.specials[0]
  assert.equal(first?.title, 'Spring offer')
  actions.removeSpecial(first?.id ?? '')
  assert.equal(run.data.specials.length, seedData().specials.length)
})
