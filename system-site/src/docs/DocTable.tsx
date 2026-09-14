import type { ReactNode } from 'react'
import styles from './DocTable.module.css'

type DocTableProps = {
  /** The small uppercase label the frame puts above the table. */
  caption?: string
  columns: string[]
  rows: ReactNode[][]
}

/**
 * The workhorse of the Foundations frames — every one of them is a caption and
 * a table with a header row, and nothing else.
 *
 * The table scrolls inside its own container so a wide row never pushes the
 * page sideways at 360px. `scope="col"` is what lets a screen reader announce
 * the column a cell belongs to, which is the whole value of these tables.
 */
export function DocTable({ caption, columns, rows }: DocTableProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.scroller} tabIndex={0} role="region" aria-label={caption}>
        <table className={styles.table}>
          {caption ? <caption className={styles.caption}>{caption}</caption> : null}
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} scope="col" className={styles.th}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className={styles.tr}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className={styles.td}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** A token name, a CSS value, a node id — anything meant to be read literally. */
export function Mono({ children }: { children: ReactNode }) {
  return <code className={styles.mono}>{children}</code>
}
