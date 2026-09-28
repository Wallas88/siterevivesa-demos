/*
 * resize-photo.ts — shrinks a picked phone photo in the browser: decode it
 * (turned the right way up), draw it on a canvas at the size photo-size.ts
 * works out, and save it as a JPEG Blob. Nothing is uploaded; the photo
 * never leaves the visitor's device.
 */
import { CORE_ERROR_CODES } from '../result/core-errors.ts'
import type { CoreErrorCode } from '../result/core-errors.ts'
import { logIssue } from '../result/log-issue.ts'
import { succeed, fail } from '../result/result.ts'
import type { Result } from '../result/result.ts'
import { checkPickedFile, fitWithin, JPEG_QUALITY, MAX_PHOTO_SIDE_PX } from './photo-size.ts'

const JPEG_TYPE = 'image/jpeg'

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise<Blob | null>(encode)

  function encode(resolveBlob: (blob: Blob | null) => void): void {
    canvas.toBlob(resolveBlob, JPEG_TYPE, JPEG_QUALITY)
  }
}

async function drawSmaller(bitmap: ImageBitmap): Promise<Blob | null> {
  const size = fitWithin({ width: bitmap.width, height: bitmap.height }, MAX_PHOTO_SIDE_PX)
  const canvas = document.createElement('canvas')
  canvas.width = size.width
  canvas.height = size.height
  const paint = canvas.getContext('2d')
  if (paint == null) return null
  paint.drawImage(bitmap, 0, 0, size.width, size.height)
  return canvasBlob(canvas)
}

// The browser could not decode the file (a broken or unsupported image).
const UNREADABLE = null

async function decodeAndShrink(file: File): Promise<Blob | null> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const blob = await drawSmaller(bitmap)
    bitmap.close()
    return blob
  } catch {
    return UNREADABLE
  }
}

// A JPEG no bigger than MAX_PHOTO_SIDE_PX on its longest side, or a code saying why not.
export async function resizePhoto(file: File): Promise<Result<Blob, CoreErrorCode>> {
  const checked = checkPickedFile(file)
  if (!checked.ok) return checked
  const blob = await decodeAndShrink(file)
  if (blob != null) return succeed(blob)
  logIssue(CORE_ERROR_CODES.PHOTO_UNREADABLE)
  return fail(CORE_ERROR_CODES.PHOTO_UNREADABLE)
}
