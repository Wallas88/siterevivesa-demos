/*
 * report.ts — the code-check summary: a count per rule, then every finding
 * as path:line so an editor can jump to it. Pure text.
 */
import type { Finding } from './source-file.ts'
import type { ParseFailure } from './source-files.ts'

const RULE_ORDER = ['function-length', 'nesting-depth', 'empty-catch', 'arrow-function', 'ui-data-access']

function findingLine(finding: Finding): string {
  return `  ${finding.path}:${finding.line}  ${finding.detail}`
}

function failureLine(failure: ParseFailure): string {
  return `  ${failure.path}  could not be read: ${failure.reason}`
}

export function formatReport(findings: Finding[], failures: ParseFailure[], fileCount: number): string {
  const lines = [`Code check — architectural laws (the coding standard), ${fileCount} files`, '']
  for (const rule of RULE_ORDER) {
    const forRule = findings.filter(isRule)
    lines.push(`${forRule.length === 0 ? 'PASS' : 'FAIL'}  ${rule}${forRule.length === 0 ? '' : ` — ${forRule.length}`}`)
    lines.push(...forRule.map(findingLine))

    function isRule(finding: Finding): boolean {
      return finding.rule === rule
    }
  }
  if (failures.length > 0) lines.push('', 'Unreadable files:', ...failures.map(failureLine))
  return lines.join('\n')
}
