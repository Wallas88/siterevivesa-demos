/*
 * deploy-guard.ts — first step of `npm run deploy`: reads the repository's
 * state from git and stops the deploy, listing every reason in plain words,
 * unless the rules in deploy-rules.ts say it may go live.
 */
import { execFileSync } from 'node:child_process'
import { deployBlockers } from './deploy-rules.ts'
import type { RepoState } from './deploy-rules.ts'

// git could not answer (no upstream, not a repository): treated as the unsafe case, never as "fine".
const GIT_UNANSWERED = null

function git(args: string[]): string | null {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return GIT_UNANSWERED
  }
}

function isListed(line: string): boolean {
  return line.trim() !== ''
}

function readRepoState(): RepoState {
  const unpushed = git(['rev-list', '--count', '@{upstream}..HEAD'])
  return {
    branch: git(['rev-parse', '--abbrev-ref', 'HEAD']) ?? 'unknown',
    uncommitted: (git(['status', '--porcelain']) ?? 'unreadable').split('\n').filter(isListed).length,
    hasUpstream: unpushed != null,
    unpushed: Number(unpushed ?? 0),
  }
}

const blockers = deployBlockers(readRepoState())
if (blockers.length > 0) {
  console.error('Deploy stopped:')
  for (const blocker of blockers) console.error(`  - ${blocker}`)
  process.exit(1)
}
console.log('Deploy guard: committed, on main and pushed.')
