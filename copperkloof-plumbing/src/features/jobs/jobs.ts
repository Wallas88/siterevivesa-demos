/*
 * jobs.ts — the "Recent jobs" list as pure operations: check a new job,
 * add it, remove one, move one up or down, feature one, and the order the
 * website shows them in. No storage and no DOM, so it is tested with
 * made-up jobs in tests/jobs.test.ts.
 */
import { ERROR_CODES } from '../../../shared/error-codes.ts'
import type { ErrorCode } from '../../../shared/error-codes.ts'
import { succeed, fail } from '../../../../_core/result/result.ts'
import type { Result } from '../../../../_core/result/result.ts'
import { storedPhotoId } from '../../../../_core/photos/photo-urls.ts'
import type { ContentPhoto } from '../../../../_core/photos/photo-urls.ts'

export interface Job {
  id: string
  title: string
  caption: string
  suburb: string
  photo: ContentPhoto
  featured: boolean
}

export interface JobDraft {
  title: string
  caption: string
  suburb: string
}

export type MoveDirection = 'up' | 'down'

export const MAX_JOBS = 12
export const MAX_TITLE_LENGTH = 60
export const MAX_CAPTION_LENGTH = 140

// A draft cleaned of stray spaces, or JOB_INVALID when a required field is empty or too long.
export function checkDraft(draft: JobDraft, areas: string[]): Result<JobDraft, ErrorCode> {
  const title = draft.title.trim()
  const caption = draft.caption.trim()
  if (title === '' || title.length > MAX_TITLE_LENGTH) return fail(ERROR_CODES.JOB_INVALID)
  if (caption.length > MAX_CAPTION_LENGTH || !areas.includes(draft.suburb)) return fail(ERROR_CODES.JOB_INVALID)
  return succeed({ title, caption, suburb: draft.suburb })
}

// Newest first: a job just added leads the list.
export function addJob(jobs: Job[], job: Job): Result<Job[], ErrorCode> {
  if (jobs.length >= MAX_JOBS) return fail(ERROR_CODES.JOBS_FULL)
  return succeed([job, ...jobs])
}

export function removeJob(jobs: Job[], id: string): Job[] {
  return jobs.filter(isKept)

  function isKept(job: Job): boolean {
    return job.id !== id
  }
}

// Swaps a job with its neighbour; at either end the list stays as it is.
export function moveJob(jobs: Job[], id: string, direction: MoveDirection): Job[] {
  const from = jobs.findIndex(hasId)
  const to = direction === 'up' ? from - 1 : from + 1
  const moving = jobs[from]
  const neighbour = jobs[to]
  if (moving == null || neighbour == null) return jobs
  const moved = [...jobs]
  moved[to] = moving
  moved[from] = neighbour
  return moved

  function hasId(job: Job): boolean {
    return job.id === id
  }
}

// One featured job at most: featuring one clears the rest, featuring it again clears it.
export function toggleFeatured(jobs: Job[], id: string): Job[] {
  return jobs.map(withFeature)

  function withFeature(job: Job): Job {
    const featured = job.id === id ? !job.featured : false
    return job.featured === featured ? job : { ...job, featured }
  }
}

// The website shows the featured job first, then the rest in the owner's order.
export function jobsForSite(jobs: Job[]): Job[] {
  return [...jobs.filter(isFeatured), ...jobs.filter(isNotFeatured)]

  function isFeatured(job: Job): boolean {
    return job.featured
  }

  function isNotFeatured(job: Job): boolean {
    return !job.featured
  }
}

export type SiteBadge = 'Just added' | 'Featured' | null

// "Just added" wins: showing the owner their new job arrived is the point of the demo.
export function siteBadge(job: Job, lastAddedId: string | null): SiteBadge {
  if (job.id === lastAddedId) return 'Just added'
  return job.featured ? 'Featured' : null
}

export function storedPhotoIds(jobs: Job[]): string[] {
  const ids: string[] = []
  for (const job of jobs) {
    const id = storedPhotoId(job.photo)
    if (id != null) ids.push(id)
  }
  return ids
}
