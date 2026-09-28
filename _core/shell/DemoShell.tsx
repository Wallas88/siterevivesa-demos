/*
 * DemoShell.tsx — how a demo's two views sit: the business's website and
 * its phone admin. Wide screens show both side by side (the admin in a
 * phone frame); phones show one at a time under the two-tab switch, whose
 * controls sit above both views (Nothing hops). Styles: styles/shell.css.
 */
import type { ReactNode } from 'react'
import type { DemoView } from '../view/view-choice.ts'
import { ViewSwitch } from '../view/ViewSwitch.tsx'
import type { ViewWords } from '../view/ViewSwitch.tsx'

interface DemoShellProps {
  view: DemoView
  onChooseView: (view: DemoView) => void
  viewWords: ViewWords
  site: ReactNode
  admin: ReactNode
}

export function DemoShell({ view, onChooseView, viewWords, site, admin }: DemoShellProps) {
  return (
    <div className="demo-shell" data-view={view}>
      <ViewSwitch current={view} onChoose={onChooseView} words={viewWords} />
      <div className="demo-panes">
        <div className="demo-pane demo-pane-site" id="pane-site" role="tabpanel" aria-labelledby="tab-site">
          {site}
        </div>
        <div className="demo-pane demo-pane-admin" id="pane-admin" role="tabpanel" aria-labelledby="tab-admin">
          <div className="phone-frame">{admin}</div>
        </div>
      </div>
    </div>
  )
}
