/*
 * seed.ts — what every visitor starts with, and what "Reset demo" brings
 * back: four made-up jobs with drawn placeholder pictures (public/images/
 * jobs/, no photos of real people or places), an example price list,
 * example opening hours and two made-up specials.
 */
import type { Job } from '../features/jobs/jobs.ts'
import type { DayHours } from '../../../_core/hours/opening-hours.ts'
import type { Special } from '../../../_core/specials/specials.ts'
import type { PriceItem } from '../features/prices/price-list.ts'

export const SEED_JOBS: Job[] = [
  {
    id: 'seed-geyser',
    title: 'New 150 L geyser',
    caption: 'Old geyser out, new one in with a drip tray and vacuum breakers. Hot water by lunch.',
    suburb: 'Kranebos',
    photo: { kind: 'seed', src: '/images/jobs/geyser.svg' },
    featured: true,
  },
  {
    id: 'seed-drain',
    title: 'Blocked kitchen drain',
    caption: 'Grease blockage cleared and the outside gully flushed.',
    suburb: 'Klepvallei',
    photo: { kind: 'seed', src: '/images/jobs/drain.svg' },
    featured: false,
  },
  {
    id: 'seed-basin',
    title: 'Bathroom basin and mixer',
    caption: 'Cracked basin replaced, new mixer tap and waste fitted.',
    suburb: 'Waaierbos',
    photo: { kind: 'seed', src: '/images/jobs/basin.svg' },
    featured: false,
  },
  {
    id: 'seed-pipe',
    title: 'Burst pipe in the garden',
    caption: 'Leak found under the paving, pipe section replaced and pressure tested.',
    suburb: 'Copperkloof Central',
    photo: { kind: 'seed', src: '/images/jobs/pipe.svg' },
    featured: false,
  },
]

// Example prices only; the site says so beside them.
export const SEED_PRICES: PriceItem[] = [
  { id: 'callout', label: 'Call-out, first 30 minutes', cents: 65_000 },
  { id: 'geyser', label: 'Geyser element swap', cents: 145_000 },
  { id: 'drain', label: 'Drain unblocking', cents: 95_000 },
  { id: 'bathroom', label: 'Tap or mixer fitted', cents: 75_000 },
]

// Example hours only; the site says so beside them.
export const SEED_HOURS: DayHours[] = [
  { day: 'mon', open: true, opens: '07:00', closes: '17:00' },
  { day: 'tue', open: true, opens: '07:00', closes: '17:00' },
  { day: 'wed', open: true, opens: '07:00', closes: '17:00' },
  { day: 'thu', open: true, opens: '07:00', closes: '17:00' },
  { day: 'fri', open: true, opens: '07:00', closes: '17:00' },
  { day: 'sat', open: true, opens: '08:00', closes: '13:00' },
  { day: 'sun', open: false, opens: '08:00', closes: '13:00' },
]

// Made-up offers with no end date, so the seed never expires on its own.
export const SEED_SPECIALS: Special[] = [
  { id: 'seed-geyser-check', title: 'Free geyser check', line: 'With any call-out this month. Example special.', endsOn: null },
  { id: 'seed-water-talk', title: 'Water-saving evening', line: 'Tips on leaks and low-flow fittings at the Klepvallei hall. Example event.', endsOn: null },
]
