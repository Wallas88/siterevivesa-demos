/*
 * arrow-functions.ts — coding standard: no arrow functions; handlers,
 * callbacks and components are named functions. Arrow *types*
 * (`() => void`) are type annotations, not ArrowFunctionExpression, so they
 * are not reported.
 */
import { walk } from '../ast.ts'
import type { AstNode } from '../ast.ts'
import { lineOf } from '../lines.ts'
import type { SourceFile, Finding } from '../source-file.ts'

export function checkArrowFunctions(file: SourceFile): Finding[] {
  const findings: Finding[] = []

  function inspect(node: AstNode): void {
    if (node.type !== 'ArrowFunctionExpression') return
    findings.push({ rule: 'arrow-function', path: file.path, line: lineOf(file.starts, node.start), detail: 'arrow function; use a named function' })
  }

  walk(file.ast, inspect)
  return findings
}
