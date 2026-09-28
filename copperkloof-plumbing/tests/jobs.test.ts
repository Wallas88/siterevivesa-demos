/*
 * jobs.test.ts — the "Recent jobs" rules with made-up jobs: checking a new
 * job, adding within the limit, removing, moving, featuring, and the order
 * the website shows.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { checkDraft, siteBadge, addJob, removeJob, moveJob, toggleFeatured, jobsForSite, storedPhotoIds, MAX_JOBS, MAX_TITLE_LENGTH } from '../src/features/jobs/jobs.ts'
import type { Job } from '../src/features/jobs/jobs.ts'
import { ERROR_MESSAGES } from '../shared/error-codes.ts'

const AREAS = ['Testvale', 'Mockridge']

function job(id: string, featured = false): Job {
  return { id, title: `Job ${id}`, caption: '', suburb: 'Testvale', photo: { kind: 'seed', src: `/images/${id}.svg` }, featured }
}

function idOf(item: Job): string {
  return item.id
}

test('a draft with a title and a known suburb is accepted, trimmed', function acceptsDraft() {
  const checked = checkDraft({ title: '  New geyser  ', caption: ' Done by noon ', suburb: 'Mockridge' }, AREAS)
  assert.deepEqual(checked, { ok: true, value: { title: 'New geyser', caption: 'Done by noon', suburb: 'Mockridge' } })
})

test('a draft with only spaces for a title is refused', function refusesBlankTitle() {
  const checked = checkDraft({ title: '   ', caption: '', suburb: 'Testvale' }, AREAS)
  assert.equal(checked.ok, false)
})

test('a draft with a suburb outside the list is refused', function refusesUnknownSuburb() {
  assert.equal(checkDraft({ title: 'Tap', caption: '', suburb: 'Elsewhere' }, AREAS).ok, false)
})

test('a title one character over the limit is refused', function refusesLongTitle() {
  assert.equal(checkDraft({ title: 'x'.repeat(MAX_TITLE_LENGTH + 1), caption: '', suburb: 'Testvale' }, AREAS).ok, false)
})

test('a new job goes to the top of the list', function addsOnTop() {
  const added = addJob([job('a'), job('b')], job('new'))
  assert.ok(added.ok)
  assert.deepEqual(added.value.map(idOf), ['new', 'a', 'b'])
})

test('a full list refuses another job, and the message names the same limit', function refusesWhenFull() {
  const full = Array.from({ length: MAX_JOBS }, makeJob)
  const added = addJob(full, job('extra'))
  assert.equal(added.ok, false)
  assert.match(ERROR_MESSAGES.JOBS_FULL, new RegExp(`\\b${MAX_JOBS}\\b`))

  function makeJob(_value: unknown, index: number): Job {
    return job(String(index))
  }
})

test('removing a job leaves the others in order', function removes() {
  assert.deepEqual(removeJob([job('a'), job('b'), job('c')], 'b').map(idOf), ['a', 'c'])
})

test('moving a job up swaps it with the one above', function movesUp() {
  assert.deepEqual(moveJob([job('a'), job('b'), job('c')], 'c', 'up').map(idOf), ['a', 'c', 'b'])
})

test('moving the first job up, or the last down, changes nothing', function movesAtEnds() {
  const jobs = [job('a'), job('b')]
  assert.equal(moveJob(jobs, 'a', 'up'), jobs)
  assert.equal(moveJob(jobs, 'b', 'down'), jobs)
})

test('moving an unknown job changes nothing', function movesUnknown() {
  const jobs = [job('a')]
  assert.equal(moveJob(jobs, 'missing', 'down'), jobs)
})

test('featuring a job clears the job featured before it', function featuresOne() {
  const jobs = toggleFeatured([job('a', true), job('b')], 'b')
  assert.deepEqual(jobs.map(isFeatured), [false, true])

  function isFeatured(item: Job): boolean {
    return item.featured
  }
})

test('featuring the featured job again clears it', function unfeatures() {
  assert.equal(toggleFeatured([job('a', true)], 'a')[0]?.featured, false)
})

test('the website shows the featured job first, then the owner order', function siteOrder() {
  assert.deepEqual(jobsForSite([job('a'), job('b'), job('c', true)]).map(idOf), ['c', 'a', 'b'])
})

test('only photos kept in the browser are listed as stored', function listsStored() {
  const stored: Job = { ...job('x'), photo: { kind: 'stored', photoId: 'photo-1' } }
  assert.deepEqual(storedPhotoIds([job('a'), stored]), ['photo-1'])
})

test('the job just added is marked on the site, even when another is featured', function badges() {
  assert.equal(siteBadge(job('new'), 'new'), 'Just added')
  assert.equal(siteBadge(job('old', true), 'new'), 'Featured')
  assert.equal(siteBadge(job('plain'), null), null)
})
