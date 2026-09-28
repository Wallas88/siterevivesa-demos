/*
 * saved-demo.ts — the shape of what Copperkloof keeps in a visitor's
 * browser, the check that turns whatever was read back into that shape,
 * and the setup the shared store is opened with. Saved data is untrusted
 * (an older version, a half-written save), so anything that doesn't fit is
 * dropped rather than shown. Pure; tested in tests/saved-demo.test.ts.
 */
import type { Job } from '../jobs/jobs.ts'
import { MAX_JOBS, storedPhotoIds } from '../jobs/jobs.ts'
import type { PriceItem } from '../prices/price-list.ts'
import type { DayHours } from '../../../../_core/hours/opening-hours.ts'
import type { Special } from '../../../../_core/specials/specials.ts'
import type { Member } from '../../../../_core/team/team.ts'
import type { DemoSetup } from '../../../../_core/demo/load-demo.ts'
import { isFields, isText, openSavedEnvelope, readList } from '../../../../_core/storage/saved-envelope.ts'
import { readSavedHours, readSavedPhoto, readSavedSpecials, readSavedTeam } from '../../../../_core/storage/read-saved-content.ts'

export interface DemoData {
  jobs: Job[]
  prices: PriceItem[]
  hours: DayHours[]
  specials: Special[]
  // null until the panel's first setup.
  team: Member[] | null
}

// Bump when DemoData changes shape; an older save then starts fresh (2: hours and specials added).
export const SAVED_VERSION = 3
export const DATABASE_NAME = 'copperkloof-demo'

function readJob(value: unknown): Job | null {
  if (!isFields(value)) return null
  const photo = readSavedPhoto(value.photo)
  if (photo == null || !isText(value.id) || !isText(value.title) || !isText(value.caption) || !isText(value.suburb)) return null
  return { id: value.id, title: value.title, caption: value.caption, suburb: value.suburb, photo, featured: value.featured === true }
}

function readPrice(value: unknown): PriceItem | null {
  if (!isFields(value) || !isText(value.id) || !isText(value.label)) return null
  if (typeof value.cents !== 'number' || !Number.isInteger(value.cents) || value.cents < 0) return null
  return { id: value.id, label: value.label, cents: value.cents }
}

// The saved data in its own shape, or null when it is from another version or doesn't fit.
export function readSavedDemo(saved: unknown): DemoData | null {
  const data = openSavedEnvelope(saved, SAVED_VERSION)
  if (data == null) return null
  const jobs = readList(data.jobs, readJob)
  const prices = readList(data.prices, readPrice)
  const hours = readSavedHours(data.hours)
  const specials = readSavedSpecials(data.specials)
  const team = readSavedTeam(data.team)
  if (jobs == null || prices == null || hours == null || specials == null || team === undefined || jobs.length > MAX_JOBS) return null
  return { jobs, prices, hours, specials, team }
}

function photoIdsOf(data: DemoData): string[] {
  return storedPhotoIds(data.jobs)
}

export const DEMO_SETUP: DemoSetup<DemoData> = { databaseName: DATABASE_NAME, version: SAVED_VERSION, readSaved: readSavedDemo, photoIdsOf }
