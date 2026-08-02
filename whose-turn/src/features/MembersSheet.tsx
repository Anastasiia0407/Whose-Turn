import { useState, type FormEvent } from 'react'
import { BottomSheet, Button, MemberAvatar, StaticRow, TextField } from '../ui'
import { useBlockInsets } from '../ui/useBlockInsets'
import { useMuted } from '../ui/useMuted'
import { SwipeRow } from './SwipeRow'
import type { Member } from '../data'
import styles from './Sheets.module.css'

/** Node 65:44 leaves 24px between the list and the pinned bottom block. */
const BLOCK_GAP = 24

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
  // Same hook home uses. Only the bottom slot is needed; BottomSheet measures
  // its own top block and publishes it as --sheet-top-block.
  const { insets, bottomRef } = useBlockInsets()
  const [muted, setMuted] = useMuted()

  const trimmed = name.trim()
  const canSubmit = trimmed.length > 0 && !busy

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    const added = await onAdd(trimmed)
    if (added) setName('')
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Members"
      framed
      headerAction={
        /* Nodes 251:65 (bell-02) / 251:149 (bell-off-01). Same button
           treatment as the close control — not a new style. */
        <Button
          variant="icon"
          tone="canvas"
          leadingIcon={muted ? 'bell-off' : 'bell'}
          aria-label={muted ? 'Unmute sound' : 'Mute sound'}
          aria-pressed={muted}
          onClick={() => setMuted(!muted)}
        />
      }
    >
      {/* The scroller spans the whole sheet body; the handle/header block above
          it and the form below it are both opaque and pinned, so member rows
          pass behind them rather than stopping at their edge. */}
      <div
        className={styles.scroller}
        style={{ paddingBottom: `${insets.bottom + BLOCK_GAP}px` }}
      >
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
                className={styles.memberRow}
                label={member.name}
                leading={
                  <MemberAvatar color={member.color} name={member.name} />
                }
              />
            </SwipeRow>
          ))}
        </div>
      </div>

      <form className={styles.bottomBlock} ref={bottomRef} onSubmit={onSubmit}>
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
