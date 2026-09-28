/*
 * deploy-guard.test.ts — the demo goes live only from committed, pushed
 * code on main, so what is live is always what is on GitHub (hosting
 * security standard, Code row; Waldo, 27 Sep 2026).
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { deployBlockers } from '../checks/deploy/deploy-rules.ts'
import type { RepoState } from '../checks/deploy/deploy-rules.ts'

function readyRepo(overrides: Partial<RepoState> = {}): RepoState {
  return { branch: 'main', uncommitted: 0, hasUpstream: true, unpushed: 0, ...overrides }
}

test('a clean, pushed main may deploy', function cleanMainDeploys() {
  assert.deepEqual(deployBlockers(readyRepo()), [])
})

test('uncommitted changes block the deploy and say how many', function uncommittedBlocks() {
  const blockers = deployBlockers(readyRepo({ uncommitted: 3 }))
  assert.equal(blockers.length, 1)
  assert.match(blockers[0] ?? '', /3 uncommitted/)
})

test('any branch other than main blocks the deploy', function otherBranchBlocks() {
  assert.match(deployBlockers(readyRepo({ branch: 'rewrite' })).join(' '), /"rewrite"/)
})

test('commits not yet on GitHub block the deploy', function unpushedBlocks() {
  assert.match(deployBlockers(readyRepo({ unpushed: 2 })).join(' '), /2 commits/)
})

test('a main with no GitHub branch to compare against blocks the deploy', function noUpstreamBlocks() {
  assert.equal(deployBlockers(readyRepo({ hasUpstream: false })).length, 1)
})

test('every problem is listed at once, not one per attempt', function allProblemsListed() {
  assert.equal(deployBlockers({ branch: 'astro', uncommitted: 5, hasUpstream: true, unpushed: 1 }).length, 3)
})
