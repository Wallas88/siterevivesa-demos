/*
 * team-words.ts — every word the panel's first setup and its people list
 * show, so a demo passes them in its visitor's language.
 */
import type { CoreErrorCode } from '../result/core-errors.ts'

export interface TeamWords {
  setupTitle: string
  // "You'll be the owner:" — the signed-in address goes after it.
  setupOwner: string
  setupNote: string
  setUp: string
  ownerNote: string
  adminNote: string
  nameLabel: string
  namePlaceholder: string
  // "They sign in as" — the address the name will get goes after it.
  signsInAs: string
  add: string
  owner: string
  admin: string
  makeOwner: string
  handOverQuestion: string
  handOver: string
  keep: string
  remove: string
  errors: Record<CoreErrorCode, string>
}
