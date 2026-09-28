/*
 * team.test.ts — who can sign in, with made-up names: the first setup,
 * adding by first name on the demo's .example domain, the limit, removing
 * (never the owner), handing ownership over (always exactly one owner),
 * and only the owner managing access.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { BUILDER_EMAIL, canManage, firstTeam, MAX_MEMBERS, newMember, ownerOf, removeMember, transferOwnership } from '../team/team.ts'
import type { Member } from '../team/team.ts'
import { CORE_MESSAGES_AF, CORE_MESSAGES_EN } from '../result/core-errors.ts'

const DOMAIN = 'testshop.example'
const OWNER = 'owner@testshop.example'

function team(): Member[] {
  return firstTeam(OWNER, 'Owner')
}

function codeOf(result: { ok: boolean; code?: string }): string {
  return result.ok ? 'OK' : (result.code ?? '')
}

function countOwners(members: Member[]): number {
  return members.filter(isOwner).length

  function isOwner(member: Member): boolean {
    return member.role === 'owner'
  }
}

test('the first setup makes the person signing in the owner and lists the builder', function setsUp() {
  const first = team()
  assert.equal(ownerOf(first)?.email, OWNER)
  assert.deepEqual(first[1], { email: BUILDER_EMAIL, name: 'SiteReviveSA', role: 'admin' })
})

test('a first name becomes an admin on the demo domain', function addsByName() {
  assert.deepEqual(newMember(team(), ' thandi ', DOMAIN), { ok: true, value: { email: 'thandi@testshop.example', name: 'Thandi', role: 'admin' } })
})

test('an email address, a single letter or digits are refused, so no real address is ever typed in', function refusesNonNames() {
  assert.equal(codeOf(newMember(team(), 'someone@gmail.com', DOMAIN)), 'TEAM_NAME_INVALID')
  assert.equal(codeOf(newMember(team(), 'A', DOMAIN)), 'TEAM_NAME_INVALID')
  assert.equal(codeOf(newMember(team(), 'Agent007', DOMAIN)), 'TEAM_NAME_INVALID')
})

test('the same person twice, or a sixth person, is refused; the words name the limit', function refusesDuplicateAndFull() {
  const withThandi = [...team(), { email: 'thandi@testshop.example', name: 'Thandi', role: 'admin' as const }]
  assert.equal(codeOf(newMember(withThandi, 'Thandi', DOMAIN)), 'TEAM_MEMBER_EXISTS')
  const full = [...withThandi, { email: 'b@x', name: 'B', role: 'admin' as const }, { email: 'c@x', name: 'C', role: 'admin' as const }]
  assert.equal(full.length, MAX_MEMBERS)
  assert.equal(codeOf(newMember(full, 'Sipho', DOMAIN)), 'TEAM_FULL')
  assert.match(CORE_MESSAGES_EN.TEAM_FULL, new RegExp(`\\b${MAX_MEMBERS}\\b`))
  assert.match(CORE_MESSAGES_AF.TEAM_FULL, new RegExp(`\\b${MAX_MEMBERS}\\b`))
})

test('anyone but the owner can be removed, the builder included', function removes() {
  const removed = removeMember(team(), BUILDER_EMAIL)
  assert.ok(removed.ok)
  assert.equal(removed.value.length, 1)
  assert.equal(codeOf(removeMember(team(), OWNER)), 'TEAM_OWNER_KEPT')
})

test('handing ownership over makes the chosen admin the one owner and the old owner an admin', function transfers() {
  const moved = transferOwnership(team(), BUILDER_EMAIL)
  assert.ok(moved.ok)
  assert.equal(ownerOf(moved.value)?.email, BUILDER_EMAIL)
  assert.equal(countOwners(moved.value), 1)
  assert.equal(moved.value.find(isOld)?.role, 'admin')

  function isOld(member: Member): boolean {
    return member.email === OWNER
  }
})

test('handing ownership to someone not listed, or to the owner, is refused', function refusesTransfer() {
  assert.equal(codeOf(transferOwnership(team(), 'stranger@testshop.example')), 'TEAM_TRANSFER_INVALID')
  assert.equal(codeOf(transferOwnership(team(), OWNER)), 'TEAM_TRANSFER_INVALID')
})

test('only the owner can manage access; after handing over, the old owner cannot', function onlyOwnerManages() {
  assert.equal(canManage(team(), OWNER), true)
  const moved = transferOwnership(team(), BUILDER_EMAIL)
  assert.ok(moved.ok)
  assert.equal(canManage(moved.value, OWNER), false)
})
