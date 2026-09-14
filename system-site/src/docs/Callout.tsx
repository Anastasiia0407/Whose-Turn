import type { ReactNode } from 'react'
import styles from './Callout.module.css'

/**
 * `note` — an aside the frame marks NOTE.
 * `rule`  — something that must be followed.
 * `debt`  — a measured, accepted defect. Never a to-do.
 */
export type CalloutTone = 'note' | 'rule' | 'debt'

type CalloutProps = {
  tone?: CalloutTone
  /** Overrides the default label, for a frame that names it differently. */
  label?: string
  title?: string
  children: ReactNode
}

const DEFAULT_LABEL: Record<CalloutTone, string> = {
  note: 'Note',
  rule: 'Rule',
  debt: 'Accepted debt',
}

const TONE_CLASS: Record<CalloutTone, string> = {
  note: styles.note,
  rule: styles.rule,
  debt: styles.debt,
}

/**
 * The tone is carried by a written label as well as by the fill, so it survives
 * being read by someone who cannot separate the three colours — the same rule
 * the product applies to its selected state.
 */
export function Callout({ tone = 'note', label, title, children }: CalloutProps) {
  return (
    <aside className={[styles.callout, TONE_CLASS[tone]].join(' ')}>
      <p className={styles.label}>{label ?? DEFAULT_LABEL[tone]}</p>
      {title ? <p className={styles.title}>{title}</p> : null}
      <div className={styles.body}>{children}</div>
    </aside>
  )
}
