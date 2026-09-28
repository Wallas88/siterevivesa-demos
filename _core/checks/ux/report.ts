/*
 * report.ts — the scorecard printed at the end of a ux-check run. Pure text:
 * one line per principle, then each problem, capped so a long list stays
 * readable.
 */
import type { Finding } from './verdicts.ts'

const MAX_PROBLEMS_SHOWN = 12

export function formatScorecard(findings: Finding[]): string {
  const lines: string[] = ['UX check — enforced principles (the UX principles)', '']
  for (const finding of findings) {
    const mark = finding.passed ? 'PASS' : 'FAIL'
    const count = finding.passed ? '' : ` — ${finding.problems.length} problem${finding.problems.length === 1 ? '' : 's'}`
    lines.push(`${mark}  ${finding.principle}. ${finding.title}${count}`)
    for (const problem of finding.problems.slice(0, MAX_PROBLEMS_SHOWN)) lines.push(`        ${problem}`)
    const hidden = finding.problems.length - MAX_PROBLEMS_SHOWN
    if (hidden > 0) lines.push(`        …and ${hidden} more`)
  }
  const passed = findings.filter(isPassed).length
  lines.push('', `${passed} of ${findings.length} principles pass.`)
  return lines.join('\n')
}

function isPassed(finding: Finding): boolean {
  return finding.passed
}
