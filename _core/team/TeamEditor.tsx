/*
 * TeamEditor.tsx — "People who can sign in": a note saying who may change
 * the list, "Add a person" by first name (they sign in on the demo's
 * .example domain; a visitor never types a real email), and the list as
 * fixed slots. Only the owner can add, remove or hand ownership over;
 * after handing it over, the rest greys out and the note says why.
 */
import { useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Result } from '../result/result.ts'
import type { CoreErrorCode } from '../result/core-errors.ts'
import { SlotList } from '../lists/SlotList.tsx'
import { canManage } from './team.ts'
import type { Member } from './team.ts'
import type { TeamWords } from './team-words.ts'
import { previewEmail, useTeamForm } from './use-team-form.ts'
import { TeamRow } from './TeamRow.tsx'

export interface TeamEditing {
  addMember: (name: string) => Result<true, CoreErrorCode>
  removeMember: (email: string) => Result<true, CoreErrorCode>
  transferOwnership: (email: string) => Result<true, CoreErrorCode>
}

interface TeamEditorProps {
  team: Member[]
  signedInEmail: string
  domain: string
  words: TeamWords
  actions: TeamEditing
}

const CLOSING_SHAPE = <div className="team-row" />

export function TeamEditor({ team, signedInEmail, domain, words, actions }: TeamEditorProps) {
  const form = useTeamForm(actions.addMember)
  const [askingEmail, setAskingEmail] = useState<string | null>(null)
  const manage = canManage(team, signedInEmail)
  const signsInAs = previewEmail(form.name, domain)

  function changeName(event: ChangeEvent<HTMLInputElement>): void {
    form.setName(event.target.value)
  }

  function renderMember(member: Member) {
    return <TeamRow member={member} manage={manage} asking={askingEmail === member.email} words={words} onAsk={setAskingEmail} onHandOver={actions.transferOwnership} onRemove={actions.removeMember} />
  }

  return (
    <>
      <p className="admin-section-lead">{manage ? words.ownerNote : words.adminNote}</p>
      <form className="team-form" onSubmit={form.submit}>
        <label className="field">
          <span className="field-label">{words.nameLabel}</span>
          <input className="field-input" name="team-name" value={form.name} onChange={changeName} placeholder={words.namePlaceholder} disabled={!manage} autoComplete="off" />
        </label>
        <p className="team-signs-in-as">{signsInAs === '' ? '' : `${words.signsInAs} ${signsInAs}`}</p>
        <button type="submit" className="button button-secondary" disabled={!manage}>
          {words.add}
        </button>
        <p className="form-status" role="status">
          {form.error == null ? '' : words.errors[form.error]}
        </p>
      </form>
      <SlotList items={team} className="slot-list" slotClassName="slot" renderItem={renderMember} closingShape={CLOSING_SHAPE} empty={null} />
    </>
  )
}
