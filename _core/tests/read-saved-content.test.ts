/*
 * read-saved-content.test.ts — which saved photos, hours and specials are
 * trusted, with made-up content: a sound week, specials with and without
 * translations, and each kind of bad item.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readSavedHours, readSavedPhoto, readSavedSpecials, readSavedTeam } from '../storage/read-saved-content.ts'
import { firstTeam } from '../team/team.ts'
import { WEEKDAYS } from '../hours/opening-hours.ts'
import type { DayHours, Weekday } from '../hours/opening-hours.ts'
import { MAX_SPECIALS } from '../specials/specials.ts'

function week(): DayHours[] {
  return WEEKDAYS.map(makeDay)

  function makeDay(day: Weekday): DayHours {
    return { day, open: true, opens: '08:00', closes: '17:00' }
  }
}

function special(id: string): Record<string, unknown> {
  return { id, title: `Offer ${id}`, line: '', endsOn: null }
}

test('seed and stored photo references read back; anything else does not', function readsPhotos() {
  assert.deepEqual(readSavedPhoto({ kind: 'seed', src: '/a.svg' }), { kind: 'seed', src: '/a.svg' })
  assert.deepEqual(readSavedPhoto({ kind: 'stored', photoId: 'p' }), { kind: 'stored', photoId: 'p' })
  assert.equal(readSavedPhoto({ kind: 'stored' }), null)
  assert.equal(readSavedPhoto('a.svg'), null)
})

test('a full week reads back; a missing day, an unknown day or backwards times do not', function readsHours() {
  assert.deepEqual(readSavedHours(week()), week())
  assert.equal(readSavedHours(week().slice(1)), null)
  assert.equal(readSavedHours([{ ...week()[0], day: 'funday' }, ...week().slice(1)]), null)
  assert.equal(readSavedHours([{ ...week()[0], opens: '18:00' }, ...week().slice(1)]), null)
})

test('specials read back with or without translations and end dates', function readsSpecials() {
  const bilingual = { ...special('b'), endsOn: '2030-01-31', translations: { af: { title: 'Aanbod', line: '' } } }
  assert.deepEqual(readSavedSpecials([special('a'), bilingual]), [{ id: 'a', title: 'Offer a', line: '', endsOn: null }, bilingual])
})

test('a badly written end date, a broken translation or too many specials are refused', function refusesSpecials() {
  assert.equal(readSavedSpecials([{ ...special('a'), endsOn: '31/01/2030' }]), null)
  assert.equal(readSavedSpecials([{ ...special('a'), translations: { af: 'Aanbod' } }]), null)
  assert.equal(readSavedSpecials(Array.from({ length: MAX_SPECIALS + 1 }, makeSpecial)), null)

  function makeSpecial(_value: unknown, index: number): Record<string, unknown> {
    return special(String(index))
  }
})

test('a team reads back only with exactly one owner; before setup it is null', function readsTeam() {
  const team = firstTeam('owner@testshop.example', 'Owner')
  assert.deepEqual(readSavedTeam(team), team)
  assert.equal(readSavedTeam(null), null)
  assert.equal(readSavedTeam([{ ...team[0], role: 'admin' }, team[1]]), undefined)
  assert.equal(readSavedTeam([{ email: 'a', name: 'A', role: 'boss' }]), undefined)
})
