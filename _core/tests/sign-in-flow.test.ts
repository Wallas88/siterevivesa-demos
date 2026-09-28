/*
 * sign-in-flow.test.ts — the mock sign-in's rules with made-up codes:
 * making and showing a code, reading what was typed, wrong and right tries,
 * a new code starting clean, and a fresh code on every send.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { codeFromNumber, formatCode, readTypedCode, codeSent, tryCode, START, CODE_RANGE } from '../sign-in/sign-in-flow.ts'
import type { SignInState } from '../sign-in/sign-in-flow.ts'
import { makeCode } from '../sign-in/make-code.ts'
import { keepSignedIn, readSignedIn } from '../sign-in/sign-in-session.ts'

const TEST_KEY = 'test-demo-signed-in'

test('a number becomes a 6-digit code, leading zeros kept', function makesCode() {
  assert.equal(codeFromNumber(482913), '482913')
  assert.equal(codeFromNumber(7341), '007341')
  assert.equal(codeFromNumber(CODE_RANGE + 5), '000005')
})

test('a code shows in two groups of three', function showsCode() {
  assert.equal(formatCode('482913'), '482 913')
})

test('typed spaces and dashes are ignored, short or lettered codes are refused', function readsTyped() {
  assert.deepEqual(readTypedCode(' 482 913 '), { ok: true, value: '482913' })
  assert.deepEqual(readTypedCode('482-913'), { ok: true, value: '482913' })
  assert.equal(readTypedCode('48291').ok, false)
  assert.equal(readTypedCode('48291a').ok, false)
})

test('the right code signs in and starts the flow over', function rightCode() {
  const attempt = tryCode(codeSent('482913'), '482 913')
  assert.equal(attempt.signedIn, true)
  assert.deepEqual(attempt.state, START)
})

test('a wrong code keeps the same code, counts the try and says why', function wrongCode() {
  const attempt = tryCode(codeSent('482913'), '111111')
  assert.equal(attempt.signedIn, false)
  assert.deepEqual(attempt.state, { step: 'code', code: '482913', wrongTries: 1, error: 'CODE_WRONG' })
})

test('after a wrong try the right code still works', function retryWorks() {
  const wrong = tryCode(codeSent('482913'), '111111').state
  assert.equal(tryCode(wrong, '482913').signedIn, true)
})

test('an incomplete code is not counted as a wrong try', function incomplete() {
  const attempt = tryCode(codeSent('482913'), '123')
  assert.equal(attempt.state.step === 'code' ? attempt.state.wrongTries : -1, 0)
  assert.equal(attempt.state.step === 'code' ? attempt.state.error : null, 'CODE_INCOMPLETE')
})

test('a new code clears the error and the wrong tries', function newCodeClean() {
  const wrong: SignInState = { step: 'code', code: '482913', wrongTries: 3, error: 'CODE_WRONG' }
  assert.deepEqual(codeSent('555000'), { step: 'code', code: '555000', wrongTries: 0, error: null })
  assert.notDeepEqual(codeSent('555000'), wrong)
})

test('a code typed before one was sent does nothing', function noCodeYet() {
  assert.deepEqual(tryCode(START, '482913'), { state: START, signedIn: false })
})

test('each send makes a 6-digit code, and they are not all the same', function freshCodes() {
  const codes = new Set(Array.from({ length: 20 }, makeCode))
  for (const code of codes) assert.match(code, /^\d{6}$/)
  assert.ok(codes.size > 1)
})

test('without sessionStorage (as in Node) signing in is kept in memory and says so', function memoryFallback() {
  const kept = keepSignedIn(TEST_KEY, true)
  assert.equal(kept.ok ? 'OK' : kept.code, 'SIGN_IN_NOT_KEPT')
  assert.equal(readSignedIn(TEST_KEY), true)
  assert.equal(readSignedIn('another-demo'), false)
  keepSignedIn(TEST_KEY, false)
  assert.equal(readSignedIn(TEST_KEY), false)
})
