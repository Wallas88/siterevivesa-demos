/*
 * sandbox-check.ts — proves Copperkloof's one promise end to end in
 * headless Chrome at 360×780 with touch: the mock sign-in (shared steps);
 * a real image file added in the admin shows on the website at once,
 * shrunk to 1200px, survives a reload, and Reset brings the seed back;
 * specials and hours edits show on the site; no request ever leaves the
 * page's own origin; and with storage blocked the demo still works and
 * says so. The harness is ../../_core/checks/sandbox/run-sandbox.ts.
 *
 *   npm run build && CHROME_PATH=/path/to/chrome npm run sandbox-check
 */
import { SEED_JOBS } from '../src/content/seed.ts'
import { ERROR_MESSAGES } from '../shared/error-codes.ts'
import { DEMO_OWNER_EMAIL, SIGNED_IN_KEY, TEAM_DOMAIN } from '../src/content/business.ts'
import { SIGN_IN_WORDS, TEAM_WORDS } from '../src/content/words.ts'
import { MAX_PHOTO_SIDE_PX } from '../../_core/photos/photo-size.ts'
import { inPage } from '../../_core/checks/browser/page-measurements.ts'
import { runSandboxCheck } from '../../_core/checks/sandbox/run-sandbox.ts'
import { check, waitFor, PHONE, SETTLE_MS } from '../../_core/checks/sandbox/session.ts'
import type { Session } from '../../_core/checks/sandbox/session.ts'
import { checkSignIn, checkSignOut } from '../../_core/checks/sandbox/sign-in-steps.ts'
import { checkTeam, finishSetup } from '../../_core/checks/sandbox/team-steps.ts'
import type { TeamCheck } from '../../_core/checks/sandbox/team-steps.ts'
import type { SignInCheck } from '../../_core/checks/sandbox/sign-in-steps.ts'
import { tapButton, blockStorage, fillAndSendSpecial, tapByLabel } from '../../_core/checks/sandbox/sandbox-page.ts'
import { offOriginRequests, showsSeed } from '../../_core/checks/sandbox/sandbox-rules.ts'
import { setTimeout as wait } from 'node:timers/promises'
import { readPageState, fillAndSendJob, readSiteExtras } from './sandbox-check/sandbox-page.ts'
import type { PageState, SiteExtras } from './sandbox-check/sandbox-page.ts'

const ADMIN = '/?view=admin'
const ADDED_TITLE = 'Test job from the sandbox check'
const ADDED_CAPTION = 'Made-up caption for the check.'
const FALLBACK_TITLE = 'Test job with storage blocked'
const SEED_TITLES = SEED_JOBS.map(titleOf)
const ENDED_SPECIAL = 'Test special that already ended'
const NEW_SPECIAL = 'Test special from the sandbox check'
// Long past for any visitor's calendar.
const PAST_DATE = '2000-01-01'
const SEED_SUNDAY_TIMES = '08:00 to 13:00'
const SIGN_IN: SignInCheck = {
  adminPath: ADMIN,
  demoEmail: DEMO_OWNER_EMAIL,
  signedInKey: SIGNED_IN_KEY,
  words: { sendCode: SIGN_IN_WORDS.sendCode, sendNewCode: SIGN_IN_WORDS.sendNewCode, signOut: 'Sign out', codeWrong: ERROR_MESSAGES.CODE_WRONG },
}
const TEAM: TeamCheck = {
  ownerEmail: DEMO_OWNER_EMAIL,
  domain: TEAM_DOMAIN,
  words: { nameInvalid: TEAM_WORDS.errors.TEAM_NAME_INVALID, adminNote: TEAM_WORDS.adminNote, remove: TEAM_WORDS.remove, makeOwner: TEAM_WORDS.makeOwner, handOver: TEAM_WORDS.handOver },
}

function titleOf(job: { title: string }): string {
  return job.title
}

async function stateOf(session: Session): Promise<PageState | null> {
  const state = await session.browser.evaluate<PageState>(inPage(readPageState, ADDED_TITLE))
  return state.ok ? state.value : null
}

function waitForState(session: Session, holds: (state: PageState) => boolean): Promise<PageState | null> {
  return waitFor(stateOf.bind(null, session), holds)
}

function isReady(state: PageState): boolean {
  return state.ready
}

function hasPreview(state: PageState): boolean {
  return state.previewShown
}

function showsAddedPhoto(state: PageState): boolean {
  return state.addedPhoto != null && state.addedPhoto.naturalWidth > 0
}

function showsSeedAgain(state: PageState): boolean {
  return showsSeed(state.siteTitles, SEED_TITLES)
}

async function addJobWithPhoto(session: Session, title: string): Promise<boolean> {
  const picked = await session.browser.setInputFiles('input[name="file-photo"]', [session.photoPath])
  if (!picked.ok || (await waitForState(session, hasPreview))?.previewShown !== true) return false
  const sent = await session.browser.evaluate<boolean>(inPage(fillAndSendJob, title, ADDED_CAPTION))
  return sent.ok && sent.value
}

