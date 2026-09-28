/*
 * error-codes.ts — every error code Copperkloof uses, in one list: the
 * shared core's codes plus its own, each with the plain words a visitor
 * sees. A code means one thing everywhere; logs carry the code only.
 * Messages stay within 80 characters (tests/error-codes.test.ts).
 */
import { CORE_ERROR_CODES, CORE_MESSAGES_EN } from '../../_core/result/core-errors.ts'

export const ERROR_CODES = {
  ...CORE_ERROR_CODES,
  JOB_INVALID: 'JOB_INVALID',
  JOBS_FULL: 'JOBS_FULL',
} as const

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  ...CORE_MESSAGES_EN,
  JOB_INVALID: 'Add a photo, a title and a suburb, then try again.',
  JOBS_FULL: 'The demo holds 12 jobs. Remove one to add another.',
}
