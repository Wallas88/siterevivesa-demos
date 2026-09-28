/*
 * EnquiryForm.tsx — the website's quote form. It sends nothing (demo rule:
 * no demo contacts anyone); submitting says so in space kept for the
 * answer, so nothing below it moves.
 */
import { AREAS, BUSINESS } from '../content/business.ts'
import { useDemoEnquiry } from '../features/contact/use-demo-enquiry.ts'

function renderArea(area: string) {
  return (
    <option key={area} value={area}>
      {area}
    </option>
  )
}

export function EnquiryForm() {
  const enquiry = useDemoEnquiry()

  return (
    <section className="site-section" id="contact">
      <h2 className="site-section-title">Ask for a quote</h2>
      <p className="site-section-lead">
        {BUSINESS.shortName} works in {AREAS.join(', ')}. {BUSINESS.areasNote}
      </p>
      <form className="enquiry-form" onSubmit={enquiry.submit}>
        <label className="field">
          <span className="field-label">Your name</span>
          <input className="field-input" name="name" autoComplete="off" />
        </label>
        <label className="field">
          <span className="field-label">Suburb</span>
          <select className="field-input" name="suburb">
            {AREAS.map(renderArea)}
          </select>
        </label>
        <label className="field">
          <span className="field-label">What needs fixing?</span>
          <textarea className="field-input field-textarea" name="message" rows={3} />
        </label>
        <button type="submit" className="button button-primary">
          Send enquiry
        </button>
        <p className="form-status" role="status">
          {enquiry.answered ? 'Demo only: nothing was sent or kept.' : ''}
        </p>
      </form>
    </section>
  )
}
