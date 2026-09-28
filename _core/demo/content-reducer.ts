/*
 * content-reducer.ts — the content every demo shares (opening hours,
 * specials, and who can sign in to the admin) and the changes to it, as a
 * pure reducer. A demo's own reducer
 * handles its own content and hands these actions here. Tested in
 * tests/content-reducer.test.ts.
 */
import { setDayOpen } from '../hours/opening-hours.ts'
import type { DayHours, Weekday } from '../hours/opening-hours.ts'
import { addSpecial, removeSpecial } from '../specials/specials.ts'
import type { Special } from '../specials/specials.ts'
import type { Member } from '../team/team.ts'

export interface SharedContent {
  hours: DayHours[]
  specials: Special[]
  // null until the first setup, which makes the person signing in the owner.
  team: Member[] | null
}

export type ContentAction =
  | { type: 'dayOpenSet'; day: Weekday; open: boolean }
  | { type: 'hoursSet'; hours: DayHours[] }
  | { type: 'specialAdded'; special: Special }
  | { type: 'specialRemoved'; id: string }
  | { type: 'teamSet'; team: Member[] }

export function contentReducer<Data extends SharedContent>(data: Data, action: ContentAction): Data {
  switch (action.type) {
    case 'dayOpenSet':
      return { ...data, hours: setDayOpen(data.hours, action.day, action.open) }
    case 'hoursSet':
      return { ...data, hours: action.hours }
    case 'specialAdded': {
      const added = addSpecial(data.specials, action.special)
      return added.ok ? { ...data, specials: added.value } : data
    }
    case 'specialRemoved':
      return { ...data, specials: removeSpecial(data.specials, action.id) }
    case 'teamSet':
      return { ...data, team: action.team }
  }
}

const CONTENT_ACTION_TYPES = new Set(['dayOpenSet', 'hoursSet', 'specialAdded', 'specialRemoved', 'teamSet'])

export function isContentAction(action: { type: string }): action is ContentAction {
  return CONTENT_ACTION_TYPES.has(action.type)
}
