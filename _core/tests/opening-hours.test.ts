/*
 * opening-hours.test.ts — the opening-hours rules with a made-up week:
 * reading times, opening and closing a day, changing times, how a day
 * shows, and what a trusted saved week looks like.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { minutesOf, setDayOpen, setDayTimes, hoursText, isFullWeek, dayFor, WEEKDAYS } from '../hours/opening-hours.ts'
import type { DayHours, Weekday, HoursTextWords } from '../hours/opening-hours.ts'

const WORDS: HoursTextWords = { dayNames: { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }, to: 'to', closed: 'Closed' }

function week(): DayHours[] {
  return WEEKDAYS.map(makeDay)

  function makeDay(day: Weekday): DayHours {
    return { day, open: day !== 'sun', opens: '08:00', closes: '16:00' }
  }
}

test('24-hour times read as minutes, anything else as null', function readsTimes() {
  assert.equal(minutesOf('07:30'), 450)
  assert.equal(minutesOf('23:59'), 1439)
  assert.equal(minutesOf('24:00'), null)
  assert.equal(minutesOf('7:30'), null)
  assert.equal(minutesOf(''), null)
})

test('closing a day keeps its times, so reopening brings them back', function closesAndReopens() {
  const closed = setDayOpen(week(), 'mon', false)
  assert.equal(dayFor(closed, 'mon')?.open, false)
  assert.equal(dayFor(setDayOpen(closed, 'mon', true), 'mon')?.opens, '08:00')
})

test('new times change only that day', function setsTimes() {
  const changed = setDayTimes(week(), 'sat', '09:00', '12:30')
  assert.ok(changed.ok)
  assert.equal(dayFor(changed.value, 'sat')?.closes, '12:30')
  assert.equal(dayFor(changed.value, 'fri')?.closes, '16:00')
})

test('closing before or at opening time is refused', function refusesBackwards() {
  assert.equal(setDayTimes(week(), 'mon', '17:00', '08:00').ok, false)
  assert.equal(setDayTimes(week(), 'mon', '08:00', '08:00').ok, false)
  assert.equal(setDayTimes(week(), 'mon', '', '08:00').ok, false)
})

test('a day shows its times, or Closed', function showsDay() {
  assert.equal(hoursText({ day: 'mon', open: true, opens: '08:00', closes: '16:00' }, WORDS), '08:00 to 16:00')
  assert.equal(hoursText({ day: 'sun', open: false, opens: '08:00', closes: '16:00' }, WORDS), 'Closed')
})

test('a saved week must have every day once, in order, with sound times', function trustsFullWeek() {
  assert.equal(isFullWeek(week()), true)
  assert.equal(isFullWeek(week().slice(1)), false)
  assert.equal(isFullWeek([...week()].reverse()), false)
  const broken = week().map(swapFirst)
  assert.equal(isFullWeek(broken), false)

  function swapFirst(row: DayHours, index: number): DayHours {
    return index === 0 ? { ...row, opens: '18:00' } : row
  }
})
