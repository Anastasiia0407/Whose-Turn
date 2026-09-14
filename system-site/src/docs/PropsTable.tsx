import { DocTable, Mono } from './DocTable'
import styles from './PropsTable.module.css'

export type PropRow = {
  name: string
  /** The type as written in the source, e.g. `'primary' | 'secondary'`. */
  type: string
  required?: boolean
  /** The default as written in the source. Omit when there is none. */
  defaultValue?: string
  /** The TSDoc comment on the prop. */
  description?: string
}

type PropsTableProps = {
  /** The component whose props these are, for the table's accessible name. */
  component: string
  rows: PropRow[]
}

/**
 * The props of one component.
 *
 * This is the RENDERER only. `rows` is meant to be produced from the component's
 * TypeScript types at build time, not typed out — a hand-written props table is
 * a second source of truth for the thing this whole site exists to keep single.
 * Until that generator lands, an empty table says so rather than showing a
 * plausible list.
 */
export function PropsTable({ component, rows }: PropsTableProps) {
  if (rows.length === 0) {
    return (
      <p className={styles.empty}>
        No props recorded for <Mono>{component}</Mono> yet. This table is
        generated from the component’s TypeScript types; it is empty because the
        generator has not run, not because the component takes no props.
      </p>
    )
  }

  return (
    <DocTable
      caption={`${component} props`}
      columns={['Prop', 'Type', 'Default', 'Description']}
      rows={rows.map((row) => [
        <span key="name" className={styles.name}>
          <Mono>{row.name}</Mono>
          {row.required ? (
            <span className={styles.required}>Required</span>
          ) : null}
        </span>,
        <Mono key="type">{row.type}</Mono>,
        row.defaultValue ? (
          <Mono key="default">{row.defaultValue}</Mono>
        ) : (
          <span key="default" className={styles.none}>
            —
          </span>
        ),
        <span key="description">{row.description ?? ''}</span>,
      ])}
    />
  )
}
