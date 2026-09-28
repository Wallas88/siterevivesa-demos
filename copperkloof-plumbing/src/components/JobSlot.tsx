/*
 * JobSlot.tsx — what one slot of the owner's job list shows: thumbnail,
 * title, suburb, and Up, Down, Feature and Remove. The content is keyed by
 * job, so when a job moves into this slot its content fades in while the
 * buttons stay exactly where they were. Remove asks first, in the same
 * space. The slot itself is the shared SlotList's.
 */
import type { Job } from '../features/jobs/jobs.ts'
import type { DemoActions } from '../features/demo/demo-actions.ts'
import { photoSrc } from '../../../_core/photos/photo-urls.ts'
import type { PhotoUrls } from '../../../_core/photos/photo-urls.ts'
import { SwapLabel } from '../../../_core/controls/SwapLabel.tsx'
import { MISSING_PHOTO_SRC } from '../content/business.ts'

interface SlotPosition {
  index: number
  count: number
}

interface JobSlotProps {
  job: Job
  photoUrls: PhotoUrls
  position: SlotPosition
  asking: boolean
  onAsk: (jobId: string | null) => void
  actions: DemoActions
}

const THUMB_WIDTH = 64
const THUMB_HEIGHT = 48

export function JobSlot({ job, photoUrls, position, asking, onAsk, actions }: JobSlotProps) {
  function moveUp(): void {
    actions.moveJob(job.id, 'up')
  }

  function moveDown(): void {
    actions.moveJob(job.id, 'down')
  }

  function feature(): void {
    actions.featureJob(job.id)
  }

  function ask(): void {
    onAsk(job.id)
  }

  function keep(): void {
    onAsk(null)
  }

  function removeNow(): void {
    onAsk(null)
    void actions.removeJob(job.id)
  }

  return (
    <>
      <div className="job-row" key={job.id}>
        <img className="job-row-thumb" src={photoSrc(job.photo, photoUrls, MISSING_PHOTO_SRC)} alt="" width={THUMB_WIDTH} height={THUMB_HEIGHT} loading="lazy" />
        <div className="job-row-text">
          <p className="job-row-title">{job.title}</p>
          <p className="job-row-meta">{job.suburb}</p>
        </div>
      </div>
      {asking ? (
        <div className="job-actions job-actions-asking">
          <p className="job-actions-question">Remove this job?</p>
          <button type="button" className="button button-danger" onClick={removeNow} data-resizes-list="">
            Remove
          </button>
          <button type="button" className="button button-secondary" onClick={keep}>
            Keep
          </button>
        </div>
      ) : (
        <div className="job-actions">
          <button type="button" className="button button-secondary button-icon" onClick={moveUp} disabled={position.index === 0} aria-label={`Move ${job.title} up`}>
            ↑
          </button>
          <button type="button" className="button button-secondary button-icon" onClick={moveDown} disabled={position.index === position.count - 1} aria-label={`Move ${job.title} down`}>
            ↓
          </button>
          <button type="button" className="button button-secondary" onClick={feature} aria-pressed={job.featured}>
            <SwapLabel labels={['Feature', 'Featured']} shown={job.featured ? 1 : 0} />
          </button>
          <button type="button" className="button button-secondary" onClick={ask}>
            Remove
          </button>
        </div>
      )}
    </>
  )
}
