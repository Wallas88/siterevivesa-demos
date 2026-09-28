/*
 * core-errors.test.ts — every core error code has plain words in English
 * and Afrikaans, each fits the two lines kept for it on a 360px phone, and
 * the words that name a limit name the same number the code enforces.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { CORE_ERROR_CODES, CORE_MESSAGES_EN, CORE_MESSAGES_AF } from '../result/core-errors.ts'
import { MAX_PICKED_MB } from '../photos/photo-size.ts'
import { MAX_SPECIALS, MAX_SPECIAL_TITLE_LENGTH, MAX_SPECIAL_LINE_LENGTH } from '../specials/specials.ts'

// About two lines of 15–16px text in a 328px admin column.
const MAX_MESSAGE_LENGTH = 80

test('every code has English and Afrikaans words of at most 80 characters', function messagesFit() {
  for (const code of Object.values(CORE_ERROR_CODES)) {
    for (const message of [CORE_MESSAGES_EN[code], CORE_MESSAGES_AF[code]]) {
      assert.ok(message.trim() !== '', `${code} has words`)
      assert.ok(message.length <= MAX_MESSAGE_LENGTH, `${code} is ${message.length} characters: ${message}`)
    }
  }
})

test('messages that name a limit name the enforced number, in both languages', function limitsMatch() {
  for (const messages of [CORE_MESSAGES_EN, CORE_MESSAGES_AF]) {
    assert.match(messages.PHOTO_TOO_LARGE, new RegExp(`\\b${MAX_PICKED_MB} MB`))
    assert.match(messages.SPECIALS_FULL, new RegExp(`\\b${MAX_SPECIALS}\\b`))
    assert.match(messages.SPECIAL_INVALID, new RegExp(`\\b${MAX_SPECIAL_TITLE_LENGTH}\\b.*\\b${MAX_SPECIAL_LINE_LENGTH}\\b`))
  }
})
