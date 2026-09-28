/*
 * SiteView.tsx — the fictional business's public website: header, hero,
 * services with example prices, specials and events, recent jobs, opening
 * hours and the enquiry form. It only
 * reads the demo data; every change comes from the admin.
 */
import { BUSINESS } from '../content/business.ts'
import type { DemoData } from '../features/storage/saved-demo.ts'
import type { PhotoUrls } from '../../../_core/photos/photo-urls.ts'
import { ServiceList } from './ServiceList.tsx'
import { JobGallery } from './JobGallery.tsx'
import { EnquiryForm } from './EnquiryForm.tsx'
import { SpecialsSection } from './SpecialsSection.tsx'
import { HoursSection } from './HoursSection.tsx'
import { DemoNotice } from './DemoNotice.tsx'

interface SiteViewProps {
  data: DemoData
  photoUrls: PhotoUrls
  lastAddedId: string | null
  jobsSectionId: string
  today: string
}

export function SiteView({ data, photoUrls, lastAddedId, jobsSectionId, today }: SiteViewProps) {
  return (
    <div className="site">
      <header className="site-header">
        <a className="site-brand" href="#top">
          <img className="site-brand-mark" src="/favicon.svg" alt="" width="32" height="32" />
          {BUSINESS.name}
        </a>
        <a className="button button-secondary site-header-action" href="#contact">
          Get a quote
        </a>
      </header>
      <main>
        <section className="site-hero" id="top">
          <h1 className="site-hero-title">{BUSINESS.heroTitle}</h1>
          <p className="site-hero-lead">{BUSINESS.heroLead}</p>
          <a className="button button-primary" href="#contact">
            Ask for a quote
          </a>
        </section>
        <ServiceList prices={data.prices} />
        <SpecialsSection specials={data.specials} today={today} />
        <JobGallery sectionId={jobsSectionId} jobs={data.jobs} photoUrls={photoUrls} lastAddedId={lastAddedId} />
        <HoursSection hours={data.hours} />
        <EnquiryForm />
      </main>
      <footer className="site-footer">
        <p className="site-footer-line">© {BUSINESS.name} · demo concept · areas are fictional</p>
        <DemoNotice />
      </footer>
    </div>
  )
}
