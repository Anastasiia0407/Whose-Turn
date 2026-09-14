import type { ReactNode } from 'react'
import styles from './DoDont.module.css'

type PanelProps = {
  /** One line saying what the example shows. */
  caption: ReactNode
  children: ReactNode
}

type DoDontProps = {
  children: ReactNode
}

/**
 * A do / don't pair, side by side on wide viewports and stacked below.
 *
 * The verdict is written as a word in each panel's heading, not signalled by
 * the green and red edges alone.
 */
export function DoDont({ children }: DoDontProps) {
  return <div className={styles.pair}>{children}</div>
}

export function Do({ caption, children }: PanelProps) {
  return (
    <section className={[styles.panel, styles.do].join(' ')}>
      <p className={styles.verdict}>Do</p>
      <div className={styles.example}>{children}</div>
      <p className={styles.caption}>{caption}</p>
    </section>
  )
}

export function Dont({ caption, children }: PanelProps) {
  return (
    <section className={[styles.panel, styles.dont].join(' ')}>
      <p className={styles.verdict}>Don’t</p>
      <div className={styles.example}>{children}</div>
      <p className={styles.caption}>{caption}</p>
    </section>
  )
}
