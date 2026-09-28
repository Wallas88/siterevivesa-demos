/*
 * thresholds.ts — the numbers from the UX principles that the
 * ux-check enforces, in one place. Change a number here and in the
 * principles file together (Waldo, 25 Sep 2026).
 */

export const PHONE_VIEWPORT = { width: 360, height: 780 }
export const DESKTOP_VIEWPORT = { width: 1440, height: 900 }

// 1. One page, one job. (Selectors come from each demo's UxSetup.)
export const MAX_PRIMARY_PER_SCREEN = 1

// 2. Hierarchy by stepping back.
export const MAX_SIZES_PER_SECTION = 3
export const MAX_WEIGHTS_PER_SECTION = 3
export const MAX_TEXT_COLOURS_PER_SECTION = 2

// 3. Space from a scale.
export const SPACING_SCALE_PX = [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128]
export const ROOT_FONT_PX = 16

// 4. Contrast in every palette (WCAG 2 AA).
export const MIN_CONTRAST = 4.5
export const MIN_CONTRAST_LARGE = 3
export const LARGE_TEXT_PX = 24
export const LARGE_BOLD_TEXT_PX = 18.66
export const BOLD_WEIGHT = 700

// 5. Easy to hit, easy to see.
export const MIN_HIT_PX = 44
export const MAX_TAB_STOPS = 250

// 6. Motion explains; repetition is noise.
export const MAX_REPEATED_MOTION_MS = 250

// 7. Mid-range phone, prepaid data.
export const MAX_JS_GZIP_KB = 110
export const MAX_LAYOUT_SHIFT = 0.1
