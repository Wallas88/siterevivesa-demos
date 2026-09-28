/*
 * css-scan.ts — reads built CSS as text and finds padding, margin and gap
 * values that are not on the spacing scale. Pure: text in, list out. Values
 * it cannot judge statically (calc, clamp, var, %, em, auto) are skipped.
 */

export interface OffScaleValue {
  selector: string
  property: string
  value: string
}

const SPACING_PROPERTY = /^(padding|margin)(-(top|right|bottom|left|block|inline|block-start|block-end|inline-start|inline-end))?$|^(row-|column-)?gap$/
const RULE = /([^{}]+)\{([^{}]*)\}/g
const PX_OR_REM = /^(-?\d*\.?\d+)(px|rem)$/

// A single length token in px, or null when it can't be judged statically.
export function lengthInPx(token: string, rootFontPx: number): number | null {
  const match = PX_OR_REM.exec(token)
  if (match == null) return null
  const amount = Number(match[1])
  return match[2] === 'rem' ? amount * rootFontPx : amount
}

function isSpacingValue(property: string, value: string): boolean {
  return SPACING_PROPERTY.test(property) && !value.includes('(')
}

// True when any plain px/rem token in the value is off the scale.
function hasOffScaleToken(value: string, scale: Set<number>, rootFontPx: number): boolean {
  return value.split(/\s+/).some(isOffScale)

  function isOffScale(token: string): boolean {
    const px = lengthInPx(token, rootFontPx)
    return px != null && !scale.has(Math.round(Math.abs(px) * 2) / 2)
  }
}

function declarationsOf(block: string): { property: string; value: string }[] {
  return block.split(';').filter(hasColon).map(toDeclaration)

  function hasColon(text: string): boolean {
    return text.includes(':')
  }

  function toDeclaration(text: string): { property: string; value: string } {
    const colon = text.indexOf(':')
    return {
      property: text.slice(0, colon).trim(),
      value: text
        .slice(colon + 1)
        .replace('!important', '')
        .trim(),
    }
  }
}

export function findOffScaleSpacing(css: string, scalePx: number[], rootFontPx: number): OffScaleValue[] {
  const scale = new Set(scalePx)
  const found: OffScaleValue[] = []
  for (const rule of css.matchAll(RULE)) {
    const selector = (rule[1] ?? '').trim()
    for (const { property, value } of declarationsOf(rule[2] ?? '')) {
      if (isSpacingValue(property, value) && hasOffScaleToken(value, scale, rootFontPx)) found.push({ selector, property, value })
    }
  }
  return found
}
