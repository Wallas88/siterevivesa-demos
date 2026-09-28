/*
 * team-steps.ts — the sandbox steps for the panel's first setup and the
 * people who can sign in, the same in every demo: the setup step names the
 * signed-in owner; setting up lists the owner and the builder; a first
 * name is added on the demo's .example domain; an email address is
 * refused in the demo's own words; a person is removed; and handing
 * ownership over leaves the old owner unable to change the list.
 * finishSetup() is for any later step that opens the admin fresh.
 */
import { setTimeout as wait } from 'node:timers/promises'
import { inPage } from '../browser/page-measurements.ts'
import { fillAndSendMember, passSetup, readTeamView, tapButton, tapByLabel } from './sandbox-page.ts'
import type { TeamView } from './sandbox-page.ts'
import { check, evaluateOr, SETTLE_MS } from './session.ts'
import type { Session } from './session.ts'

export interface TeamCheck {
  ownerEmail: string
  domain: string
  words: { nameInvalid: string; adminNote: string; remove: string; makeOwner: string; handOver: string }
}

const NEW_NAME = 'Thandi'
const BUILDER_NAME = 'SiteReviveSA'
const AN_EMAIL = 'someone@mail.test'

function teamView(session: Session): Promise<TeamView | null> {
  return evaluateOr<TeamView | null>(session, inPage(readTeamView), null)
}

async function settle(session: Session, expression: string): Promise<TeamView | null> {
  await session.browser.evaluate<boolean>(expression)
  await wait(SETTLE_MS)
  return teamView(session)
}

function names(view: TeamView | null): string[] {
  return view?.members.map(nameOf) ?? []

  function nameOf(member: { name: string }): string {
    return member.name
  }
}

export async function finishSetup(session: Session): Promise<void> {
  await session.browser.evaluate<boolean>(inPage(passSetup))
  await wait(SETTLE_MS)
}

async function checkSetup(session: Session, setup: TeamCheck): Promise<void> {
  const before = await teamView(session)
  check(session, before?.setupShown === true && before.setupOwner === setup.ownerEmail, 'the first sign-in shows the panel setup, with the signed-in address as owner')
  const after = await settle(session, inPage(passSetup))
  check(session, after?.setupShown === false && names(after).join(',') === `Owner,${BUILDER_NAME}`, 'setting up lists the owner and the builder')
}

async function checkAddAndRemove(session: Session, setup: TeamCheck): Promise<void> {
  const added = await settle(session, inPage(fillAndSendMember, NEW_NAME))
  check(session, added?.members.some(isNewPerson) === true, `a first name is added as ${NEW_NAME.toLowerCase()}@${setup.domain}`)
  const refused = await settle(session, inPage(fillAndSendMember, AN_EMAIL))
  check(session, refused?.error === setup.words.nameInvalid && names(refused).length === 3, 'an email address is refused in plain words, so no real address is typed in')
  const removed = await settle(session, inPage(tapByLabel, `${setup.words.remove}: ${NEW_NAME}`))
  check(session, !names(removed).includes(NEW_NAME), 'a person can be removed')

  function isNewPerson(member: { name: string; meta: string }): boolean {
    return member.name === NEW_NAME && member.meta.startsWith(`${NEW_NAME.toLowerCase()}@${setup.domain}`)
  }
}

async function checkHandOver(session: Session, setup: TeamCheck): Promise<void> {
  await session.browser.evaluate<boolean>(inPage(tapByLabel, `${setup.words.makeOwner}: ${BUILDER_NAME}`))
  const handed = await settle(session, inPage(tapButton, setup.words.handOver))
  check(session, handed?.note === setup.words.adminNote && handed.addDisabled, 'after handing ownership over, the old owner can no longer change who has access')
}

// Run straight after the shared sign-in steps, on the admin they opened.
export async function checkTeam(session: Session, setup: TeamCheck): Promise<void> {
  await checkSetup(session, setup)
  await checkAddAndRemove(session, setup)
  await checkHandOver(session, setup)
}
