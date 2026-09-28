/*
 * AdminFrame.tsx — the frame every demo's phone admin shares: the bar
 * (name, the transparency line, a status line kept for notices, Reset),
 * the first setup until it is done, then the demo's own sections, and a
 * footer with Sign out (last, so it sits
 * where finished work ends and the tap-through reaches it last) and the
 * demo notice. The panel says it is busy until the visitor's store opens.
 */
import type { ReactNode } from 'react'
import { ResetControl } from '../controls/ResetControl.tsx'
import type { ResetWords } from '../controls/ResetControl.tsx'

export interface AdminFrameWords {
  title: string
  keptOnDevice: string
  savesAsYouGo: string
  signOut: string
  demoNotice: string
  reset: ResetWords
}

interface AdminFrameProps {
  words: AdminFrameWords
  ready: boolean
  // A notice already in words, or null for "saves as you go".
  notice: string | null
  onReset: () => Promise<void>
  onSignOut: () => void
  // Anything the demo adds to the bar beside its title (Stofpad's language switch).
  barExtra?: ReactNode
  // Shown instead of the sections until the panel's first setup is done.
  setup: ReactNode | null
  children: ReactNode
}

export function AdminFrame({ words, ready, notice, onReset, onSignOut, barExtra, setup, children }: AdminFrameProps) {
  return (
    <div className="admin" aria-busy={!ready}>
      <header className="admin-bar">
        <div className="admin-bar-top">
          <p className="admin-bar-title">{words.title}</p>
          {barExtra}
        </div>
        <p className="admin-kept">{words.keptOnDevice}</p>
        <p className="admin-status" role="status">
          {notice ?? words.savesAsYouGo}
        </p>
        <ResetControl onReset={onReset} disabled={!ready} words={words.reset} />
      </header>
      {setup ?? children}
      <footer className="admin-footer">
        <button type="button" className="button button-secondary" onClick={onSignOut} data-tap-last="">
          {words.signOut}
        </button>
        <p className="demo-notice">{words.demoNotice}</p>
      </footer>
    </div>
  )
}
