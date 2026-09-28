/*
 * ui-data-access.ts — architectural law, separation of concerns: a component
 * file never calls fetch or touches browser storage itself; it calls a named
 * function or hook from the feature that owns the data.
 */
import { walk } from '../ast.ts'
import type { AstNode } from '../ast.ts'
import { lineOf } from '../lines.ts'
import type { SourceFile, Finding } from '../source-file.ts'
import { UI_FILE_PATTERN, DATA_ACCESS_GLOBALS } from '../limits.ts'

const ACCESS_PARENTS = new Set(['CallExpression', 'MemberExpression'])

export function checkUiDataAccess(file: SourceFile): Finding[] {
  if (!UI_FILE_PATTERN.test(file.path)) return []
  const findings: Finding[] = []

  function inspect(node: AstNode, ancestors: AstNode[]): void {
    const name = typeof node.name === 'string' ? node.name : ''
    const parent = ancestors[ancestors.length - 1]
    if (node.type !== 'Identifier' || !DATA_ACCESS_GLOBALS.includes(name) || parent == null) return
    if (!ACCESS_PARENTS.has(parent.type)) return
    findings.push({ rule: 'ui-data-access', path: file.path, line: lineOf(file.starts, node.start), detail: `${name} used directly in a component file` })
  }

  walk(file.ast, inspect)
  return findings
}
