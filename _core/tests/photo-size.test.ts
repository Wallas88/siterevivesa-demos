/*
 * photo-size.test.ts — which picked files are accepted, and the size a
 * photo is drawn at, with made-up sizes.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { checkPickedFile, fitWithin, MAX_PICKED_BYTES, MAX_PICKED_MB } from '../photos/photo-size.ts'
import { CORE_MESSAGES_EN } from '../result/core-errors.ts'

function codeOf(type: string, size: number): string {
  const checked = checkPickedFile({ type, size })
  return checked.ok ? 'OK' : checked.code
}

test('a photo from the camera is accepted', function acceptsPhoto() {
  assert.equal(codeOf('image/jpeg', 3_000_000), 'OK')
})

test('a file that is not an image is refused', function refusesPdf() {
  assert.equal(codeOf('application/pdf', 1000), 'PHOTO_NOT_IMAGE')
})

test('a file with no type is refused as not an image', function refusesUnknown() {
  assert.equal(codeOf('', 1000), 'PHOTO_NOT_IMAGE')
})

test('a photo one byte over the limit is refused, and the message names the limit', function refusesHuge() {
  assert.equal(codeOf('image/png', MAX_PICKED_BYTES + 1), 'PHOTO_TOO_LARGE')
  assert.equal(codeOf('image/png', MAX_PICKED_BYTES), 'OK')
  assert.match(CORE_MESSAGES_EN.PHOTO_TOO_LARGE, new RegExp(`\\b${MAX_PICKED_MB} MB`))
})

test('a landscape phone photo shrinks to 1200 wide, keeping its shape', function shrinksLandscape() {
  assert.deepEqual(fitWithin({ width: 4000, height: 3000 }, 1200), { width: 1200, height: 900 })
})

test('a portrait photo shrinks by its height', function shrinksPortrait() {
  assert.deepEqual(fitWithin({ width: 3024, height: 4032 }, 1200), { width: 900, height: 1200 })
})

test('a small photo is never scaled up', function keepsSmall() {
  assert.deepEqual(fitWithin({ width: 640, height: 480 }, 1200), { width: 640, height: 480 })
})

test('a very thin panorama keeps at least one pixel on its short side', function keepsOnePixel() {
  assert.deepEqual(fitWithin({ width: 100_000, height: 20 }, 1200), { width: 1200, height: 1 })
})
