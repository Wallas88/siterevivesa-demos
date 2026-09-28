/*
 * App.tsx — Copperkloof's demo: the business's website and its phone admin
 * in the shared shell, fed by one useDemo() so an admin change shows on the
 * site at once. The admin sits behind the mock sign-in (a fixed demo email
 * and an on-screen code); the website stays public.
 */
import { useDemo } from '../features/demo/use-demo.ts'
import { useView } from '../../../_core/view/use-view.ts'
import { useSignIn } from '../../../_core/sign-in/use-sign-in.ts'
import { useToday } from '../../../_core/specials/use-today.ts'
import { DemoShell } from '../../../_core/shell/DemoShell.tsx'
import { SignInPanel } from '../../../_core/sign-in/SignInPanel.tsx'
import { SiteView } from '../components/SiteView.tsx'
import { AdminPanel } from '../components/AdminPanel.tsx'
import { SIGN_IN_WORDS, VIEW_WORDS } from '../content/words.ts'
import { SIGNED_IN_KEY } from '../content/business.ts'

const JOBS_SECTION_ID = 'jobs'

export function App() {
  const today = useToday()
  const demo = useDemo(today)
  const view = useView()
  const signIn = useSignIn(SIGNED_IN_KEY)

  function showNewJob(): void {
    view.showOnSite(JOBS_SECTION_ID)
  }

  const site = <SiteView data={demo.data} photoUrls={demo.photoUrls} lastAddedId={demo.lastAddedId} jobsSectionId={JOBS_SECTION_ID} today={today} />
  const admin = signIn.signedIn ? <AdminPanel demo={demo} today={today} onShowNewJob={showNewJob} onSignOut={signIn.signOut} /> : <SignInPanel signIn={signIn} words={SIGN_IN_WORDS} />
  return <DemoShell view={view.current} onChooseView={view.choose} viewWords={VIEW_WORDS} site={site} admin={admin} />
}
