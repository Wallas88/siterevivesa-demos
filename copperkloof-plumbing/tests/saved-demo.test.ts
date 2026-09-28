/*
 * saved-demo.test.ts — what read back from the browser is trusted: a good
 * save round-trips, anything else (another version, a bad job, a bad
 * price) is dropped. Also the memory store the demo falls back to.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readSavedDemo, SAVED_VERSION } from '../src/features/storage/saved-demo.ts'
import { toSavedEnvelope } from '../../_core/storage/saved-envelope.ts'
import type { DemoData } from '../src/features/storage/saved-demo.ts'
import { SEED_HOURS } from '../src/content/seed.ts'

function data(): DemoData {
  return {
    jobs: [{ id: 'j1', title: 'Leak fixed', caption: 'Quick one', suburb: 'Testvale', photo: { kind: 'stored', photoId: 'p1' }, featured: true }],
    prices: [{ id: 'fix', label: 'A fix', cents: 50_000 }],
    hours: SEED_HOURS,
    specials: [{ id: 's1', title: 'Offer', line: 'One line', endsOn: '2030-01-31' }],
    team: null,
  }
}

test('a save reads back exactly as it was written', function roundTrips() {
  assert.deepEqual(readSavedDemo(toSavedEnvelope(SAVED_VERSION, data())), data())
})

test('a save from another version starts fresh', function refusesOtherVersion() {
  assert.equal(readSavedDemo({ version: SAVED_VERSION + 1, data: data() }), null)
})

test('a job without a photo makes the whole save unreadable', function refusesBadJob() {
  const saved = { version: SAVED_VERSION, data: { ...data(), jobs: [{ id: 'j1', title: 'x', caption: '', suburb: 'Testvale' }] } }
  assert.equal(readSavedDemo(saved), null)
})

test('a negative or fractional price is refused', function refusesBadPrice() {
  const negative = { version: SAVED_VERSION, data: { ...data(), prices: [{ id: 'p', label: 'x', cents: -1 }] } }
  const fraction = { version: SAVED_VERSION, data: { ...data(), prices: [{ id: 'p', label: 'x', cents: 1.5 }] } }
  assert.equal(readSavedDemo(negative), null)
  assert.equal(readSavedDemo(fraction), null)
})

test('text, null and arrays are not a save', function refusesJunk() {
  assert.equal(readSavedDemo('hello'), null)
  assert.equal(readSavedDemo(null), null)
  assert.equal(readSavedDemo([]), null)
})

test('a save with a day missing from the week is dropped', function refusesShortWeek() {
  assert.equal(readSavedDemo({ version: SAVED_VERSION, data: { ...data(), hours: SEED_HOURS.slice(1) } }), null)
})

test('a special with a badly written end date is dropped', function refusesBadEndDate() {
  const specials = [{ id: 's', title: 'x', line: '', endsOn: '31/01/2030' }]
  assert.equal(readSavedDemo({ version: SAVED_VERSION, data: { ...data(), specials } }), null)
})

test('a set-up team saves and reads back; one without an owner is dropped', function readsTeam() {
  const team = [
    { email: 'owner@testshop.example', name: 'Owner', role: 'owner' as const },
    { email: 'thandi@testshop.example', name: 'Thandi', role: 'admin' as const },
  ]
  assert.deepEqual(readSavedDemo(toSavedEnvelope(SAVED_VERSION, { ...data(), team }))?.team, team)
  assert.equal(readSavedDemo({ version: SAVED_VERSION, data: { ...data(), team: [{ ...team[1] }] } }), null)
})

test('a save from before hours and specials (version 1) starts fresh', function refusesVersionOne() {
  assert.equal(readSavedDemo({ version: 1, data: { jobs: [], prices: [] } }), null)
})
