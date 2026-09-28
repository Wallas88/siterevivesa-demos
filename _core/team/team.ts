/*
 * team.ts — who can sign in to a demo's admin, as pure rules: the first
 * setup (the person signing in becomes the owner, the builder is listed
 * and can be removed), adding a person by first name on the demo's
 * reserved .example domain (a visitor never types a real email; Waldo,
 * 28 Sep 2026), removing a person, and handing ownership to someone
 * already listed. Only the owner may change who has access (Waldo, 28 Sep
 * 2026). There is always exactly one owner. Tested in tests/team.test.ts.
 */
import { CORE_ERROR_CODES } from '../result/core-errors.ts'
import type { CoreErrorCode } from '../result/core-errors.ts'
import { succeed, fail } from '../result/result.ts'
import type { Result } from '../result/result.ts'

export type Role = 'owner' | 'admin'

export interface Member {
  email: string
  name: string
  role: Role
}

export const MAX_MEMBERS = 5
const NAME = /^[a-zà-ÿ][a-zà-ÿ'-]{1,19}$/i
// The builder's place on the list: removable, and never a real address.
export const BUILDER_EMAIL = 'builder@siterevivesa.example'
export const BUILDER_NAME = 'SiteReviveSA'

// The owner is the person signing in; the builder is on the list until the owner removes them.
export function firstTeam(ownerEmail: string, ownerName: string): Member[] {
  return [
    { email: ownerEmail, name: ownerName, role: 'owner' },
    { email: BUILDER_EMAIL, name: BUILDER_NAME, role: 'admin' },
  ]
}

export function ownerOf(team: Member[]): Member | null {
  return team.find(isOwner) ?? null
}

function isOwner(member: Member): boolean {
  return member.role === 'owner'
}

export function canManage(team: Member[], signedInEmail: string): boolean {
  return ownerOf(team)?.email === signedInEmail
}

// "Thandi" on copperkloof.example becomes thandi@copperkloof.example; anything but a first name is refused.
export function newMember(team: Member[], typedName: string, domain: string): Result<Member, CoreErrorCode> {
  const name = typedName.trim()
  if (!NAME.test(name)) return fail(CORE_ERROR_CODES.TEAM_NAME_INVALID)
  const email = `${name.toLowerCase()}@${domain}`
  if (team.some(hasEmail)) return fail(CORE_ERROR_CODES.TEAM_MEMBER_EXISTS)
  if (team.length >= MAX_MEMBERS) return fail(CORE_ERROR_CODES.TEAM_FULL)
  return succeed({ email, name: name.charAt(0).toUpperCase() + name.slice(1), role: 'admin' })

  function hasEmail(member: Member): boolean {
    return member.email === email
  }
}

export function removeMember(team: Member[], email: string): Result<Member[], CoreErrorCode> {
  if (ownerOf(team)?.email === email) return fail(CORE_ERROR_CODES.TEAM_OWNER_KEPT)
  return succeed(team.filter(isOther))

  function isOther(member: Member): boolean {
    return member.email !== email
  }
}

// The chosen person becomes the owner and the old owner an admin; still exactly one owner.
export function transferOwnership(team: Member[], email: string): Result<Member[], CoreErrorCode> {
  const target = team.find(hasEmail)
  if (target == null || target.role === 'owner') return fail(CORE_ERROR_CODES.TEAM_TRANSFER_INVALID)
  return succeed(team.map(withRole))

  function hasEmail(member: Member): boolean {
    return member.email === email
  }

  function withRole(member: Member): Member {
    return { ...member, role: member.email === email ? 'owner' : 'admin' }
  }
}
