/*
 * code-check.ts — checks the source against the architectural laws in
 * the coding standard: logic per function, nesting depth, empty catches,
 * arrow functions and data access in components. The folders to check are
 * the arguments, relative to where it runs. Exits 1 on any finding, 2 when
 * a file can't be read.
 *
 *   node ../_core/checks/code/code-check.ts src shared scripts tests
 */
import { loadSourceFiles, isParseFailure } from './source-files.ts'
import type { ParseFailure } from './source-files.ts'
import type { SourceFile, Finding } from './source-file.ts'
import { checkFunctionLength } from './rules/function-length.ts'
import { checkNestingDepth } from './rules/nesting-depth.ts'
import { checkEmptyCatch } from './rules/empty-catch.ts'
import { checkArrowFunctions } from './rules/arrow-functions.ts'
import { checkUiDataAccess } from './rules/ui-data-access.ts'
import { formatReport } from './report.ts'

const RULES = [checkFunctionLength, checkNestingDepth, checkEmptyCatch, checkArrowFunctions, checkUiDataAccess]
const EXIT_FINDINGS = 1
const EXIT_UNREADABLE = 2

function checkFile(file: SourceFile): Finding[] {
  return RULES.flatMap(runRule)

  function runRule(rule: (file: SourceFile) => Finding[]): Finding[] {
    return rule(file)
  }
}

function isSourceFile(file: SourceFile | ParseFailure): file is SourceFile {
  return !isParseFailure(file)
}

async function main(): Promise<void> {
  const loaded = await loadSourceFiles(process.argv.slice(2))
  const files = loaded.filter(isSourceFile)
  const failures = loaded.filter(isParseFailure)
  const findings = files.flatMap(checkFile)
  console.log(formatReport(findings, failures, loaded.length))
  if (failures.length > 0) process.exitCode = EXIT_UNREADABLE
  else if (findings.length > 0) process.exitCode = EXIT_FINDINGS
}

// Entry point: anything unexpected is reported plainly, never as a stack.
async function run(): Promise<void> {
  try {
    await main()
  } catch (error) {
    console.error(`code-check could not run: ${error instanceof Error ? error.message : 'unknown error'}. Check the source folders exist.`)
    process.exitCode = EXIT_UNREADABLE
  }
}

void run()
