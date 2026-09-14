import type { ReactNode } from 'react'
import { figmaUrl } from '../figma'
import styles from './DriftNote.module.css'

export type DriftRow = {
  /** What disagrees, in a few words. */
  subject: string
  /** What the design file says. Transcribed from the frame. */
  figma: ReactNode
  /** What the running code does. */
  code: ReactNode
  /** Which one this site renders from, and why. */
  note?: ReactNode
}

type DriftNoteProps = {
  /** The frame the comparison is against, for a direct link. */
  figmaNode?: string
  rows: DriftRow[]
}

/**
 * Where Figma and the code disagree.
 *
 * Every page renders from the CODE value — that is what ships — and then says
 * so here, side by side with what the file says. Neither side is quietly
 * preferred and neither is hidden: picking one silently is how a design system
 * ends up with two truths and no record of which is which.
 *
 * This is deliberately loud. It is not a Callout with a different border; it is
 * a table with two labelled columns, because the reader's question is always
 * "which one is right?" and that question needs both answers next to each other.
 */
export function DriftNote({ figmaNode, rows }: DriftNoteProps) {
  return (
    <section className={styles.drift} aria-label="Figma and code disagree">
      <header className={styles.header}>
        <p className={styles.badge}>Figma and code disagree</p>
        {figmaNode ? (
          <a
            className={styles.link}
            href={figmaUrl(figmaNode)}
            target="_blank"
            rel="noreferrer noopener"
          >
            Check the frame — {figmaNode}
          </a>
        ) : null}
      </header>

      <p className={styles.rule}>
        Every value on this page is rendered from the code. The design file says
        something else in the rows below.
      </p>

      <div className={styles.scroller} tabIndex={0} role="region" aria-label="Disagreements">
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col" className={styles.th}>
                What
              </th>
              <th scope="col" className={styles.th}>
                Figma says
              </th>
              <th scope="col" className={styles.th}>
                Code does
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.subject}>
                <th scope="row" className={styles.rowHead}>
                  {row.subject}
                  {row.note ? <span className={styles.note}>{row.note}</span> : null}
                </th>
                <td className={styles.td}>{row.figma}</td>
                <td className={[styles.td, styles.codeCell].join(' ')}>{row.code}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
