/*
 * error-codes.test.ts — every Stofpad error code has plain words in
 * English and Afrikaans, each within the two lines kept for it on a 360px
 * phone.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { ERROR_CODES, ERROR_MESSAGES } from '../shared/error-codes.ts'

const MAX_MESSAGE_LENGTH = 80

test('every code has words of at most 80 characters in both languages', function messagesFit() {
  for (const code of Object.values(ERROR_CODES)) {
    for (const language of ['en', 'af'] as const) {
      const message = ERROR_MESSAGES[language][code]
      assert.ok(message.trim() !== '', `${code} (${language}) has words`)
      assert.ok(message.length <= MAX_MESSAGE_LENGTH, `${code} (${language}) is ${message.length} characters`)
    }
  }
})
