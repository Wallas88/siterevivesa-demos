/*
 * sandbox-check.ts — proves Stofpad end to end in headless Chrome at
 * 360×780 with touch: the mock sign-in (shared steps); a product added in
 * the admin with a real image file shows first in the shop, shrunk to
 * 1200px; out of stock stops Add; a price typed in the admin reaches the
 * WhatsApp link, with the R110 courier and the closing line naming the
 * demo; Afrikaans switches the message and the page; specials and hours
 * reach the shop; a reload keeps the product and Reset brings the seed
 * back; no request leaves the page's origin; with storage blocked the demo
 * still works and says so. The harness is ../../_core/checks/sandbox/.
 *
 *   npm run build && CHROME_PATH=/path/to/chrome npm run sandbox-check
 */
import { setTimeout as wait } from 'node:timers/promises'
import { inPage } from '../../_core/checks/browser/page-measurements.ts'
import { runSandboxCheck } from '../../_core/checks/sandbox/run-sandbox.ts'
import { check, waitFor, PHONE, SETTLE_MS } from '../../_core/checks/sandbox/session.ts'
import type { Session } from '../../_core/checks/sandbox/session.ts'
import { checkSignIn, checkSignOut } from '../../_core/checks/sandbox/sign-in-steps.ts'
import { checkTeam, finishSetup } from '../../_core/checks/sandbox/team-steps.ts'
import type { TeamCheck } from '../../_core/checks/sandbox/team-steps.ts'
import type { SignInCheck } from '../../_core/checks/sandbox/sign-in-steps.ts'
import { blockStorage, fillAndSendSpecial, tapButton, tapByLabel } from '../../_core/checks/sandbox/sandbox-page.ts'
import { offOriginRequests } from '../../_core/checks/sandbox/sandbox-rules.ts'
import { MAX_PHOTO_SIDE_PX } from '../../_core/photos/photo-size.ts'
import { ERROR_MESSAGES } from '../shared/error-codes.ts'
import { DEMO_OWNER_EMAIL, SIGNED_IN_KEY, TEAM_DOMAIN } from '../src/content/business.ts'
import { SEED_PRODUCTS } from '../src/content/catalogue.ts'
import { WORDS } from '../src/content/words.ts'
import { clickSelector, fillAndSendProduct, readShopState, typePrice } from './sandbox-check/sandbox-page.ts'
import type { ShopState } from './sandbox-check/sandbox-page.ts'

const ADMIN = '/?view=admin'
const NEW_PRODUCT = 'Test biltong from the sandbox check'
const NEW_SPECIAL = 'Test special from the sandbox check'
const WHATSAPP_START = 'https://wa.me/27681571817?text='
const SIGN_IN: SignInCheck = {
  adminPath: ADMIN,
  demoEmail: DEMO_OWNER_EMAIL,
  signedInKey: SIGNED_IN_KEY,
  words: { sendCode: WORDS.en.signIn.sendCode, sendNewCode: WORDS.en.signIn.sendNewCode, signOut: WORDS.en.frame.signOut, codeWrong: ERROR_MESSAGES.en.CODE_WRONG },
}
const TEAM: TeamCheck = {
  ownerEmail: DEMO_OWNER_EMAIL,
  domain: TEAM_DOMAIN,
  words: { nameInvalid: WORDS.en.team.errors.TEAM_NAME_INVALID, adminNote: WORDS.en.team.adminNote, remove: WORDS.en.team.remove, makeOwner: WORDS.en.team.makeOwner, handOver: WORDS.en.team.handOver },
}

async function stateOf(session: Session): Promise<ShopState | null> {
  const state = await session.browser.evaluate<ShopState>(inPage(readShopState))
  return state.ok ? state.value : null
}

function waitForState(session: Session, holds: (state: ShopState) => boolean): Promise<ShopState | null> {
  return waitFor(stateOf.bind(null, session), holds)
}

function isReady(state: ShopState): boolean {
  return state.ready
}

function hasPreview(state: ShopState): boolean {
  return state.previewShown
}

function leadsWithNewProduct(state: ShopState): boolean {
  return state.productNames[0] === NEW_PRODUCT && (state.firstPhoto?.naturalWidth ?? 0) > 0
}

function messageOf(state: ShopState | null): string {
  const href = state?.whatsappHref ?? ''
  return href.startsWith(WHATSAPP_START) ? decodeURIComponent(href.slice(WHATSAPP_START.length)) : ''
}

async function click(session: Session, selector: string): Promise<boolean> {
  const clicked = await session.browser.evaluate<boolean>(inPage(clickSelector, selector))
  await wait(SETTLE_MS)
  return clicked.ok && clicked.value
}

async function checkAddProduct(session: Session): Promise<void> {
  await session.browser.open(`${session.origin}${ADMIN}`, PHONE, true)
  await finishSetup(session)
  check(session, (await waitForState(session, isReady))?.ready === true, 'admin opens and its store is ready')
  const picked = await session.browser.setInputFiles('input[name="file-photo"]', [session.photoPath])
  check(session, picked.ok && (await waitForState(session, hasPreview))?.previewShown === true, 'a real image file is picked and previewed')
  await session.browser.evaluate<boolean>(inPage(fillAndSendProduct, NEW_PRODUCT, '380'))
  const added = await waitForState(session, leadsWithNewProduct)
  check(session, added != null && leadsWithNewProduct(added), 'the new product leads the shop at once')
  check(session, added?.firstPhoto?.src.startsWith('blob:') === true, "its photo is shown from the visitor's own browser (blob:)")
  check(session, (added?.firstPhoto?.naturalWidth ?? Number.POSITIVE_INFINITY) <= MAX_PHOTO_SIDE_PX, `the photo was shrunk to at most ${MAX_PHOTO_SIDE_PX}px`)
}

