/*
 * words.ts — the English words Copperkloof passes to the shared parts
 * (sign-in, hours, specials, Reset, the view switch, the photo picker).
 * The "What's different in your real site" facts were verified by Waldo
 * (28 Sep 2026); the real version is not built yet, so each item says how
 * it is built, not what this demo does.
 */
import type { SignInWords } from '../../../_core/sign-in/sign-in-words.ts'
import type { HoursWords } from '../../../_core/hours/hours-words.ts'
import type { SpecialWords } from '../../../_core/specials/special-words.ts'
import type { ResetWords } from '../../../_core/controls/ResetControl.tsx'
import type { ViewWords } from '../../../_core/view/ViewSwitch.tsx'
import type { PhotoWords } from '../../../_core/photos/PhotoPicker.tsx'
import type { AdminFrameWords } from '../../../_core/shell/AdminFrame.tsx'
import type { TeamWords } from '../../../_core/team/team-words.ts'
import { ERROR_MESSAGES } from '../../shared/error-codes.ts'
import { BUSINESS, DEMO_NOTICE, DEMO_OWNER_EMAIL, KEPT_ON_DEVICE } from './business.ts'

export const SIGN_IN_WORDS: SignInWords = {
  kicker: 'Demo of the real sign-in',
  title: 'Sign in to your admin',
  emailLabel: 'Email',
  demoEmail: DEMO_OWNER_EMAIL,
  emailNote: 'A demo address. You never type your own email here.',
  sendCode: 'Send code',
  sentTo: 'We sent a 6-digit code to',
  demoCodeNote: 'Demo: no email is sent. Your code is',
  codeLabel: 'Code',
  signIn: 'Sign in',
  sendNewCode: 'Send a new code',
  differencesTitle: "What's different in your real site",
  differences: [
    {
      here: 'Here the code is shown on screen.',
      real: "In your real site it is emailed only to addresses you approve, expires after 10 minutes and works once, so there's no password to guess, reuse or leak.",
    },
    {
      here: 'Here everything stays in this browser.',
      real: "In your real site, your site and its data live in a Cloudflare account in your own name, encrypted (AES-256) and sent over encrypted connections, so it stays yours, and you can remove the builder's access at any time.",
    },
    {
      here: 'Here no server checks anything.',
      real: 'In your real site every change is checked on the server before it is saved, so nobody can change your site without signing in.',
    },
    {
      here: 'Here Reset wipes your changes.',
      real: "In your real site there are daily backups plus Cloudflare's restore window (7 days on the free plan), so a mistake can be undone.",
    },
  ],
  errors: ERROR_MESSAGES,
}

export const HOURS_WORDS: HoursWords = {
  dayNames: { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' },
  to: 'to',
  closed: 'Closed',
  open: 'Open',
  opens: 'Opens',
  closes: 'Closes',
  lead: 'Changes show on the website straight away.',
  errors: ERROR_MESSAGES,
}

export const SPECIAL_WORDS: SpecialWords = {
  titleLabel: 'Title',
  titlePlaceholder: 'Winter geyser check',
  lineLabel: 'One line',
  endsLabel: 'Ends on',
  optional: '(optional)',
  add: 'Add special',
  remove: 'Remove',
  showsUntilRemoved: 'Shows until removed',
  ended: 'Ended, hidden from the website',
  empty: 'No specials yet. Add one above and it shows on the website.',
  endDate: { until: 'Until', months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
  errors: ERROR_MESSAGES,
}

export const RESET_WORDS: ResetWords = {
  invite: 'Try it: add a job from your phone.',
  question: 'Start again with the sample jobs?',
  resetDemo: 'Reset demo',
  reset: 'Reset',
  keep: 'Keep',
}

export const ADMIN_WORDS: AdminFrameWords = {
  title: `${BUSINESS.shortName} admin`,
  keptOnDevice: KEPT_ON_DEVICE,
  savesAsYouGo: 'Changes save as you go.',
  signOut: 'Sign out',
  demoNotice: DEMO_NOTICE,
  reset: RESET_WORDS,
}

export const VIEW_WORDS: ViewWords = { label: 'Choose a view', site: 'Website', admin: 'Admin' }

export const PHOTO_WORDS: PhotoWords = {
  preparing: 'Getting the photo ready…',
  none: 'No photo yet',
  previewAlt: 'Preview of the new job',
  take: 'Take photo',
  choose: 'Choose photo',
  errors: ERROR_MESSAGES,
}

export const TEAM_WORDS: TeamWords = {
  setupTitle: 'Set up your panel',
  setupOwner: "You'll be the owner:",
  setupNote: 'As owner you decide who else can sign in, and you can hand ownership to someone else.',
  setUp: 'Set up my panel',
  ownerNote: 'Only you, as owner, can add or remove people or hand ownership over.',
  adminNote: 'Only the owner can change who has access. You are an admin now.',
  nameLabel: 'Add a person (first name)',
  namePlaceholder: 'Thandi',
  signsInAs: 'They sign in as',
  add: 'Add person',
  owner: 'Owner',
  admin: 'Admin',
  makeOwner: 'Make owner',
  handOverQuestion: 'Hand ownership to',
  handOver: 'Hand over',
  keep: 'Keep',
  remove: 'Remove',
  errors: ERROR_MESSAGES,
}

export const LANGUAGE = 'en'
