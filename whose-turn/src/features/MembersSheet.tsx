import { useState, type FormEvent } from 'react'
import { BottomSheet, Button, MemberAvatar, StaticRow, TextField } from '../ui'
import { SwipeRow } from './SwipeRow'
import type { Member } from '../data'
import styles from './Sheets.module.css'

type MembersSheetProps = {
  open: boolean
  onClose: () => void
  members: Member[]
  onAdd: (name: string) => Promise<boolean>
  onRemove: (member: Member) => Promise<boolean>
  busy: boolean
  error: string | null
  /** Clears the message as soon as the user starts changing the input. */
  onClearError: () => void
}

/**
 * Members — Figma frame 65:6 (sheet node 65:44), edit variant 76:67.
 *
 * Removal happens straight from edit mode, with no confirmation dialog.
 *
 * The "needs at least 2 members" and "household is full" rules are NOT shown as
 * standing text: nothing frameless sits on screen at rest. Both controls stay
 * enabled and explain themselves on attempt, in the shared alert region — the
 * same pattern as the chore-delete guard.
 */
export function MembersSheet({
  open,
  onClose,
  members,
  onAdd,
  onRemove,
  busy,
  error,
  onClearError,
}: MembersSheetProps) {
  const [name, setName] = useState('')
  const [openRowId, setOpenRowId] = useState<string | null>(null)

  const trimmed = name.trim()
  const canSubmit = trimmed.length > 0 && !busy

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    const added = await onAdd(trimmed)
    if (added) setName('')
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Members">
      <div className={styles.list}>
        {members.map((member) => (
          <SwipeRow
            key={member.id}
            deleteLabel={`Remove ${member.name}`}
            onRequestDelete={() => void onRemove(member)}
            open={openRowId === member.id}
            onOpenChange={(next) => setOpenRowId(next ? member.id : null)}
            focusableRow
            rowLabel={member.name}
          >
            <StaticRow
              label={member.name}
              leading={
                <MemberAvatar color={member.color} name={member.name} />
              }
            />
          </SwipeRow>
        ))}
      </div>

      <form className={styles.content} onSubmit={onSubmit}>
        <TextField
          label="Member name"
          hideLabel
          placeholder="Enter name"
          value={name}
          onChange={(e) => {
            if (error) onClearError()
            setName(e.target.value)
          }}
          disabled={busy}
          autoComplete="off"
          maxLength={40}
        />
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" variant="primary" disabled={!canSubmit}>
          Add member
        </Button>
      </form>
    </BottomSheet>
  )
}
