/*
 * empty-catch.ts — architectural law: no empty catch. A catch holding only a
 * comment is empty too; it must log a code and return a Result, or return a
 * named fallback.
 */
import { walk, isAstNode } from '../ast.ts'
import type { AstNode } from '../ast.ts'
import { lineOf } from '../lines.ts'
import type { SourceFile, Finding } from '../source-file.ts'

function isEmptyBlock(block: unknown): boolean {
  if (!isAstNode(block)) return false
  const statements = block.body
  return Array.isArray(statements) && statements.length === 0
}

export function checkEmptyCatch(file: SourceFile): Finding[] {
  const findings: Finding[] = []

  function inspect(node: AstNode): void {
    if (node.type !== 'CatchClause' || !isEmptyBlock(node.body)) return
    findings.push({ rule: 'empty-catch', path: file.path, line: lineOf(file.starts, node.start), detail: 'catch has no statements (a comment alone does not count)' })
  }

  walk(file.ast, inspect)
  return findings
}
