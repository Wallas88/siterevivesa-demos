/*
 * deploy-rules.ts — when the demo may go live: only from committed code on
 * main that is already on GitHub, so what is live is always what the
 * repository holds (hosting security standard, Code row; Waldo, 27 Sep
 * 2026). Pure; scripts/deploy-guard.ts reads the state from git.
 */

export interface RepoState {
  branch: string
  uncommitted: number
  // False when main has no GitHub branch to compare against.
  hasUpstream: boolean
  unpushed: number
}

const DEPLOY_BRANCH = 'main'

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

// Every reason the deploy must stop, in plain words, all at once; empty means go.
export function deployBlockers(state: RepoState): string[] {
  const blockers: string[] = []
  if (state.uncommitted > 0) blockers.push(`${plural(state.uncommitted, 'uncommitted change')}: commit first, so what goes live is in the repository.`)
  if (state.branch !== DEPLOY_BRANCH) blockers.push(`On branch "${state.branch}": merge into ${DEPLOY_BRANCH} and deploy from there.`)
  if (!state.hasUpstream) blockers.push(`"${state.branch}" has no branch on GitHub to compare with: push it first.`)
  else if (state.unpushed > 0) blockers.push(`${plural(state.unpushed, 'commit')} not on GitHub yet: push first, so what is live matches GitHub.`)
  return blockers
}
