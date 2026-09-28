/*
 * nesting-depth.ts — architectural law: no nesting deeper than three levels
 * inside a function. Counts if/loops/switch/try; an `else if` continues its
 * chain instead of nesting, and a nested function starts again at zero.
 */
import { walk, childrenOf, isAstNode } from '../ast.ts'
import type { AstNode } from '../ast.ts'
import { lineOf } from '../lines.ts'
import { isFunctionNode, functionName } from '../source-file.ts'
import type { SourceFile, Finding } from '../source-file.ts'
import { MAX_NESTING_DEPTH } from '../limits.ts'

const NESTING_TYPES = new Set(['IfStatement', 'ForStatement', 'ForInStatement', 'ForOfStatement', 'WhileStatement', 'DoWhileStatement', 'SwitchStatement', 'TryStatement'])

function isElseIf(node: AstNode, parent: AstNode | undefined): boolean {
  return node.type === 'IfStatement' && parent?.type === 'IfStatement' && parent.alternate === node
}

// Deepest nesting below `node`, not looking inside nested functions.
function deepestNesting(node: AstNode): number {
  let deepest = 0
  for (const child of childrenOf(node)) {
    if (isFunctionNode(child)) continue
    const adds = NESTING_TYPES.has(child.type) && !isElseIf(child, node) ? 1 : 0
    deepest = Math.max(deepest, adds + deepestNesting(child))
  }
  return deepest
}

export function checkNestingDepth(file: SourceFile): Finding[] {
  const findings: Finding[] = []

  function measure(node: AstNode, ancestors: AstNode[]): void {
    if (!isFunctionNode(node) || !isAstNode(node.body)) return
    const depth = deepestNesting(node.body)
    if (depth <= MAX_NESTING_DEPTH) return
    const name = functionName(node, ancestors)
    findings.push({ rule: 'nesting-depth', path: file.path, line: lineOf(file.starts, node.start), detail: `${name}: nested ${depth} levels deep (max ${MAX_NESTING_DEPTH})` })
  }

  walk(file.ast, measure)
  return findings
}
