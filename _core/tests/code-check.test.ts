/*
 * code-check.test.ts — each architectural-law rule against small made-up
 * snippets: what it must report and what it must leave alone.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { parseSource } from '../checks/code/ast.ts'
import { lineStarts, countLogicLines } from '../checks/code/lines.ts'
import type { SourceFile } from '../checks/code/source-file.ts'
import { checkFunctionLength } from '../checks/code/rules/function-length.ts'
import { checkNestingDepth } from '../checks/code/rules/nesting-depth.ts'
import { checkEmptyCatch } from '../checks/code/rules/empty-catch.ts'
import { checkArrowFunctions } from '../checks/code/rules/arrow-functions.ts'
import { checkUiDataAccess } from '../checks/code/rules/ui-data-access.ts'

function sourceFile(path: string, code: string): SourceFile {
  return { path, code, ast: parseSource(path, code), starts: lineStarts(code) }
}

function repeatedStatements(count: number): string {
  return Array.from({ length: count }, statementFor).join('\n')

  function statementFor(_: unknown, index: number): string {
    return `  const value${index} = ${index}`
  }
}

test('a function with 26 lines of logic is reported, one with 25 is not', function lengthLimit() {
  const long = sourceFile('src/long.ts', `function tooLong() {\n${repeatedStatements(26)}\n}`)
  const fine = sourceFile('src/fine.ts', `function justRight() {\n${repeatedStatements(25)}\n}`)
  assert.equal(checkFunctionLength(long).length, 1)
  assert.match(checkFunctionLength(long)[0]?.detail ?? '', /tooLong: 26 lines/)
  assert.equal(checkFunctionLength(fine).length, 0)
})

test('JSX markup, blank lines and comments are not counted as logic', function markupIsFree() {
  const markup = Array.from({ length: 40 }, markupLine).join('\n')
  const code = `function Page() {\n  // a comment\n\n  const title = 'x'\n  return (\n    <main>\n${markup}\n    </main>\n  )\n}`
  assert.equal(checkFunctionLength(sourceFile('src/pages/Page.tsx', code)).length, 0)

  function markupLine(_: unknown, index: number): string {
    return `      <p>line ${index}</p>`
  }
})

test('countLogicLines excludes the lines a markup range covers', function excludesRanges() {
  const code = 'function f() {\n  const a = 1\n  const b = 2\n}'
  assert.equal(countLogicLines(code, { start: 13, end: code.length }, []), 2)
})

test('four nested levels are reported; an else-if chain is not nesting', function nesting() {
  const deep = 'function deep(a: number) { if (a) { for (;;) { while (a) { if (a) { a-- } } } } }'
  const chain = 'function chain(a: number) { if (a === 1) {} else if (a === 2) {} else if (a === 3) {} else if (a === 4) { if (a) {} } }'
  assert.equal(checkNestingDepth(sourceFile('src/deep.ts', deep)).length, 1)
  assert.equal(checkNestingDepth(sourceFile('src/chain.ts', chain)).length, 0)
})

test('a catch with only a comment is empty; one with a statement is not', function emptyCatch() {
  const empty = 'function f() { try { g() } catch { /* ignored */ } }'
  const handled = 'function f() { try { g() } catch { return null } }'
  assert.equal(checkEmptyCatch(sourceFile('src/a.ts', empty)).length, 1)
  assert.equal(checkEmptyCatch(sourceFile('src/b.ts', handled)).length, 0)
})

test('arrow functions are reported but arrow types are not', function arrows() {
  const code = 'type Handler = () => void\nconst run: Handler = () => {}\nfunction named() {}'
  assert.equal(checkArrowFunctions(sourceFile('src/a.ts', code)).length, 1)
})

test('fetch and storage in a component file are reported, but not in a hook file', function dataAccess() {
  const code = 'export function Panel() { fetch("/x"); return localStorage.getItem("k") }'
  assert.equal(checkUiDataAccess(sourceFile('src/features/theme/Panel.tsx', code)).length, 2)
  assert.equal(checkUiDataAccess(sourceFile('sign-in/SignInPanel.tsx', code)).length, 2)
  assert.equal(checkUiDataAccess(sourceFile('src/features/theme/use-saved-theme.ts', code)).length, 0)
})
