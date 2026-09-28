/*
 * content-reducer.test.ts — the shared hours and specials changes, and
 * the shared admin actions against a recording dispatch, with made-up
 * content and a fixed today.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { contentReducer, isContentAction } from '../demo/content-reducer.ts'
import type { ContentAction, SharedContent } from '../demo/content-reducer.ts'
import { createContentActions } from '../demo/content-actions.ts'
import type { ContentDependencies } from '../demo/content-actions.ts'
import { WEEKDAYS } from '../hours/opening-hours.ts'
import type { DayHours, Weekday } from '../hours/opening-hours.ts'
import { succeed } from '../result/result.ts'

const OWNER = 'owner@testshop.example'

interface Content extends SharedContent {
  extra: string
}

function week(): DayHours[] {
  return WEEKDAYS.map(makeDay)

  function makeDay(day: Weekday): DayHours {
    return { day, open: true, opens: '08:00', closes: '16:00' }
  }
}

function content(): Content {
  return { hours: week(), specials: [], team: null, extra: 'kept' }
}

interface Recorded {
  data: Content
  actions: string[]
}

function harness(): { deps: ContentDependencies; run: Recorded } {
  const run: Recorded = { data: content(), actions: [] }
  const deps: ContentDependencies = {
    dispatch: record.bind(null, run),
    latestData: current.bind(null, run),
    today: fixedToday,
    store: { clear: clearStore },
    dropAllPhotoUrls: note.bind(null, run, 'photos dropped'),
    markReset: note.bind(null, run, 'marked reset'),
    showNotice: note.bind(null, run),
    signedIn: { email: OWNER, name: 'Owner' },
    teamDomain: 'testshop.example',
  }
  return { deps, run }
}

function record(run: Recorded, action: ContentAction | { type: 'reset' }): void {
  run.actions.push(action.type)
  if (isContentAction(action)) run.data = contentReducer(run.data, action)
}

function current(run: Recorded): Content {
  return run.data
}

function fixedToday(): string {
  return '2030-05-15'
}

async function clearStore() {
  return succeed(true as const)
}

function note(run: Recorded, entry: string): void {
  run.actions.push(entry)
}

test('closing a day and changing times leave the rest of the content alone', function changesHours() {
  const closed = contentReducer(content(), { type: 'dayOpenSet', day: 'sun', open: false })
  assert.equal(closed.hours[6]?.open, false)
  assert.equal(closed.extra, 'kept')
})

test('only the shared action types are content actions', function knowsTypes() {
  assert.equal(isContentAction({ type: 'hoursSet' }), true)
  assert.equal(isContentAction({ type: 'jobAdded' }), false)
})

test('backwards opening times are refused and change nothing', function refusesHours() {
  const { deps, run } = harness()
  const set = createContentActions(deps).setDayTimes('mon', '17:00', '07:00')
  assert.equal(set.ok ? 'OK' : set.code, 'HOURS_INVALID')
  assert.deepEqual(run.actions, [])
})

test('a special ending before the passed-in today is refused; one ending later is added first', function addsSpecials() {
  const { deps, run } = harness()
  const actions = createContentActions(deps)
  const ended = actions.addSpecial({ title: 'Old', line: '', endsOn: '2030-05-14' })
  assert.equal(ended.ok ? 'OK' : ended.code, 'SPECIAL_ENDED')
  assert.ok(actions.addSpecial({ title: 'New', line: '', endsOn: '2030-06-01' }).ok)
  assert.equal(run.data.specials[0]?.title, 'New')
})

test('reset clears the store, drops photo URLs, dispatches reset and marks it, in that order', async function resets() {
  const { deps, run } = harness()
  await createContentActions(deps).resetDemo()
  assert.deepEqual(run.actions, ['photos dropped', 'reset', 'marked reset'])
})

test('the first setup lists the signed-in owner and the builder; only the owner changes the list', function managesTeam() {
  const { deps, run } = harness()
  const actions = createContentActions(deps)
  assert.equal(actions.addMember('Thandi').ok, false)
  actions.setUpTeam()
  assert.equal(run.data.team?.[0]?.email, OWNER)
  assert.ok(actions.addMember('Thandi').ok)
  assert.ok(actions.transferOwnership('thandi@testshop.example').ok)
  const notOwner = actions.addMember('Sipho')
  assert.equal(notOwner.ok ? 'OK' : notOwner.code, 'TEAM_NOT_OWNER')
})
