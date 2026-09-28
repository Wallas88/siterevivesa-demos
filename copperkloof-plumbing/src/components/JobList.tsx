/*
 * JobList.tsx — the owner's jobs as fixed slots (the shared SlotList,
 * Nothing hops): moving or removing a job changes what the slots show, not
 * where the buttons are, and only the end of the list eases open or
 * closed. Which job is being asked about ("Remove this job?") is kept by
 * job, so it never carries over to another one.
 */
import { useState } from 'react'
import type { Job } from '../features/jobs/jobs.ts'
import type { DemoActions } from '../features/demo/demo-actions.ts'
import type { PhotoUrls } from '../../../_core/photos/photo-urls.ts'
import { SlotList } from '../../../_core/lists/SlotList.tsx'
import { JobSlot } from './JobSlot.tsx'

interface JobListProps {
  jobs: Job[]
  photoUrls: PhotoUrls
  actions: DemoActions
}

// An empty row shaped like a real one (thumbnail and button spaces), so it starts at a row's height and eases to none.
const CLOSING_SHAPE = (
  <>
    <div className="job-row">
      <span className="job-row-thumb" />
    </div>
    <div className="job-actions" />
  </>
)

const EMPTY = <p className="slot-list-empty">No jobs yet. Add one above and it shows on the website.</p>

export function JobList({ jobs, photoUrls, actions }: JobListProps) {
  const [askingId, setAskingId] = useState<string | null>(null)

  function renderJob(job: Job, index: number) {
    return <JobSlot job={job} photoUrls={photoUrls} position={{ index, count: jobs.length }} asking={askingId === job.id} onAsk={setAskingId} actions={actions} />
  }

  return <SlotList items={jobs} className="slot-list" slotClassName="slot" renderItem={renderJob} closingShape={CLOSING_SHAPE} empty={EMPTY} />
}
