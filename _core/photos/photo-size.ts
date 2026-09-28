/*
 * photo-size.ts — the maths and checks behind shrinking a phone photo
 * before it is kept in the browser: which files are accepted, and the size
 * a photo is drawn at so its longest side fits. Pure; tested in
 * tests/photo-size.test.ts. resize-photo.ts does the drawing.
 */
import { CORE_ERROR_CODES } from '../result/core-errors.ts'
import type { CoreErrorCode } from '../result/core-errors.ts'
import { succeed, fail } from '../result/result.ts'
import type { Result } from '../result/result.ts'

export interface PixelSize {
  width: number
  height: number
}

export interface PickedFile {
  type: string
  size: number
}

// Longest side of a kept photo: sharp on a phone and a laptop, a few hundred KB as JPEG.
export const MAX_PHOTO_SIDE_PX = 1200
export const JPEG_QUALITY = 0.82
const BYTES_PER_MB = 1024 * 1024
export const MAX_PICKED_MB = 25
export const MAX_PICKED_BYTES = MAX_PICKED_MB * BYTES_PER_MB

// Only images, and nothing so large that decoding it would stall a mid-range phone.
export function checkPickedFile(file: PickedFile): Result<PickedFile, CoreErrorCode> {
  if (!file.type.startsWith('image/')) return fail(CORE_ERROR_CODES.PHOTO_NOT_IMAGE)
  if (file.size > MAX_PICKED_BYTES) return fail(CORE_ERROR_CODES.PHOTO_TOO_LARGE)
  return succeed(file)
}

// Scaled down so the longest side fits, never scaled up, never below one pixel.
export function fitWithin(size: PixelSize, maxSide: number): PixelSize {
  const longest = Math.max(size.width, size.height)
  if (longest <= maxSide) return { width: size.width, height: size.height }
  const scale = maxSide / longest
  return { width: Math.max(1, Math.round(size.width * scale)), height: Math.max(1, Math.round(size.height * scale)) }
}
