/*
 * ast.ts — parses one TypeScript/TSX file with Rolldown's parser (TypeScript
 * 7 has no parser API; Rolldown ships with Vite) and walks the result as
 * plain nodes. Positions are character offsets; lines.ts turns them into
 * line numbers.
 */
import { parseAst } from 'rolldown/parseAst'

export interface AstNode {
  type: string
  start: number
  end: number
  [key: string]: unknown
}

export type Visit = (node: AstNode, ancestors: AstNode[]) => void

export function isAstNode(value: unknown): value is AstNode {
  if (value == null || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.type === 'string' && typeof candidate.start === 'number'
}

export function parseSource(fileName: string, code: string): AstNode {
  const lang = fileName.endsWith('.tsx') ? 'tsx' : 'ts'
  return parseAst(code, { lang }) as unknown as AstNode
}

export function childrenOf(node: AstNode): AstNode[] {
  const children: AstNode[] = []
  for (const value of Object.values(node)) {
    if (isAstNode(value)) children.push(value)
    else if (Array.isArray(value)) children.push(...value.filter(isAstNode))
  }
  return children
}

// Depth-first; each node is visited with the chain of nodes above it.
export function walk(root: AstNode, visit: Visit, ancestors: AstNode[] = []): void {
  visit(root, ancestors)
  const below = [...ancestors, root]
  for (const child of childrenOf(root)) walk(child, visit, below)
}
