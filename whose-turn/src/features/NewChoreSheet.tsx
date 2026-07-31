import { useState, type FormEvent } from 'react'
import { BottomSheet, Button, TextField } from '../ui'
import styles from './Sheets.module.css'

type NewChoreSheetProps = {
  open: boolean
  onClose: () => void
  onAdd: (name: string) => Promise<boolean>
  busy: boolean
  error: string | null
  /** Clears the message as soon as the user starts changing the input. */
  onClearError: () => void
}

/**
 * New chore — Figma frame 63:5, sheet node 64:6.
 * Title "New Chore", one "Enter chore" field, "Add chore" CTA. Name only.
 */
export function NewChoreSheet({
  open,
  onClose,
  onAdd,
  busy,
  error,
  onClearError,
}: NewChoreSheetProps) {
  const [name, setName] = useState('')

  const trimmed = name.trim()
  const canSubmit = trimmed.length > 0 && !busy

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    const added = await onAdd(trimmed)
    if (added) {
      setName('')
      onClose()
    }
  }

  function close() {
    setName('')
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={close} title="New" accentTitle=" Chore">
      <form className={styles.content} onSubmit={onSubmit}>
        <TextField
          label="Chore"
          hideLabel
          placeholder="Enter chore"
          value={name}
          onChange={(e) => {
            if (error) onClearError()
            setName(e.target.value)
          }}
          disabled={busy}
          autoComplete="off"
          maxLength={80}
        />
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" variant="primary" disabled={!canSubmit}>
          Add chore
        </Button>
      </form>
    </BottomSheet>
  )
}
