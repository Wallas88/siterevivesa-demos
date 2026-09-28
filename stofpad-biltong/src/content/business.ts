/*
 * business.ts — Stofpad's fixed facts for the demo: the notice every demo
 * carries word for word, the mock sign-in's demo address and tab key, and
 * the placeholder for a photo the browser no longer has. Every business
 * detail is fictional.
 */

export const DEMO_NOTICE = 'Demo website by SiteReviveSA. Branding, imagery and service details are illustrative.'

// A reserved .example address (RFC 2606): visitors never type their own email, and nothing is sent.
export const DEMO_OWNER_EMAIL = 'owner@stofpad.example'
export const DEMO_OWNER_NAME = 'Owner'
// People added to the panel sign in on this reserved domain; never a real address.
export const TEAM_DOMAIN = 'stofpad.example'

// The mock sign-in is kept for this browser tab only, under this key.
export const SIGNED_IN_KEY = 'stofpad-demo-signed-in'

// Shown for a visitor's photo the browser no longer has (a drawn placeholder that ships with the site).
export const MISSING_PHOTO_SRC = '/images/missing.svg'
