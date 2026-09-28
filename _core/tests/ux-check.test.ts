/*
 * ux-check.test.ts — the ux-check's decision logic with made-up data: which
 * measurements fail which principle, and which CSS spacing values are off
 * the scale. The browser side is checked by running the script itself.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { judgeSite, judgeHierarchy, judgeTargets, judgePhoneBudget, belowFoldEverywhere } from '../checks/ux/verdicts.ts'
import type { SiteMeasurements, PageMeasurements, Limits } from '../checks/ux/verdicts.ts'
import { findOffScaleSpacing, lengthInPx } from '../checks/ux/css-scan.ts'
import { readFileSync } from 'node:fs'
import { parseSource, isAstNode } from '../checks/code/ast.ts'

const LIMITS: Limits = { maxPrimaryPerScreen: 1, maxSizes: 3, maxWeights: 3, maxColours: 2, minHitPx: 44, maxRepeatedMotionMs: 250, maxJavascriptGzipKb: 110, maxLayoutShift: 0.1 }
const SCALE = [0, 4, 8, 12, 16, 24, 32, 48, 64, 96]

function cleanPage(): PageMeasurements {
  return {
    page: '/',
    primaryPerScreen: 1,
    sections: [{ section: '#intro', sizes: ['16px', '32px'], weights: ['400', '700'], colours: ['rgb(0, 0, 0)'] }],
    contrastByPalette: { ember: { checked: 10, unverifiable: 0, misses: [] } },
    smallTargets: [],
    slowMotion: [],
    overflowPx: 0,
    layoutShift: 0,
    images: { unsized: [], eagerBelowFold: [] },
  }
}

function cleanSite(): SiteMeasurements {
  return {
    pages: [cleanPage()],
    focusStops: [{ control: 'a "Home"', hasRing: true }],
    offScaleSpacing: [],
    javascriptByPage: [
      { page: '/', gzipKb: 90 },
      { page: '/about/', gzipKb: 95 },
    ],
  }
}

test('a site that meets every limit passes all seven principles', function passesAll() {
  const findings = judgeSite(cleanSite(), LIMITS)
  assert.equal(findings.length, 7)
  assert.ok(findings.every(isPassed))

  function isPassed(finding: { passed: boolean }): boolean {
    return finding.passed
  }
})

test('a section with four text sizes fails hierarchy and names the section', function tooManySizes() {
  const site = cleanSite()
  const page = cleanPage()
  page.sections = [{ section: '#busy', sizes: ['12px', '14px', '16px', '20px'], weights: ['400'], colours: ['rgb(0, 0, 0)'] }]
  site.pages = [page]
  const finding = judgeHierarchy(site, LIMITS)
  assert.equal(finding.passed, false)
  assert.match(finding.problems[0] ?? '', /#busy: 4 sizes/)
})

test('a small target and a focus stop without a ring both fail principle 5', function smallAndRingless() {
  const site = cleanSite()
  const page = cleanPage()
  page.smallTargets = [{ control: 'button.dot "Next"', visible: { width: 18, height: 27 }, hit: { width: 18, height: 27 } }]
  site.pages = [page]
  site.focusStops = [{ control: 'a.bare "Terms"', hasRing: false }]
  const finding = judgeTargets(site, LIMITS)
  assert.equal(finding.problems.length, 2)
})

test('JavaScript over budget and horizontal overflow fail the phone budget', function overBudget() {
  const site = cleanSite()
  const page = cleanPage()
  page.overflowPx = 12
  site.pages = [page]
  site.javascriptByPage = [
    { page: '/', gzipKb: 90 },
    { page: '/about/', gzipKb: 140 },
  ]
  const finding = judgePhoneBudget(site, LIMITS)
  assert.equal(finding.passed, false)
  assert.equal(finding.problems.length, 2)
})

test('rem values convert at the root font size and unknown units are skipped', function convertsLengths() {
  assert.equal(lengthInPx('1.5rem', 16), 24)
  assert.equal(lengthInPx('-8px', 16), -8)
  assert.equal(lengthInPx('2em', 16), null)
  assert.equal(lengthInPx('auto', 16), null)
})

test('spacing off the scale is reported, on-scale and dynamic values are not', function scansSpacing() {
  const css = '.a{padding:12px 16px}.b{margin-top:10px}.c{gap:clamp(8px,2vw,24px)}@media (max-width:700px){.d{padding-inline:1.1rem}}.e{margin:-24px auto}'
  const found = findOffScaleSpacing(css, SCALE, 16)
  assert.deepEqual(found.map(selectorOf), ['.b', '.d'])

  function selectorOf(entry: { selector: string }): string {
    return entry.selector
  }
})

test('an image counts as below the fold only when it is below at every width', function foldAtEveryWidth() {
  assert.deepEqual(belowFoldEverywhere(['hero.jpg', 'footer-logo.png'], ['footer-logo.png']), ['footer-logo.png'])
})

test('every page helper is exported, so inPage() sends it into the page', function helpersExported() {
  const code = readFileSync('checks/browser/page-helpers.ts', 'utf8')
  const program = parseSource('page-helpers.ts', code)
  const bodies = Array.isArray(program.body) ? program.body : []
  assert.deepEqual(bodies.filter(isBareFunction).map(nameOf), [])

  function isBareFunction(node: unknown): boolean {
    return isAstNode(node) && node.type === 'FunctionDeclaration'
  }

  function nameOf(node: unknown): string {
    return isAstNode(node) && isAstNode(node.id) && typeof node.id.name === 'string' ? node.id.name : '(anonymous)'
  }
})
