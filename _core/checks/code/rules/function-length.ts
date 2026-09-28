/*
 * function-length.ts — architectural law: a function's logic is at most 25
 * lines. JSX markup is not logic and is not counted; logic in nested
 * functions counts for them and for the function around them.
 */
import { walk, isAstNode } from '../ast.ts'
import type { AstNode } from '../ast.ts'
import { countLogicLines, lineOf } from '../lines.ts'
import type { Range } from '../lines.ts'
import { isFunctionNode, functionName } from '../source-file.ts'
import type { SourceFile, Finding } from '../source-file.ts'
import { MAX_LOGIC_LINES } from '../limits.ts'

const MARKUP_TYPES = new Set(['JSXElement', 'JSXFragment'])

function markupRanges(body: AstNode): Range[] {
  const ranges: Range[] = []

  function collect(node: AstNode): void {
    if (MARKUP_TYPES.has(node.type)) ranges.push({ start: node.start, end: node.end })
  }

  walk(body, collect)
  return ranges
}

export function checkFunctionLength(file: SourceFile): Finding[] {
  const findings: Finding[] = []

  function measure(node: AstNode, ancestors: AstNode[]): void {
    if (!isFunctionNode(node) || !isAstNode(node.body) || node.body.type !== 'BlockStatement') return
    const lines = countLogicLines(file.code, node.body, markupRanges(node.body))
    if (lines <= MAX_LOGIC_LINES) return
    const name = functionName(node, ancestors)
    findings.push({ rule: 'function-length', path: file.path, line: lineOf(file.starts, node.start), detail: `${name}: ${lines} lines of logic (max ${MAX_LOGIC_LINES})` })
  }

  walk(file.ast, measure)
  return findings
}
