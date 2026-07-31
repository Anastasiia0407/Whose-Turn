import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell, Button, PillChip } from '../ui'
import styles from './FateLayout.module.css'

type FateLayoutProps = {
  choreName: string
  caption: string
  ctaLabel: string
  onStart: () => void
  disabled: boolean
  /** Announced politely once the draw settles. */
  announcement: string | null
  children: ReactNode
}

/**
 * Shared layout for the three draw screens — Figma 86:78, 92:277, 92:331.
 * They differ only in the hero and the copy.
 */
export function FateLayout({
  choreName,
  caption,
  ctaLabel,
  onStart,
  disabled,
  announcement,
  children,
}: FateLayoutProps) {
  const navigate = useNavigate()

  return (
    <AppShell>
      <div className={styles.body}>
        <div className={styles.nav}>
          <Button
            variant="icon"
            tone="surface"
            leadingIcon="chevron-left"
            aria-label="Back"
            onClick={() => void navigate('/')}
          />
          <PillChip tone="success" trailingIcon="check" className={styles.chip}>
            {choreName}
          </PillChip>
        </div>

        <div className={styles.hero}>{children}</div>

        <div className={styles.footer}>
          <p className={styles.caption}>{caption}</p>
          <Button variant="primary" onClick={onStart} disabled={disabled}>
            {ctaLabel}
          </Button>
        </div>

        {/* The outcome is visual, so it is also announced for assistive tech. */}
        <p className={styles.visuallyHidden} role="status" aria-live="polite">
          {announcement ?? ''}
        </p>
      </div>
    </AppShell>
  )
}
