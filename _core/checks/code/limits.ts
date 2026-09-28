/*
 * limits.ts — the numbers the code-check enforces, from the architectural
 * laws in the coding standard (Waldo, 25 Sep 2026). Change them there and
 * here together.
 */

export const MAX_LOGIC_LINES = 25
export const MAX_NESTING_DEPTH = 3
export const SOURCE_EXTENSIONS = ['.ts', '.tsx']
// Component files (PascalCase .tsx, anywhere): data access here breaks separation of concerns.
export const UI_FILE_PATTERN = /(^|\/)[A-Z][^/]*\.tsx$/
export const DATA_ACCESS_GLOBALS = ['fetch', 'localStorage', 'sessionStorage', 'indexedDB']
