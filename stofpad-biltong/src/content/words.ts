/*
 * words.ts — the words Stofpad passes to the shared parts (sign-in, hours,
 * specials, Reset, the view switch, the photo picker, the admin frame) and
 * its own admin, in English and Afrikaans. The "What's different in your
 * real site" facts were verified by Waldo (28 Sep 2026) and are worded
 * here for a shop; the real version is not built yet, so each item says
 * how it is built, not what this demo does.
 */
import type { SignInWords } from '../../../_core/sign-in/sign-in-words.ts'
import type { HoursWords } from '../../../_core/hours/hours-words.ts'
import type { SpecialWords } from '../../../_core/specials/special-words.ts'
import type { ViewWords } from '../../../_core/view/ViewSwitch.tsx'
import type { PhotoWords } from '../../../_core/photos/PhotoPicker.tsx'
import type { AdminFrameWords } from '../../../_core/shell/AdminFrame.tsx'
import type { TeamWords } from '../../../_core/team/team-words.ts'
import type { Language } from '../features/catalogue/products.ts'
import { ERROR_MESSAGES } from '../../shared/error-codes.ts'
import { DEMO_NOTICE, DEMO_OWNER_EMAIL } from './business.ts'
import { ADMIN_WORDS_BY_LANGUAGE } from './admin-words.ts'
import type { AdminWords } from './admin-words.ts'

export type { AdminWords }

export interface Words {
  signIn: SignInWords
  hours: HoursWords
  specials: SpecialWords
  view: ViewWords
  photo: PhotoWords
  frame: AdminFrameWords
  admin: AdminWords
  team: TeamWords
}

const SIGN_IN_EN: SignInWords = {
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
      real: "In your real site, your shop and its data live in a Cloudflare account in your own name, encrypted (AES-256) and sent over encrypted connections, so it stays yours, and you can remove the builder's access at any time.",
    },
    {
      here: 'Here no server checks anything.',
      real: 'In your real site every change is checked on the server before it is saved, so nobody can change your shop without signing in.',
    },
    {
      here: 'Here Reset wipes your changes.',
      real: "In your real site there are daily backups plus Cloudflare's restore window (7 days on the free plan), so a mistake can be undone.",
    },
  ],
  errors: ERROR_MESSAGES.en,
}

const SIGN_IN_AF: SignInWords = {
  kicker: 'Demo van die regte aanmelding',
  title: 'Meld aan by jou admin',
  emailLabel: 'E-pos',
  demoEmail: DEMO_OWNER_EMAIL,
  emailNote: "'n Demo-adres. Jy tik nooit jou eie e-pos hier nie.",
  sendCode: 'Stuur kode',
  sentTo: "Ons het 'n 6-syfer-kode gestuur na",
  demoCodeNote: 'Demo: geen e-pos word gestuur nie. Jou kode is',
  codeLabel: 'Kode',
  signIn: 'Meld aan',
  sendNewCode: "Stuur 'n nuwe kode",
  differencesTitle: 'Wat anders is in jou regte webwerf',
  differences: [
    {
      here: 'Hier wys die kode op die skerm.',
      real: 'In jou regte webwerf word dit net na adresse wat jy goedkeur ge-e-pos, verval dit ná 10 minute en werk dit net een keer, so daar is geen wagwoord om te raai, te hergebruik of te lek nie.',
    },
    {
      here: 'Hier bly alles in hierdie blaaier.',
      real: "In jou regte webwerf is jou winkel en sy data in 'n Cloudflare-rekening op jou eie naam, versleutel (AES-256) en oor versleutelde verbindings gestuur, so dit bly joune, en jy kan die bouer se toegang enige tyd verwyder.",
    },
    {
      here: 'Hier kontroleer geen bediener iets nie.',
      real: 'In jou regte webwerf word elke verandering op die bediener nagegaan voordat dit gestoor word, so niemand kan jou winkel verander sonder om aan te meld nie.',
    },
    {
      here: 'Hier vee Herstel jou veranderinge uit.',
      real: "In jou regte webwerf is daar daaglikse rugsteun plus Cloudflare se herstelvenster (7 dae op die gratis plan), so 'n fout kan ongedaan gemaak word.",
    },
  ],
  errors: ERROR_MESSAGES.af,
}

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_AF = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des']

