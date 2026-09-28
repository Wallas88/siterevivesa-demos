/*
 * AdminPanel.tsx — Copperkloof's phone admin in the shared admin frame:
 * "Add a job", the job list, specials and events, opening hours and the
 * price list, and who can sign in (after the first setup, which makes the
 * person signing in the owner). Everything goes through the demo's
 * actions; the frame says
 * it is busy until the visitor's store has opened.
 */
import type { Demo } from '../features/demo/use-demo.ts'
import { AdminFrame } from '../../../_core/shell/AdminFrame.tsx'
import { AdminSection } from '../../../_core/shell/AdminSection.tsx'
import { SpecialEditor } from '../../../_core/specials/SpecialEditor.tsx'
import { HoursEditor } from '../../../_core/hours/HoursEditor.tsx'
import { ERROR_MESSAGES } from '../../shared/error-codes.ts'
import { TeamSetup } from '../../../_core/team/TeamSetup.tsx'
import { TeamEditor } from '../../../_core/team/TeamEditor.tsx'
import { ADMIN_WORDS, HOURS_WORDS, LANGUAGE, SPECIAL_WORDS, TEAM_WORDS } from '../content/words.ts'
import { DEMO_OWNER_EMAIL, TEAM_DOMAIN } from '../content/business.ts'
import { JobForm } from './JobForm.tsx'
import { JobList } from './JobList.tsx'
import { PriceEditor } from './PriceEditor.tsx'

interface AdminPanelProps {
  demo: Demo
  today: string
  onShowNewJob: () => void
  onSignOut: () => void
}

export function AdminPanel({ demo, today, onShowNewJob, onSignOut }: AdminPanelProps) {
  const notice = demo.notice == null ? null : ERROR_MESSAGES[demo.notice]
  const team = demo.data.team
  const setup = team == null ? <TeamSetup ownerEmail={DEMO_OWNER_EMAIL} words={TEAM_WORDS} onSetUp={demo.actions.setUpTeam} /> : null
  return (
    <AdminFrame words={ADMIN_WORDS} ready={demo.ready} notice={notice} onReset={demo.actions.resetDemo} onSignOut={onSignOut} setup={setup}>
      <AdminSection id="admin-add" title="Add a job">
        <JobForm addJob={demo.actions.addJob} disabled={!demo.ready} onShowNewJob={onShowNewJob} />
      </AdminSection>
      <AdminSection id="admin-jobs" title="Your jobs on the website">
        <JobList jobs={demo.data.jobs} photoUrls={demo.photoUrls} actions={demo.actions} />
      </AdminSection>
      <AdminSection id="admin-specials" title="Specials and events">
        <SpecialEditor specials={demo.data.specials} today={today} language={LANGUAGE} words={SPECIAL_WORDS} actions={demo.actions} disabled={!demo.ready} />
      </AdminSection>
      <AdminSection id="admin-hours" title="Opening hours">
        <HoursEditor key={demo.resetCount} hours={demo.data.hours} actions={demo.actions} words={HOURS_WORDS} />
      </AdminSection>
      <AdminSection id="admin-prices" title="Example prices">
        <PriceEditor key={demo.resetCount} prices={demo.data.prices} editing={demo.actions} />
      </AdminSection>
      <AdminSection id="admin-team" title="People who can sign in">
        <TeamEditor team={team ?? []} signedInEmail={DEMO_OWNER_EMAIL} domain={TEAM_DOMAIN} words={TEAM_WORDS} actions={demo.actions} />
      </AdminSection>
    </AdminFrame>
  )
}
