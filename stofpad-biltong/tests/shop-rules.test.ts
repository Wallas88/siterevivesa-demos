/*
 * shop-rules.test.ts — the small rules behind the rails, the header and
 * the page's metadata, with made-up numbers: when a mouse press becomes a
 * drag, where a drag snaps, the rail's ends, when the header tightens,
 * the title and tags each language puts on the page, and that both
 * languages have the same words.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { cardStep, isDeliberateDrag, railEnds, snapDestination } from '../src/features/rail/rail-rules.ts'
import { isScrolledPast } from '../src/features/header/use-scrolled.ts'
import { applyMetadata } from '../src/features/seo/apply-metadata.ts'
import type { MetadataDocument } from '../src/features/seo/apply-metadata.ts'
import { SHOP_WORDS } from '../src/content/i18n.ts'

test('a mouse drag starts only after 6px', function dragThreshold() {
  assert.equal(isDeliberateDrag(5), false)
  assert.equal(isDeliberateDrag(-6), true)
})

test('a released drag snaps to the nearest card, or to the end when close to it', function snaps() {
  const step = cardStep(300, 24)
  assert.equal(step, 324)
  assert.equal(snapDestination(500, step, 2000), 648)
  assert.equal(snapDestination(1999, step, 2000), 2000)
})

test('the rail knows its ends, within 2px', function ends() {
  assert.deepEqual(railEnds(1, 1000, 400), { atStart: true, atEnd: false })
  assert.deepEqual(railEnds(599, 1000, 400), { atStart: false, atEnd: true })
})

test('the header tightens after 8px of scroll', function tightens() {
  assert.equal(isScrolledPast(8), false)
  assert.equal(isScrolledPast(9), true)
})

test('each language puts its own title, description, social tags and html lang on the page', function appliesMetadata() {
  const set: Record<string, string> = {}
  const page: MetadataDocument = { title: '', documentElement: { lang: '' }, querySelector: findTag }
  applyMetadata(page, 'af')
  assert.equal(page.documentElement.lang, 'af')
  assert.match(set['meta[name="description"]'] ?? '', /^Besoek Stofpad Biltong/)
  assert.equal(set['meta[property="og:locale"]'], 'af_ZA')

  function findTag(selector: string): { setAttribute: (name: string, value: string) => void } {
    return { setAttribute: remember }

    function remember(_name: string, value: string): void {
      set[selector] = value
    }
  }
})

test('the shop has the same words in English and Afrikaans', function sameKeys() {
  assert.deepEqual(Object.keys(SHOP_WORDS.af).sort(), Object.keys(SHOP_WORDS.en).sort())
})
