/*
 * read-saved-content.ts — readers for the saved content both demos keep:
 * a photo reference, a week of opening hours, a list of specials and who
 * can sign in. Each
 * returns the content in its own shape, or null when anything doesn't fit
 * (saved data is untrusted). Tested in tests/read-saved-content.test.ts.
 */
import { isFields, isText, readList } from './saved-envelope.ts'
import type { ContentPhoto } from '../photos/photo-urls.ts'
import { isFullWeek, isWeekday } from '../hours/opening-hours.ts'
import type { DayHours } from '../hours/opening-hours.ts'
import { isIsoDate, MAX_SPECIALS } from '../specials/specials.ts'
import type { Special, SpecialText } from '../specials/specials.ts'
import { MAX_MEMBERS } from '../team/team.ts'
import type { Member } from '../team/team.ts'

export function readSavedPhoto(value: unknown): ContentPhoto | null {
  if (!isFields(value)) return null
  if (value.kind === 'seed' && isText(value.src)) return { kind: 'seed', src: value.src }
  if (value.kind === 'stored' && isText(value.photoId)) return { kind: 'stored', photoId: value.photoId }
  return null
}

function readDay(value: unknown): DayHours | null {
  if (!isFields(value) || !isText(value.day) || !isWeekday(value.day) || !isText(value.opens) || !isText(value.closes)) return null
  // The order and the times are checked as a whole week in readSavedHours.
  return { day: value.day, open: value.open === true, opens: value.opens, closes: value.closes }
}

// Exactly one sound row per weekday, in order.
export function readSavedHours(value: unknown): DayHours[] | null {
  const hours = readList(value, readDay)
  return hours != null && isFullWeek(hours) ? hours : null
}

function readText(value: unknown): SpecialText | null {
  return isFields(value) && isText(value.title) && isText(value.line) ? { title: value.title, line: value.line } : null
}

function readTranslations(value: unknown): Special['translations'] | null {
  if (value == null) return undefined
  if (!isFields(value)) return null
  const read: Record<string, SpecialText> = {}
  for (const [language, text] of Object.entries(value)) {
    const words = readText(text)
    if (words == null) return null
    read[language] = words
  }
  return read
}

function readSpecial(value: unknown): Special | null {
  const text = readText(value)
  if (!isFields(value) || text == null || !isText(value.id)) return null
  const endsOn = value.endsOn === null ? null : isText(value.endsOn) && isIsoDate(value.endsOn) ? value.endsOn : undefined
  const translations = readTranslations(value.translations)
  if (endsOn === undefined || translations === null) return null
  return translations == null ? { id: value.id, ...text, endsOn } : { id: value.id, ...text, endsOn, translations }
}

export function readSavedSpecials(value: unknown): Special[] | null {
  const specials = readList(value, readSpecial)
  return specials != null && specials.length <= MAX_SPECIALS ? specials : null
}

function readMember(value: unknown): Member | null {
  if (!isFields(value) || !isText(value.email) || !isText(value.name)) return null
  return value.role === 'owner' || value.role === 'admin' ? { email: value.email, name: value.name, role: value.role } : null
}

function isOwner(member: Member): boolean {
  return member.role === 'owner'
}

// null before the first setup; otherwise a list with exactly one owner, within the limit. Undefined: unreadable.
export function readSavedTeam(value: unknown): Member[] | null | undefined {
  if (value === null) return null
  const team = readList(value, readMember)
  if (team == null || team.length > MAX_MEMBERS || team.filter(isOwner).length !== 1) return undefined
  return team
}
