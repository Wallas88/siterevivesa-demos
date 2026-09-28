/*
 * lines.ts — turns character offsets into line numbers and counts the lines
 * of a range that hold code: blank lines, comment-only lines and lines
 * covered by JSX markup are not logic.
 */

export interface Range {
  start: number
  end: number
}

export function lineStarts(code: string): number[] {
  const starts = [0]
  for (let index = 0; index < code.length; index += 1) {
    if (code[index] === '\n') starts.push(index + 1)
  }
  return starts
}

// 1-based line of an offset, by binary search over the line starts.
export function lineOf(starts: number[], offset: number): number {
  let low = 0
  let high = starts.length - 1
  while (low < high) {
    const middle = Math.ceil((low + high) / 2)
    if ((starts[middle] ?? 0) <= offset) low = middle
    else high = middle - 1
  }
  return low + 1
}

function isCodeLine(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed === '') return false
  return !(trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*'))
}

// Code lines inside `body`, minus every line that sits wholly inside markup.
export function countLogicLines(code: string, body: Range, markup: Range[]): number {
  const starts = lineStarts(code)
  const excluded = new Set<number>()
  for (const range of markup) {
    for (let line = lineOf(starts, range.start); line <= lineOf(starts, range.end); line += 1) excluded.add(line)
  }
  const allLines = code.split('\n')
  let count = 0
  for (let line = lineOf(starts, body.start) + 1; line < lineOf(starts, body.end); line += 1) {
    if (!excluded.has(line) && isCodeLine(allLines[line - 1] ?? '')) count += 1
  }
  return count
}
