/*
 * verdicts.ts — turns what the ux-check measured into a pass or fail per
 * enforced principle (the UX principles). Pure: measurements and
 * thresholds in, findings out, so it is tested with made-up data.
 */
import type { PageJavascript } from './bundle.ts'
import type { SmallTarget, SectionStyles, ContrastReport, SlowMotion, ImageIssues, FocusStop } from '../browser/page-measurements.ts'
import type { OffScaleValue } from './css-scan.ts'

export interface PageMeasurements {
  page: string
  primaryPerScreen: number
  sections: SectionStyles[]
  contrastByPalette: Record<string, ContrastReport>
  smallTargets: SmallTarget[]
  slowMotion: SlowMotion[]
  overflowPx: number
  layoutShift: number
  images: ImageIssues
}

// An image counts as below the fold only when it is below it at every width measured.
export function belowFoldEverywhere(phone: string[], desktop: string[]): string[] {
  const desktopSet = new Set(desktop)
  return phone.filter(isAlsoOnDesktop)

  function isAlsoOnDesktop(name: string): boolean {
    return desktopSet.has(name)
  }
}

export interface SiteMeasurements {
  pages: PageMeasurements[]
  focusStops: FocusStop[]
  offScaleSpacing: OffScaleValue[]
  // Each page's JavaScript as a visitor downloads it: the shared core plus that page.
  javascriptByPage: PageJavascript[]
}

export interface Limits {
  maxPrimaryPerScreen: number
  maxSizes: number
  maxWeights: number
  maxColours: number
  minHitPx: number
  maxRepeatedMotionMs: number
  maxJavascriptGzipKb: number
  maxLayoutShift: number
}

export interface Finding {
  principle: number
  title: string
  passed: boolean
  problems: string[]
}

function judgeOneJob(site: SiteMeasurements, limits: Limits): Finding {
  const problems: string[] = []
  for (const page of site.pages) {
    if (page.primaryPerScreen > limits.maxPrimaryPerScreen) problems.push(`${page.page}: ${page.primaryPerScreen} primary buttons within one phone screen`)
  }
  return { principle: 1, title: 'One page, one job', passed: problems.length === 0, problems }
}

export function judgeHierarchy(site: SiteMeasurements, limits: Limits): Finding {
  const problems: string[] = []
  for (const page of site.pages) {
    for (const section of page.sections) {
      const over: string[] = []
      if (section.sizes.length > limits.maxSizes) over.push(`${section.sizes.length} sizes`)
      if (section.weights.length > limits.maxWeights) over.push(`${section.weights.length} weights`)
      if (section.colours.length > limits.maxColours) over.push(`${section.colours.length} text colours`)
      if (over.length > 0) problems.push(`${page.page} ${section.section}: ${over.join(', ')}`)
    }
  }
  return { principle: 2, title: 'Hierarchy by stepping back', passed: problems.length === 0, problems }
}

function judgeSpacing(site: SiteMeasurements): Finding {
  const problems = site.offScaleSpacing.map(describeOffScale)
  return { principle: 3, title: 'Space from a scale', passed: problems.length === 0, problems }

  function describeOffScale(entry: OffScaleValue): string {
    return `${entry.selector} { ${entry.property}: ${entry.value} }`
  }
}

function judgeContrast(site: SiteMeasurements): Finding {
  const problems: string[] = []
  for (const page of site.pages) {
    for (const [palette, report] of Object.entries(page.contrastByPalette)) {
      for (const miss of report.misses) problems.push(`${page.page} [${palette}] "${miss.text}" ${miss.ratio}:1 (needs ${miss.required}:1)`)
    }
  }
  return { principle: 4, title: 'Contrast in every palette', passed: problems.length === 0, problems }
}

export function judgeTargets(site: SiteMeasurements, limits: Limits): Finding {
  const problems: string[] = []
  for (const page of site.pages) {
    for (const target of page.smallTargets) {
      problems.push(`${page.page} ${target.control}: hit area ${target.hit.width}×${target.hit.height} (needs ${limits.minHitPx}×${limits.minHitPx})`)
    }
  }
  for (const stop of site.focusStops) {
    if (!stop.hasRing) problems.push(`no visible focus ring: ${stop.control}`)
  }
  return { principle: 5, title: 'Easy to hit, easy to see', passed: problems.length === 0, problems }
}

function judgeMotion(site: SiteMeasurements, limits: Limits): Finding {
  const problems: string[] = []
  for (const page of site.pages) {
    for (const motion of page.slowMotion) problems.push(`${page.page} ${motion.control}: ${motion.durationMs}ms (limit ${limits.maxRepeatedMotionMs}ms)`)
  }
  return { principle: 6, title: 'Motion explains; repetition is noise', passed: problems.length === 0, problems }
}

export function judgePhoneBudget(site: SiteMeasurements, limits: Limits): Finding {
  const problems: string[] = []
  for (const page of site.javascriptByPage) {
    if (page.gzipKb > limits.maxJavascriptGzipKb) problems.push(`${page.page}: JavaScript ${page.gzipKb} KB gzipped (budget ${limits.maxJavascriptGzipKb} KB per page)`)
  }
  for (const page of site.pages) {
    if (page.overflowPx > 0) problems.push(`${page.page}: ${page.overflowPx}px horizontal overflow at 360`)
    if (page.layoutShift > limits.maxLayoutShift) problems.push(`${page.page}: layout shift ${page.layoutShift.toFixed(3)} (limit ${limits.maxLayoutShift})`)
    for (const image of page.images.unsized) problems.push(`${page.page}: image without width/height: ${image}`)
    for (const image of page.images.eagerBelowFold) problems.push(`${page.page}: below-the-fold image not lazy: ${image}`)
  }
  return { principle: 7, title: 'Mid-range phone, prepaid data', passed: problems.length === 0, problems }
}

export function judgeSite(site: SiteMeasurements, limits: Limits): Finding[] {
  return [judgeOneJob(site, limits), judgeHierarchy(site, limits), judgeSpacing(site), judgeContrast(site), judgeTargets(site, limits), judgeMotion(site, limits), judgePhoneBudget(site, limits)]
}
