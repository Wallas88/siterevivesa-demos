/*
 * view-choice.test.ts — the first view from the link, the link for a view,
 * list slot changes, and which picture an item shows, with made-up links,
 * counts and photos.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { viewFromSearch, searchForView } from '../view/view-choice.ts'
import { slotChange, NO_SLOT_CHANGE } from '../lists/slot-change.ts'
import { photoSrc, storedPhotoId } from '../photos/photo-urls.ts'

const MISSING = '/images/missing.svg'

test('a plain link opens the website', function plainIsSite() {
  assert.equal(viewFromSearch(''), 'site')
  assert.equal(viewFromSearch('?view=other'), 'site')
})

test('?view=admin opens the admin', function adminLink() {
  assert.equal(viewFromSearch('?view=admin&x=1'), 'admin')
})

test('choosing a view keeps other parameters and drops view for the website', function linksForViews() {
  assert.equal(searchForView('?x=1', 'admin'), '?x=1&view=admin')
  assert.equal(searchForView('?view=admin&x=1', 'site'), '?x=1')
  assert.equal(searchForView('?view=admin', 'site'), '')
})

test('a longer list opens new slots at the end', function listGrows() {
  assert.deepEqual(slotChange(3, 5, false), { openingFrom: 3, closing: 0 })
})

test('a shorter list closes the spare slots at the end', function listShrinks() {
  assert.equal(slotChange(4, 3, false).closing, 1)
})

test('with reduced motion no slot opens or closes', function reducedIsInstant() {
  assert.deepEqual(slotChange(3, 5, true), NO_SLOT_CHANGE)
  assert.deepEqual(slotChange(5, 3, true), NO_SLOT_CHANGE)
})

test('the same length changes no slots', function listSame() {
  assert.deepEqual(slotChange(2, 2, false), NO_SLOT_CHANGE)
})

test('an item shows its seed picture, its own photo, or the placeholder', function picksPhoto() {
  assert.equal(photoSrc({ kind: 'seed', src: '/a.svg' }, {}, MISSING), '/a.svg')
  assert.equal(photoSrc({ kind: 'stored', photoId: 'p' }, { p: 'blob:x' }, MISSING), 'blob:x')
  assert.equal(photoSrc({ kind: 'stored', photoId: 'gone' }, {}, MISSING), MISSING)
})

test('only a stored photo has an id to keep in the browser', function storedIds() {
  assert.equal(storedPhotoId({ kind: 'stored', photoId: 'p1' }), 'p1')
  assert.equal(storedPhotoId({ kind: 'seed', src: '/a.svg' }), null)
})
