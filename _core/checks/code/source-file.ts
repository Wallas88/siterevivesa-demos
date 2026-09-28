/*
 * source-file.ts — what every rule receives: one parsed file, its path
 * relative to the repo root, and its line starts. Also the Finding shape
 * every rule returns.
 */
import type { AstNode } from './ast.ts'

export interface SourceFile {
  path: string
  code: string
  ast: AstNode
  starts: number[]
}

export interface Finding {
  rule: string
  path: string
  line: number
  detail: string
}

const FUNCTION_TYPES = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'])

export function isFunctionNode(node: AstNode): boolean {
  return FUNCTION_TYPES.has(node.type)
}

function identifierName(value: unknown): string | null {
  if (value == null || typeof value !== 'object') return null
  const name = (value as { name?: unknown }).name
  return typeof name === 'string' ? name : null
}

// A readable name for a function: its own id, or the variable, property or method it is assigned to.
export function functionName(node: AstNode, ancestors: AstNode[]): string {
  const own = identifierName(node.id)
  if (own != null) return own
  const parent = ancestors[ancestors.length - 1]
  if (parent == null) return '(anonymous)'
  return identifierName(parent.id) ?? identifierName(parent.key) ?? '(anonymous)'
}
