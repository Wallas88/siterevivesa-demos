/*
 * PhotoPicker.tsx — the photo for a new item: "Take photo" opens the phone
 * camera (capture="environment"), "Choose photo" opens the files or
 * gallery. The preview keeps a fixed 4:3 space whether empty, busy, filled
 * or showing why a photo can't be used, so picking a photo moves nothing.
 */
import type { ChangeEvent } from 'react'
import type { CoreErrorCode } from '../result/core-errors.ts'
import type { PhotoPick } from './use-photo-pick.ts'

export interface PhotoWords {
  preparing: string
  none: string
  previewAlt: string
  take: string
  choose: string
  errors: Record<CoreErrorCode, string>
}

interface PhotoPickerProps {
  pick: PhotoPick
  disabled: boolean
  words: PhotoWords
}

function previewText(pick: PhotoPick, words: PhotoWords): string {
  if (pick.busy) return words.preparing
  return pick.error == null ? words.none : words.errors[pick.error]
}

const PREVIEW_WIDTH = 400
const PREVIEW_HEIGHT = 300

export function PhotoPicker({ pick, disabled, words }: PhotoPickerProps) {
  function pickFile(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0] ?? null
    event.target.value = ''
    void pick.pick(file)
  }

  return (
    <div className="photo-picker">
      <div className="photo-preview">
        {pick.previewUrl != null ? (
          <img className="photo-preview-image" key={pick.previewUrl} src={pick.previewUrl} alt={words.previewAlt} width={PREVIEW_WIDTH} height={PREVIEW_HEIGHT} />
        ) : (
          <p className={pick.error != null ? 'photo-preview-empty photo-preview-error' : 'photo-preview-empty'} role="status">
            {previewText(pick, words)}
          </p>
        )}
      </div>
      <div className="photo-picker-buttons">
        <label className="button button-secondary photo-pick-button">
          <input className="photo-pick-input" type="file" accept="image/*" capture="environment" onChange={pickFile} disabled={disabled} name="camera-photo" />
          {words.take}
        </label>
        <label className="button button-secondary photo-pick-button">
          <input className="photo-pick-input" type="file" accept="image/*" onChange={pickFile} disabled={disabled} name="file-photo" />
          {words.choose}
        </label>
      </div>
    </div>
  )
}