async function checkAddShowsOnSite(session: Session): Promise<void> {
  await session.browser.open(`${session.origin}${ADMIN}`, PHONE, true)
  await finishSetup(session)
  check(session, (await waitForState(session, isReady))?.ready === true, 'admin opens and its store is ready')
  check(session, await addJobWithPhoto(session, ADDED_TITLE), 'a real image file is picked, previewed and sent')
  const added = await waitForState(session, showsAddedPhoto)
  check(session, added?.siteTitles.includes(ADDED_TITLE) === true, 'the new job is on the website view at once')
  check(session, added?.addedPhoto?.src.startsWith('blob:') === true, "its photo is shown from the visitor's own browser (blob:)")
  check(session, (added?.addedPhoto?.naturalWidth ?? Number.POSITIVE_INFINITY) <= MAX_PHOTO_SIDE_PX, `the photo was shrunk to at most ${MAX_PHOTO_SIDE_PX}px`)
  await session.browser.evaluate<boolean>(inPage(tapButton, 'Website'))
  check(session, (await waitForState(session, showsAddedPhoto))?.addedCardShown === true, 'after tapping Website, the new job card is on screen')
}

async function extras(session: Session): Promise<SiteExtras | null> {
  await wait(SETTLE_MS)
  const read = await session.browser.evaluate<SiteExtras>(inPage(readSiteExtras))
  return read.ok ? read.value : null
}

// Specials and hours edited in the admin show on the website; a special that has already ended is refused.
async function checkContentEdits(session: Session): Promise<void> {
  await session.browser.evaluate<boolean>(inPage(fillAndSendSpecial, ENDED_SPECIAL, PAST_DATE))
  const refused = await extras(session)
  check(session, refused?.specialError === ERROR_MESSAGES.SPECIAL_ENDED && !refused.specialTitles.includes(ENDED_SPECIAL), 'a special whose end date has passed is refused in plain words')
  await session.browser.evaluate<boolean>(inPage(fillAndSendSpecial, NEW_SPECIAL, ''))
  check(session, (await extras(session))?.specialTitles[0] === NEW_SPECIAL, 'a new special shows first on the website at once')
  await session.browser.evaluate<boolean>(inPage(tapByLabel, 'Sunday: Closed'))
  check(session, (await extras(session))?.sundayHours === SEED_SUNDAY_TIMES, 'opening Sunday in the admin shows its hours on the website')
}

async function checkReloadAndReset(session: Session): Promise<void> {
  await session.browser.open(`${session.origin}${ADMIN}`, PHONE, true)
  await finishSetup(session)
  const reloaded = await waitForState(session, showsAddedPhoto)
  check(session, reloaded?.siteTitles.includes(ADDED_TITLE) === true, 'the new job and its photo survive a reload')
  await session.browser.evaluate<boolean>(inPage(tapButton, 'Reset demo'))
  await session.browser.evaluate<boolean>(inPage(tapButton, 'Reset'))
  const reset = await waitForState(session, showsSeedAgain)
  check(session, reset != null && showsSeedAgain(reset), 'Reset brings back exactly the seed jobs')
  const requests = (await stateOf(session))?.requests ?? []
  const elsewhere = offOriginRequests(requests, session.origin)
  check(session, requests.length > 0 && elsewhere.length === 0, `no request left the page's origin (${requests.length} requests, ${elsewhere.length} elsewhere)`)
}

async function checkBlockedStorage(session: Session): Promise<void> {
  await session.browser.addStartupScript(inPage(blockStorage))
  await session.browser.open(`${session.origin}${ADMIN}`, PHONE, true)
  await finishSetup(session)
  const opened = await waitForState(session, isReady)
  check(session, opened?.adminStatus === ERROR_MESSAGES.STORAGE_BLOCKED, 'with storage blocked, the admin says so in plain words')
  check(session, showsSeed(opened?.siteTitles ?? [], SEED_TITLES), 'with storage blocked, the website still shows the seed jobs')
  check(session, await addJobWithPhoto(session, FALLBACK_TITLE), 'with storage blocked, a job can still be added')
  const added = await waitForState(session, isFallbackAdded)
  check(session, added?.siteTitles.includes(FALLBACK_TITLE) === true, 'with storage blocked, the new job still shows on the website')

  function isFallbackAdded(state: PageState): boolean {
    return state.siteTitles.includes(FALLBACK_TITLE)
  }
}

async function checkSiteStaysPublic(session: Session): Promise<void> {
  await checkSignOut(session, SIGN_IN)
  check(session, ((await stateOf(session))?.siteTitles.length ?? 0) > 0, 'the website stays public while signed out')
}

async function steps(session: Session): Promise<void> {
  await checkSignIn(session, SIGN_IN)
  await checkTeam(session, TEAM)
  await checkAddShowsOnSite(session)
  await checkContentEdits(session)
  await checkReloadAndReset(session)
  await checkBlockedStorage(session)
  await checkSiteStaysPublic(session)
}

await runSandboxCheck('Sandbox check — photo on the phone, on the website straight away, nothing leaves the browser', steps)
