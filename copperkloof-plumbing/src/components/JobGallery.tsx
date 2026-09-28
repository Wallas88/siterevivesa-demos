/*
 * JobGallery.tsx — the website's "Recent jobs": the featured job first,
 * then the rest in the owner's order, each with its photo, suburb and
 * caption. The job just added from the admin is marked, which is the
 * whole point of the demo: photo on the phone, on the website straight away.
 * Cards are fixed slots of one size (Nothing hops): reordering or featuring
 * in the admin fades new content into the same cards instead of moving them.
 */
import { jobsForSite, siteBadge } from '../features/jobs/jobs.ts'
import type { Job } from '../features/jobs/jobs.ts'
import { photoSrc } from '../../../_core/photos/photo-urls.ts'
import type { PhotoUrls } from '../../../_core/photos/photo-urls.ts'
import { MISSING_PHOTO_SRC } from '../content/business.ts'

interface JobGalleryProps {
  sectionId: string
  jobs: Job[]
  photoUrls: PhotoUrls
  lastAddedId: string | null
}

// Photos are kept at 4:3; the width and height reserve their space before they load.
const PHOTO_WIDTH = 1200
const PHOTO_HEIGHT = 900

export function JobGallery({ sectionId, jobs, photoUrls, lastAddedId }: JobGalleryProps) {
  function renderJob(job: Job, index: number) {
    const badge = siteBadge(job, lastAddedId)
    return (
      <li className="job-card" key={index}>
        <div className="job-card-content" key={job.id}>
          <img className="job-card-photo" src={photoSrc(job.photo, photoUrls, MISSING_PHOTO_SRC)} alt={job.title} width={PHOTO_WIDTH} height={PHOTO_HEIGHT} loading="lazy" decoding="async" />
          <div className="job-card-body">
            <p className="job-card-badge" data-empty={badge == null}>
              {badge ?? ''}
            </p>
            <h3 className="job-card-title">{job.title}</h3>
            <p className="job-card-meta">{job.suburb}</p>
            <p className="job-card-caption">{job.caption}</p>
          </div>
        </div>
      </li>
    )
  }

  return (
    <section className="site-section" id={sectionId}>
      <h2 className="site-section-title">Recent jobs</h2>
      <p className="site-section-lead">Added from the van, on the owner's phone.</p>
      {jobs.length === 0 ? <p className="job-gallery-empty">New jobs show here as soon as they are added.</p> : <ul className="job-gallery">{jobsForSite(jobs).map(renderJob)}</ul>}
    </section>
  )
}
