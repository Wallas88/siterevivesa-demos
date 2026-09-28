/*
 * demo-actions.ts — what each Copperkloof admin button does, in order:
 * check first, keep the photo in the browser, then change the list. Hours,
 * specials and Reset are the shared actions (_core/demo/content-actions.ts). Each step is a
 * plain function of its dependencies; createDemoActions binds them once
 * for use-demo.ts, so nothing reaches for globals and tests pass their own.
 */
import { AREAS } from '../../content/business.ts'
import { ERROR_CODES } from '../../../shared/error-codes.ts'
import type { ErrorCode } from '../../../shared/error-codes.ts'
import { succeed, fail } from '../../../../_core/result/result.ts'
import type { Result } from '../../../../_core/result/result.ts'
import type { CoreErrorCode } from '../../../../_core/result/core-errors.ts'
import { checkDraft, MAX_JOBS } from '../jobs/jobs.ts'
import type { Job, JobDraft, MoveDirection } from '../jobs/jobs.ts'
import { parseRand } from '../../../../_core/prices/rand-input.ts'
import { createContentActions } from '../../../../_core/demo/content-actions.ts'
import type { ContentActions } from '../../../../_core/demo/content-actions.ts'
import type { ActionDependencies as CoreActionDependencies } from '../../../../_core/demo/use-content-demo.ts'
import type { DemoData } from '../storage/saved-demo.ts'
import type { DemoAction } from './demo-reducer.ts'

export interface DemoActions extends ContentActions {
  addJob: (draft: JobDraft, photo: Blob) => Promise<Result<true, ErrorCode>>
  removeJob: (id: string) => Promise<void>
  moveJob: (id: string, direction: MoveDirection) => void
  featureJob: (id: string) => void
  setPrice: (id: string, text: string) => Result<number, CoreErrorCode>
  renamePrice: (id: string, label: string) => void
}

export type ActionDependencies = CoreActionDependencies<DemoData, DemoAction, ErrorCode>

// Validated before the first write: a refused job leaves nothing behind.
async function addJob(deps: ActionDependencies, draft: JobDraft, photo: Blob): Promise<Result<true, ErrorCode>> {
  const checked = checkDraft(draft, AREAS)
  if (!checked.ok) return checked
  if (deps.latestData().jobs.length >= MAX_JOBS) return fail(ERROR_CODES.JOBS_FULL)
  const photoId = crypto.randomUUID()
  const saved = await deps.store.savePhoto(photoId, photo)
  if (!saved.ok) return saved
  deps.keepPhotoUrl(photoId, photo)
  const job: Job = { id: crypto.randomUUID(), ...checked.value, photo: { kind: 'stored', photoId }, featured: false }
  deps.dispatch({ type: 'jobAdded', job })
  deps.markAdded(job.id)
  return succeed(true)
}

async function removeJob(deps: ActionDependencies, id: string): Promise<void> {
  const job = deps.latestData().jobs.find(hasId)
  deps.dispatch({ type: 'jobRemoved', id })
  if (job?.photo.kind !== 'stored') return
  deps.dropPhotoUrl(job.photo.photoId)
  const deleted = await deps.store.deletePhoto(job.photo.photoId)
  if (!deleted.ok) deps.showNotice(deleted.code)

  function hasId(candidate: Job): boolean {
    return candidate.id === id
  }
}

function moveJob(deps: ActionDependencies, id: string, direction: MoveDirection): void {
  deps.dispatch({ type: 'jobMoved', id, direction })
}

function featureJob(deps: ActionDependencies, id: string): void {
  deps.dispatch({ type: 'jobFeatured', id })
}

function setPrice(deps: ActionDependencies, id: string, text: string): Result<number, CoreErrorCode> {
  const parsed = parseRand(text)
  if (parsed.ok) deps.dispatch({ type: 'priceSet', id, cents: parsed.value })
  return parsed
}

function renamePrice(deps: ActionDependencies, id: string, label: string): void {
  deps.dispatch({ type: 'priceRenamed', id, label })
}

export function createDemoActions(deps: ActionDependencies): DemoActions {
  return {
    addJob: addJob.bind(null, deps),
    removeJob: removeJob.bind(null, deps),
    moveJob: moveJob.bind(null, deps),
    featureJob: featureJob.bind(null, deps),
    setPrice: setPrice.bind(null, deps),
    renamePrice: renamePrice.bind(null, deps),
    ...createContentActions(deps),
  }
}