export const WORDS: Record<Language, Words> = {
  en: {
    signIn: SIGN_IN_EN,
    hours: {
      dayNames: { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' },
      to: 'to',
      closed: 'Closed',
      open: 'Open',
      opens: 'Opens',
      closes: 'Closes',
      lead: 'Changes show in the shop straight away.',
      errors: ERROR_MESSAGES.en,
    },
    specials: {
      titleLabel: 'Title',
      titlePlaceholder: 'Weekend braai pack',
      lineLabel: 'One line',
      endsLabel: 'Ends on',
      optional: '(optional)',
      add: 'Add special',
      remove: 'Remove',
      showsUntilRemoved: 'Shows until removed',
      ended: 'Ended, hidden from the shop',
      empty: 'No specials yet. Add one above and it shows in the shop.',
      endDate: { until: 'Until', months: MONTHS_EN },
      errors: ERROR_MESSAGES.en,
    },
    view: { label: 'Choose a view', site: 'Shop', admin: 'Admin' },
    photo: { preparing: 'Getting the photo ready…', none: 'No photo yet', previewAlt: 'Preview of the new product', take: 'Take photo', choose: 'Choose photo', errors: ERROR_MESSAGES.en },
    frame: {
      title: 'Stofpad admin',
      keptOnDevice: 'Everything you add stays on this device. We never see it.',
      savesAsYouGo: 'Changes save as you go.',
      signOut: 'Sign out',
      demoNotice: DEMO_NOTICE,
      reset: { invite: 'Try it: add a product from your phone.', question: 'Start again with the sample products?', resetDemo: 'Reset demo', reset: 'Reset', keep: 'Keep' },
    },
    admin: ADMIN_WORDS_BY_LANGUAGE.en,
    team: {
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
      errors: ERROR_MESSAGES.en,
    },
  },
  af: {
    signIn: SIGN_IN_AF,
    hours: {
      dayNames: { mon: 'Maandag', tue: 'Dinsdag', wed: 'Woensdag', thu: 'Donderdag', fri: 'Vrydag', sat: 'Saterdag', sun: 'Sondag' },
      to: 'tot',
      closed: 'Gesluit',
      open: 'Oop',
      opens: 'Maak oop',
      closes: 'Sluit',
      lead: 'Veranderinge wys dadelik in die winkel.',
      errors: ERROR_MESSAGES.af,
    },
    specials: {
      titleLabel: 'Titel',
      titlePlaceholder: 'Naweek-braaipak',
      lineLabel: 'Een reël',
      endsLabel: 'Eindig op',
      optional: '(opsioneel)',
      add: 'Voeg aanbieding by',
      remove: 'Verwyder',
      showsUntilRemoved: 'Wys totdat dit verwyder word',
      ended: 'Verby, versteek in die winkel',
      empty: 'Nog geen aanbiedinge nie. Voeg een hierbo by en dit wys in die winkel.',
      endDate: { until: 'Tot', months: MONTHS_AF },
      errors: ERROR_MESSAGES.af,
    },
    view: { label: "Kies 'n aansig", site: 'Winkel', admin: 'Admin' },
    photo: { preparing: 'Maak die foto gereed…', none: 'Nog geen foto nie', previewAlt: 'Voorskou van die nuwe produk', take: 'Neem foto', choose: 'Kies foto', errors: ERROR_MESSAGES.af },
    frame: {
      title: 'Stofpad-admin',
      keptOnDevice: 'Alles wat jy byvoeg, bly op hierdie toestel. Ons sien dit nooit.',
      savesAsYouGo: 'Veranderinge word gestoor soos jy werk.',
      signOut: 'Meld af',
      demoNotice: DEMO_NOTICE,
      reset: { invite: "Probeer dit: voeg 'n produk by van jou foon af.", question: 'Begin oor met die voorbeeldprodukte?', resetDemo: 'Herstel demo', reset: 'Herstel', keep: 'Hou' },
    },
    admin: ADMIN_WORDS_BY_LANGUAGE.af,
    team: {
      setupTitle: 'Stel jou paneel op',
      setupOwner: 'Jy sal die eienaar wees:',
      setupNote: 'As eienaar besluit jy wie nog kan aanmeld, en jy kan eienaarskap aan iemand anders oorgee.',
      setUp: 'Stel my paneel op',
      ownerNote: 'Net jy, as eienaar, kan mense byvoeg of verwyder of eienaarskap oorgee.',
      adminNote: "Net die eienaar kan verander wie toegang het. Jy is nou 'n admin.",
      nameLabel: 'Voeg iemand by (voornaam)',
      namePlaceholder: 'Thandi',
      signsInAs: 'Hulle meld aan as',
      add: 'Voeg persoon by',
      owner: 'Eienaar',
      admin: 'Admin',
      makeOwner: 'Maak eienaar',
      handOverQuestion: 'Gee eienaarskap aan',
      handOver: 'Gee oor',
      keep: 'Hou',
      remove: 'Verwyder',
      errors: ERROR_MESSAGES.af,
    },
  },
}
