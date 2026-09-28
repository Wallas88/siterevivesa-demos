/*
 * business.ts — the fictional business this demo shows: its name, areas,
 * services and words. Every fact here is invented (name web-searched
 * 28 Sep 2026: no South African business uses it). For a lead's version,
 * this file, seed.ts and the tokens in styles/tokens.css are what change.
 */

export interface Service {
  // Matches a price in the price list, so the site shows that service's example price.
  priceId: string
  name: string
  summary: string
}

// A reserved .example address (RFC 2606): visitors never type their own email, and nothing is sent.
export const DEMO_OWNER_EMAIL = 'owner@copperkloof.example'
export const DEMO_OWNER_NAME = 'Owner'
// People added to the panel sign in on this reserved domain; never a real address.
export const TEAM_DOMAIN = 'copperkloof.example'

// Waldo's transparency line (legal), shown with the admin.
export const KEPT_ON_DEVICE = 'Everything you add stays on this device. We never see it.'

// The mock sign-in is kept for this browser tab only, under this key.
export const SIGNED_IN_KEY = 'copperkloof-demo-signed-in'

// Shown for a visitor's photo the browser no longer has.
export const MISSING_PHOTO_SRC = '/images/jobs/missing.svg'

export const DEMO_NOTICE = 'Demo website by SiteReviveSA. Branding, imagery and service details are illustrative.'

export const BUSINESS = {
  name: 'Copperkloof Plumbing',
  shortName: 'Copperkloof',
  heroTitle: 'Leaks, geysers and blocked drains, sorted the same day.',
  heroLead: 'A small plumbing team for homes in Klepvallei, Kranebos and Waaierbos. See our latest jobs below, straight from the van.',
  areasNote: 'Fictional demo areas.',
}

// Invented suburb names, web-searched 28 Sep 2026: none is a real South African place.
export const AREAS = ['Klepvallei', 'Kranebos', 'Waaierbos', 'Copperkloof Central']

export const SERVICES: Service[] = [
  { priceId: 'callout', name: 'Call-outs and leaks', summary: 'Dripping taps, burst pipes and leaks behind walls, found and fixed.' },
  { priceId: 'geyser', name: 'Geysers', summary: 'Geyser repairs, element and thermostat swaps, and full replacements.' },
  { priceId: 'drain', name: 'Blocked drains', summary: 'Kitchen, bathroom and outside drains cleared and checked.' },
  { priceId: 'bathroom', name: 'Bathroom fittings', summary: 'New taps, toilets, basins and showers fitted neatly.' },
]
