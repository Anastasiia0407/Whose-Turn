import styles from './CodeBlock.module.css'

type CodeBlockProps = {
  /** The snippet. Written as one template literal, indentation included. */
  children: string
  /** Shown above the block, e.g. the file a snippet belongs in. */
  label?: string
}

/**
 * A read-only snippet.
 *
 * Deliberately plain: no copy button and no syntax highlighting. The
 * copy-to-clipboard mechanism has to take its text from the same file that
 * renders the live example, so that the two can never drift — building a copy
 * button here, against a hand-written string, would set the opposite precedent.
 */
export function CodeBlock({ children, label }: CodeBlockProps) {
  return (
    <div className={styles.block}>
      {label ? <p className={styles.label}>{label}</p> : null}
      {/* tabIndex makes the scroll container reachable by keyboard, which it
          must be whenever content can overflow it. */}
      <pre className={styles.pre} tabIndex={0}>
        <code>{children.trim()}</code>
      </pre>
    </div>
  )
}
