/*
 * TeamSetup.tsx — the panel's first setup, shown the first time someone
 * signs in: the person signing in becomes the owner, who alone decides who
 * else can sign in. Setting up replaces this step with the admin's
 * sections, below the bar it sits under (they fade in). Reset brings this
 * step back.
 */
import type { TeamWords } from './team-words.ts'

interface TeamSetupProps {
  ownerEmail: string
  words: TeamWords
  onSetUp: () => void
}

export function TeamSetup({ ownerEmail, words, onSetUp }: TeamSetupProps) {
  return (
    <section className="admin-section team-setup" aria-labelledby="team-setup-title">
      <h2 className="admin-section-title" id="team-setup-title">
        {words.setupTitle}
      </h2>
      <p className="team-setup-owner">
        {words.setupOwner} <strong>{ownerEmail}</strong>
      </p>
      <p className="admin-section-lead">{words.setupNote}</p>
      <button type="button" className="button button-primary" onClick={onSetUp} data-resizes-list="">
        {words.setUp}
      </button>
    </section>
  )
}
