/*
 * specials.test.ts — the specials and events rules with made-up specials
 * and fixed dates: checking a new one, the limit, removing, which ones the
 * website shows on a given day, and how dates show.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { checkSpecialDraft, addSpecial, removeSpecial, specialsForSite, endText, localIsoDate, MAX_SPECIALS, MAX_SPECIAL_TITLE_LENGTH } from '../specials/specials.ts'
import { specialText } from '../specials/specials.ts'
import type { Special } from '../specials/specials.ts'
import { CORE_MESSAGES_EN } from '../result/core-errors.ts'

const TODAY = '2030-05-15'
const EN_DATES = { until: 'Until', months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] }
const AF_DATES = { until: 'Tot', months: ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'] }

function special(id: string, endsOn: string | null = null): Special {
  return { id, title: `Special ${id}`, line: '', endsOn }
}

function idOf(item: Special): string {
  return item.id
}

function codeOf(title: string, line: string, endsOn: string): string {
  const checked = checkSpecialDraft({ title, line, endsOn }, TODAY)
  return checked.ok ? 'OK' : checked.code
}

test('a special with a title and no end date is accepted, trimmed', function acceptsDraft() {
  assert.deepEqual(checkSpecialDraft({ title: ' Winter check ', line: ' Half-price ', endsOn: '' }, TODAY), { ok: true, value: { title: 'Winter check', line: 'Half-price', endsOn: null } })
})

test('a missing or too long title is refused', function refusesTitle() {
  assert.equal(codeOf('  ', '', ''), 'SPECIAL_INVALID')
  assert.equal(codeOf('x'.repeat(MAX_SPECIAL_TITLE_LENGTH + 1), '', ''), 'SPECIAL_INVALID')
  assert.match(CORE_MESSAGES_EN.SPECIAL_INVALID, new RegExp(`\\b${MAX_SPECIAL_TITLE_LENGTH}\\b`))
})

test('an end date today is fine, yesterday is refused as ended', function endDates() {
  assert.equal(codeOf('Sale', '', '2030-05-15'), 'OK')
  assert.equal(codeOf('Sale', '', '2030-05-14'), 'SPECIAL_ENDED')
  assert.equal(codeOf('Sale', '', '15/05/2030'), 'SPECIAL_INVALID')
})

test('a new special goes first, and a full list refuses another', function addsWithinLimit() {
  const added = addSpecial([special('a')], special('b'))
  assert.deepEqual(added.ok ? added.value.map(idOf) : [], ['b', 'a'])
  const full = Array.from({ length: MAX_SPECIALS }, makeSpecial)
  const refused = addSpecial(full, special('extra'))
  assert.equal(refused.ok ? 'OK' : refused.code, 'SPECIALS_FULL')
  assert.match(CORE_MESSAGES_EN.SPECIALS_FULL, new RegExp(`\\b${MAX_SPECIALS}\\b`))

  function makeSpecial(_value: unknown, index: number): Special {
    return special(String(index))
  }
})

test('removing a special leaves the others in order', function removes() {
  assert.deepEqual(removeSpecial([special('a'), special('b'), special('c')], 'b').map(idOf), ['a', 'c'])
})

test('the website hides a special after its end date, shows it on the day', function hidesEnded() {
  const specials = [special('open'), special('today', TODAY), special('past', '2030-05-14'), special('later', '2030-06-01')]
  assert.deepEqual(specialsForSite(specials, TODAY).map(idOf), ['open', 'today', 'later'])
})

test('an end date shows as a short date, and none shows nothing', function showsEnd() {
  assert.equal(endText('2030-10-01', EN_DATES), 'Until 1 Oct 2030')
  assert.equal(endText('2030-10-01', AF_DATES), 'Tot 1 Okt 2030')
  assert.equal(endText(null, EN_DATES), '')
})

test('a date is read in the local calendar, zero-padded', function readsLocalDate() {
  assert.equal(localIsoDate(new Date(2030, 0, 5)), '2030-01-05')
})

test('a special shows its translation when it has one, otherwise as typed', function translates() {
  const bilingual: Special = { ...special('b'), title: 'Weekend pack', translations: { af: { title: 'Naweekpak', line: '' } } }
  assert.equal(specialText(bilingual, 'af').title, 'Naweekpak')
  assert.equal(specialText(bilingual, 'en').title, 'Weekend pack')
  assert.equal(specialText(special('typed'), 'af').title, 'Special typed')
})
