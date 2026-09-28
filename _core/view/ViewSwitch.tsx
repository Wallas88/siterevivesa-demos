/*
 * ViewSwitch.tsx — the phone's two-tab switch between the business's
 * website and its admin. It sits above both views and stays at the top of
 * the screen, so switching never moves it (Nothing hops). Hidden on wide
 * screens, where both views show side by side.
 */
import type { KeyboardEvent } from 'react'
import type { DemoView } from './view-choice.ts'

// The phone's two tabs, in the visitor's language ("Website"/"Shop", "Admin").
export interface ViewWords {
  label: string
  site: string
  admin: string
}

interface ViewSwitchProps {
  current: DemoView
  onChoose: (view: DemoView) => void
  words: ViewWords
}

export function ViewSwitch({ current, onChoose, words }: ViewSwitchProps) {
  function chooseSite(): void {
    onChoose('site')
  }

  function chooseAdmin(): void {
    onChoose('admin')
  }

  // Arrow keys move between the two tabs, as a tab list should.
  function moveWithArrows(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    const next: DemoView = current === 'site' ? 'admin' : 'site'
    onChoose(next)
    document.getElementById(`tab-${next}`)?.focus()
  }

  return (
    <div className="view-switch">
      <div className="view-switch-tabs" role="tablist" aria-label={words.label} onKeyDown={moveWithArrows}>
        <button type="button" className="view-switch-tab" id="tab-site" role="tab" aria-selected={current === 'site'} aria-controls="pane-site" tabIndex={current === 'site' ? 0 : -1} onClick={chooseSite}>
          {words.site}
        </button>
        <button type="button" className="view-switch-tab" id="tab-admin" role="tab" aria-selected={current === 'admin'} aria-controls="pane-admin" tabIndex={current === 'admin' ? 0 : -1} onClick={chooseAdmin}>
          {words.admin}
        </button>
      </div>
    </div>
  )
}