async function checkOutOfStock(session: Session): Promise<void> {
  await session.browser.evaluate<boolean>(inPage(tapByLabel, 'Beef Biltong: In stock'))
  await wait(SETTLE_MS)
  const refused = !(await click(session, '.product[data-id="beef"] .product-add'))
  check(session, refused && (await stateOf(session))?.orderCount === '0', 'an out-of-stock product cannot be added to the order')
}

async function checkPriceReachesWhatsApp(session: Session): Promise<void> {
  await session.browser.evaluate<boolean>(inPage(typePrice, '#price-chilli', '500'))
  await click(session, '.product[data-id="chilli"] .product-add')
  await click(session, '.courier-box')
  const message = messageOf(await stateOf(session))
  check(session, message.includes('1 × 250 g Chilli Bites — R125.00'), 'a price typed in the admin reaches the WhatsApp message')
  check(session, message.includes('Courier (subject to confirmation) — R110.00'), 'the courier is R110 in the message')
  check(session, message.endsWith('Sent from the Stofpad Biltong demo on siterevivesa.com.'), 'the message ends with the line naming the demo, and goes to SiteReviveSA')
}

async function checkAfrikaans(session: Session): Promise<void> {
  await session.browser.evaluate<boolean>(inPage(tapByLabel, 'Afrikaans'))
  await wait(SETTLE_MS)
  const state = await stateOf(session)
  check(session, messageOf(state).startsWith('Hallo Stofpad Biltong (demo), ek wil graag bestel:') && state?.htmlLang === 'af', 'Afrikaans switches the message and the page')
  await session.browser.evaluate<boolean>(inPage(tapByLabel, 'English'))
  await wait(SETTLE_MS)
}

async function checkSpecialsAndHours(session: Session): Promise<void> {
  await session.browser.evaluate<boolean>(inPage(fillAndSendSpecial, NEW_SPECIAL, ''))
  await wait(SETTLE_MS)
  check(session, (await stateOf(session))?.specialTitles[0] === NEW_SPECIAL, 'a new special shows first in the shop at once')
  await session.browser.evaluate<boolean>(inPage(tapByLabel, 'Sunday: Closed'))
  await wait(SETTLE_MS)
  check(session, (await stateOf(session))?.sundayHours === '09:00 to 13:00', 'opening Sunday in the admin shows its hours in the shop')
}

function hasSeedProducts(state: ShopState): boolean {
  return state.productNames.length === SEED_PRODUCTS.length && !state.productNames.includes(NEW_PRODUCT)
}

async function checkReloadAndReset(session: Session): Promise<void> {
  await session.browser.open(`${session.origin}${ADMIN}`, PHONE, true)
  await finishSetup(session)
  check(session, (await waitForState(session, leadsWithNewProduct)) != null, 'the new product and its photo survive a reload')
  await session.browser.evaluate<boolean>(inPage(tapButton, WORDS.en.frame.reset.resetDemo))
  await session.browser.evaluate<boolean>(inPage(tapButton, WORDS.en.frame.reset.reset))
  const reset = await waitForState(session, hasSeedProducts)
  check(session, reset != null && hasSeedProducts(reset), 'Reset brings back exactly the seed products')
  const requests = (await stateOf(session))?.requests ?? []
  const elsewhere = offOriginRequests(requests, session.origin)
  check(session, requests.length > 0 && elsewhere.length === 0, `no request left the page's origin (${requests.length} requests, ${elsewhere.length} elsewhere)`)
}

async function checkBlockedStorage(session: Session): Promise<void> {
  await session.browser.addStartupScript(inPage(blockStorage))
  await session.browser.open(`${session.origin}${ADMIN}`, PHONE, true)
  await finishSetup(session)
  const opened = await waitForState(session, isReady)
  check(session, opened?.adminStatus === ERROR_MESSAGES.en.STORAGE_BLOCKED, 'with storage blocked, the admin says so in plain words')
  check(session, opened != null && hasSeedProducts(opened), 'with storage blocked, the shop still shows every product')
}

async function checkShopStaysPublic(session: Session): Promise<void> {
  await checkSignOut(session, SIGN_IN)
  check(session, ((await stateOf(session))?.productNames.length ?? 0) > 0, 'the shop stays public while signed out')
}

async function steps(session: Session): Promise<void> {
  await checkSignIn(session, SIGN_IN)
  await checkTeam(session, TEAM)
  await checkAddProduct(session)
  await checkOutOfStock(session)
  await checkPriceReachesWhatsApp(session)
  await checkAfrikaans(session)
  await checkSpecialsAndHours(session)
  await checkReloadAndReset(session)
  await checkBlockedStorage(session)
  await checkShopStaysPublic(session)
}

await runSandboxCheck('Sandbox check — Stofpad: add a product on the phone, it is in the shop and the WhatsApp order at once, nothing leaves the browser', steps)
