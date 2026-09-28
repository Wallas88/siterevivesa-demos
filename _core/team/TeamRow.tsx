/*
 * TeamRow.tsx — one person in the list: name, address and role, then
 * "Make owner" and "Remove" in the same place on every row (greyed where
 * not allowed: the owner's own row, or anyone who isn't the owner).
 * "Make owner" asks first, in the same space: the question takes the
 * address line's place, so the row never changes height.
 */
import type { Member } from './team.ts'
import type { TeamWords } from './team-words.ts'

interface TeamRowProps {
  member: Member
  manage: boolean
  asking: boolean
  words: TeamWords
  onAsk: (email: string | null) => void
  onHandOver: (email: string) => void
  onRemove: (email: string) => void
}

export function TeamRow({ member, manage, asking, words, onAsk, onHandOver, onRemove }: TeamRowProps) {
  const changeable = manage && member.role !== 'owner'

  function ask(): void {
    onAsk(member.email)
  }

  function keep(): void {
    onAsk(null)
  }

  function handOver(): void {
    onAsk(null)
    onHandOver(member.email)
  }

  function remove(): void {
    onRemove(member.email)
  }

  return (
    <div className="team-row" key={member.email}>
      <div className="team-row-text">
        <p className="slot-title">{member.name}</p>
        <p className="slot-meta">{asking ? `${words.handOverQuestion} ${member.name}?` : `${member.email} · ${member.role === 'owner' ? words.owner : words.admin}`}</p>
      </div>
      {asking ? (
        <div className="team-actions">
          <button type="button" className="button button-primary" onClick={handOver}>
            {words.handOver}
          </button>
          <button type="button" className="button button-secondary" onClick={keep}>
            {words.keep}
          </button>
        </div>
      ) : (
        <div className="team-actions">
          <button type="button" className="button button-secondary" onClick={ask} disabled={!changeable} aria-label={`${words.makeOwner}: ${member.name}`}>
            {words.makeOwner}
          </button>
          <button type="button" className="button button-secondary" onClick={remove} disabled={!changeable} data-resizes-list="" aria-label={`${words.remove}: ${member.name}`}>
            {words.remove}
          </button>
        </div>
      )}
    </div>
  )
}
