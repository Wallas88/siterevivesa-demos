/*
 * content-actions.ts — the admin actions every demo shares: open or close
 * a day, set a day's times, add or remove a special (checked against the
 * passed-in today first), set up the panel and change who can sign in
 * (only the owner may), and reset the demo. Each is a plain function of
 * its dependencies, so a demo binds them beside its own actions and tests
 * pass their own.
 */
import type { Dispatch } from 'react'
import { succeed, fail } from '../result/result.ts'
import type { Result } from '../result/result.ts'
import { CORE_ERROR_CODES } from '../result/core-errors.ts'
import type { CoreErrorCode } from '../result/core-errors.ts'
import { setDayTimes } from '../hours/opening-hours.ts'
import type { Weekday } from '../hours/opening-hours.ts'
import { checkSpecialDraft, MAX_SPECIALS } from '../specials/specials.ts'
import type { SpecialDraft } from '../specials/specials.ts'
import { canManage, firstTeam, newMember, removeMember, transferOwnership } from '../team/team.ts'
import type { Member } from '../team/team.ts'
import type { ContentAction, SharedContent } from './content-reducer.ts'

export interface ContentDependencies {
  dispatch: Dispatch<ContentAction | { type: 'reset' }>
  latestData: () => SharedContent
  today: () => string
  store: { clear: () => Promise<Result<true, CoreErrorCode>> }
  dropAllPhotoUrls: () => void
  markReset: () => void
  showNotice: (code: CoreErrorCode) => void
  // Who is signed in to the mock (the demo's own address), and the domain new people get.
  signedIn: { email: string; name: string }
  teamDomain: string
}

export interface ContentActions {
  setDayOpen: (day: Weekday, open: boolean) => void
  setDayTimes: (day: Weekday, opens: string, closes: string) => Result<true, CoreErrorCode>
  addSpecial: (draft: SpecialDraft) => Result<true, CoreErrorCode>
  removeSpecial: (id: string) => void
  resetDemo: () => Promise<void>
  setUpTeam: () => void
  addMember: (name: string) => Result<true, CoreErrorCode>
  removeMember: (email: string) => Result<true, CoreErrorCode>
  transferOwnership: (email: string) => Result<true, CoreErrorCode>
}

function setDayOpen(deps: ContentDependencies, day: Weekday, open: boolean): void {
  deps.dispatch({ type: 'dayOpenSet', day, open })
}

function setHours(deps: ContentDependencies, day: Weekday, opens: string, closes: string): Result<true, CoreErrorCode> {
  const next = setDayTimes(deps.latestData().hours, day, opens, closes)
  if (!next.ok) return next
  deps.dispatch({ type: 'hoursSet', hours: next.value })
  return succeed(true)
}

function addSpecial(deps: ContentDependencies, draft: SpecialDraft): Result<true, CoreErrorCode> {
  const checked = checkSpecialDraft(draft, deps.today())
  if (!checked.ok) return checked
  if (deps.latestData().specials.length >= MAX_SPECIALS) return fail(CORE_ERROR_CODES.SPECIALS_FULL)
  deps.dispatch({ type: 'specialAdded', special: { id: crypto.randomUUID(), ...checked.value } })
  return succeed(true)
}

function removeSpecial(deps: ContentDependencies, id: string): void {
  deps.dispatch({ type: 'specialRemoved', id })
}

function setUpTeam(deps: ContentDependencies): void {
  if (deps.latestData().team != null) return
  deps.dispatch({ type: 'teamSet', team: firstTeam(deps.signedIn.email, deps.signedIn.name) })
}

// Only the owner may change the list; the change itself is one of the pure team rules.
function changeTeam(deps: ContentDependencies, change: (team: Member[]) => Result<Member[], CoreErrorCode>): Result<true, CoreErrorCode> {
  const team = deps.latestData().team
  if (team == null || !canManage(team, deps.signedIn.email)) return fail(CORE_ERROR_CODES.TEAM_NOT_OWNER)
  const next = change(team)
  if (!next.ok) return next
  deps.dispatch({ type: 'teamSet', team: next.value })
  return succeed(true)
}

function addMember(deps: ContentDependencies, name: string): Result<true, CoreErrorCode> {
  return changeTeam(deps, withMember)

  function withMember(team: Member[]): Result<Member[], CoreErrorCode> {
    const member = newMember(team, name, deps.teamDomain)
    return member.ok ? succeed([...team, member.value]) : member
  }
}

function removePerson(deps: ContentDependencies, email: string): Result<true, CoreErrorCode> {
  return changeTeam(deps, withoutMember)

  function withoutMember(team: Member[]): Result<Member[], CoreErrorCode> {
    return removeMember(team, email)
  }
}

function handOver(deps: ContentDependencies, email: string): Result<true, CoreErrorCode> {
  return changeTeam(deps, withNewOwner)

  function withNewOwner(team: Member[]): Result<Member[], CoreErrorCode> {
    return transferOwnership(team, email)
  }
}

// Clears the visitor's store and photos, then brings back the demo's seed.
async function resetDemo(deps: ContentDependencies): Promise<void> {
  const cleared = await deps.store.clear()
  deps.dropAllPhotoUrls()
  deps.dispatch({ type: 'reset' })
  deps.markReset()
  if (!cleared.ok) deps.showNotice(cleared.code)
}

export function createContentActions(deps: ContentDependencies): ContentActions {
  return {
    setDayOpen: setDayOpen.bind(null, deps),
    setDayTimes: setHours.bind(null, deps),
    addSpecial: addSpecial.bind(null, deps),
    removeSpecial: removeSpecial.bind(null, deps),
    resetDemo: resetDemo.bind(null, deps),
    setUpTeam: setUpTeam.bind(null, deps),
    addMember: addMember.bind(null, deps),
    removeMember: removePerson.bind(null, deps),
    transferOwnership: handOver.bind(null, deps),
  }
}
