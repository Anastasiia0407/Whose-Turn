import type { ReactNode } from 'react'
import styles from './AppShell.module.css'

type AppShellProps = {
  children: ReactNode
  /**
   * Drop the 16px side gutters so a screen can position content edge-to-edge.
   * Used by login, whose illustrations sit against the frame edges.
   */
  bleed?: boolean
  className?: string
}

/**
 * The phone-width column every screen renders inside.
 *
 * There is deliberately NO status bar and NO home-indicator line: those were
 * Figma mockup decoration standing in for the phone itself, and a real browser
 * already sits inside real device chrome. The vertical space they occupied is
 * now the actual safe-area insets, handled in CSS.
 */
export function AppShell({ children, bleed = false, className }: AppShellProps) {
  return (
    <div
      className={[styles.shell, bleed ? styles.bleed : null, className]
        .filter(Boolean)
        .join(' ')}
    >
      <main className={styles.content}>{children}</main>
    </div>
  )
}
