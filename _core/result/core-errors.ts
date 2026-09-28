/*
 * core-errors.ts — the error codes the shared core can return, each with
 * its plain words in English and Afrikaans. A demo's own error list starts
 * from these and adds its own codes; a code means one thing everywhere.
 * Messages stay within 80 characters so each fits the two lines kept for
 * it on a 360px phone (tests/core-errors.test.ts).
 */

export const CORE_ERROR_CODES = {
  STORAGE_BLOCKED: 'STORAGE_BLOCKED',
  STORAGE_FULL: 'STORAGE_FULL',
  STORAGE_FAILED: 'STORAGE_FAILED',
  SAVED_DATA_INVALID: 'SAVED_DATA_INVALID',
  PHOTO_MISSING: 'PHOTO_MISSING',
  PHOTO_NOT_IMAGE: 'PHOTO_NOT_IMAGE',
  PHOTO_TOO_LARGE: 'PHOTO_TOO_LARGE',
  PHOTO_UNREADABLE: 'PHOTO_UNREADABLE',
  CODE_INCOMPLETE: 'CODE_INCOMPLETE',
  CODE_WRONG: 'CODE_WRONG',
  SIGN_IN_NOT_KEPT: 'SIGN_IN_NOT_KEPT',
  HOURS_INVALID: 'HOURS_INVALID',
  SPECIAL_INVALID: 'SPECIAL_INVALID',
  SPECIAL_ENDED: 'SPECIAL_ENDED',
  SPECIALS_FULL: 'SPECIALS_FULL',
  PRICE_INVALID: 'PRICE_INVALID',
  TEAM_NAME_INVALID: 'TEAM_NAME_INVALID',
  TEAM_MEMBER_EXISTS: 'TEAM_MEMBER_EXISTS',
  TEAM_FULL: 'TEAM_FULL',
  TEAM_OWNER_KEPT: 'TEAM_OWNER_KEPT',
  TEAM_TRANSFER_INVALID: 'TEAM_TRANSFER_INVALID',
  TEAM_NOT_OWNER: 'TEAM_NOT_OWNER',
} as const

export type CoreErrorCode = (typeof CORE_ERROR_CODES)[keyof typeof CORE_ERROR_CODES]

export type CoreMessages = Record<CoreErrorCode, string>

export const CORE_MESSAGES_EN: CoreMessages = {
  STORAGE_BLOCKED: "This browser won't let the page save, so changes last until you close the tab.",
  STORAGE_FULL: 'No room left in this browser for photos. Remove something or reset, then retry.',
  STORAGE_FAILED: 'That change could not be saved here, so it may be gone after a reload.',
  SAVED_DATA_INVALID: 'Your earlier changes could not be read, so the demo started fresh.',
  PHOTO_MISSING: 'A photo could not be found in this browser, so a placeholder shows.',
  PHOTO_NOT_IMAGE: 'That file is not a photo. Choose a JPEG, PNG or similar image.',
  PHOTO_TOO_LARGE: 'That photo is too big to use. Choose one under 25 MB.',
  PHOTO_UNREADABLE: 'That photo could not be opened. Try another, or take a new one.',
  CODE_INCOMPLETE: 'Type all 6 digits of the code.',
  CODE_WRONG: "That code doesn't match. Check the demo box and try again.",
  SIGN_IN_NOT_KEPT: "This browser won't keep you signed in, so a reload asks for a code.",
  HOURS_INVALID: 'Closing time must be after opening time, like 07:00 to 17:00.',
  SPECIAL_INVALID: 'Add a title of up to 50 characters and a line of up to 100.',
  SPECIAL_ENDED: 'That end date has passed, so the special would not show.',
  SPECIALS_FULL: 'The demo holds 6 specials. Remove one to add another.',
  PRICE_INVALID: 'Type a price in rand, like 650.',
  TEAM_NAME_INVALID: 'Type a first name of 2 to 20 letters, like Thandi.',
  TEAM_MEMBER_EXISTS: 'That person can already sign in.',
  TEAM_FULL: 'The demo holds 5 people. Remove one to add another.',
  TEAM_OWNER_KEPT: "The owner can't be removed. Hand ownership over first.",
  TEAM_TRANSFER_INVALID: 'Choose someone already on the list to become owner.',
  TEAM_NOT_OWNER: 'Only the owner can change who has access.',
}

export const CORE_MESSAGES_AF: CoreMessages = {
  STORAGE_BLOCKED: 'Dié blaaier laat nie stoor toe nie; veranderinge hou tot jy die oortjie sluit.',
  STORAGE_FULL: 'Geen plek meer vir fotos nie. Verwyder iets of begin oor, en probeer weer.',
  STORAGE_FAILED: 'Die verandering kon nie hier gestoor word nie; dit kan na herlaai weg wees.',
  SAVED_DATA_INVALID: 'Jou vorige veranderinge kon nie gelees word nie; die demo begin oor.',
  PHOTO_MISSING: "'n Foto is nie in hierdie blaaier gevind nie; 'n plekhouer wys.",
  PHOTO_NOT_IMAGE: "Dié lêer is nie 'n foto nie. Kies 'n JPEG, PNG of soortgelyke prent.",
  PHOTO_TOO_LARGE: 'Die foto is te groot. Kies een kleiner as 25 MB.',
  PHOTO_UNREADABLE: "Die foto kon nie oopgemaak word nie. Probeer 'n ander een.",
  CODE_INCOMPLETE: 'Tik al 6 syfers van die kode.',
  CODE_WRONG: 'Die kode pas nie. Kyk na die demoblokkie en probeer weer.',
  SIGN_IN_NOT_KEPT: 'Hierdie blaaier hou jou nie aangemeld nie; herlaai vra weer vir die kode.',
  HOURS_INVALID: 'Sluitingstyd moet na openingstyd wees, soos 07:00 tot 17:00.',
  SPECIAL_INVALID: "Gee 'n titel van tot 50 karakters en 'n reël van tot 100.",
  SPECIAL_ENDED: 'Die einddatum is verby, so die aanbieding sal nie wys nie.',
  SPECIALS_FULL: 'Die demo hou 6 aanbiedinge. Verwyder een om nog een by te voeg.',
  PRICE_INVALID: "Tik 'n prys in rand, soos 650.",
  TEAM_NAME_INVALID: "Tik 'n voornaam van 2 tot 20 letters, soos Thandi.",
  TEAM_MEMBER_EXISTS: 'Dié persoon kan reeds aanmeld.',
  TEAM_FULL: 'Die demo hou 5 mense. Verwyder een om nog een by te voeg.',
  TEAM_OWNER_KEPT: 'Die eienaar kan nie verwyder word nie. Gee eers eienaarskap oor.',
  TEAM_TRANSFER_INVALID: 'Kies iemand op die lys om eienaar te word.',
  TEAM_NOT_OWNER: 'Net die eienaar kan verander wie toegang het.',
}
