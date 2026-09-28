/*
 * error-codes.test.ts — every error code has a plain message, and each
 * message fits the two lines kept for it on a 360px phone.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { ERROR_CODES, ERROR_MESSAGES } from '../shared/error-codes.ts'

// About two lines of 15–16px text in the admin's 328px width.
const MAX_MESSAGE_LENGTH = 80

test('every code has a message of at most 80 characters', function messagesFit() {
  for (const code of Object.values(ERROR_CODES)) {
    const message = ERROR_MESSAGES[code]
    assert.ok(message.trim() !== '', `${code} has a message`)
    assert.ok(message.length <= MAX_MESSAGE_LENGTH, `${code} is ${message.length} characters`)
  }
})
