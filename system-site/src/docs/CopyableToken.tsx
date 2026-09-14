import { useEffect, useRef, useState } from 'react'
import styles from './CopyableToken.module.css'

type CopyableTokenProps = {
  /** The exact text put on the clipboard — usually a custom property name. */
  name: string
  /** Shown instead of `name` when the two differ, e.g. a Figma variable path. */
  label?: string
}

type Status = 'idle' | 'copied' | 'failed'

const RESET_MS = 1600

/**
 * A token name that copies itself.
 *
 * A real `<button>`, not a click handler on a span: this is an action, it has
 * to be reachable by keyboard, and it has to announce itself. The result is
 * announced through a polite live region rather than only by the label
 * changing, so a screen-reader user learns the copy succeeded.
 *
 * Failure is reported, not swallowed. `navigator.clipboard` rejects on an
 * insecure origin and in some embedded webviews, and a button that silently
 * does nothing is worse than one that says it could not.
 */
export function CopyableToken({ name, label }: CopyableTokenProps) {
  const [status, setStatus] = useState<Status>('idle')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => window.clearTimeout(timer.current)
  }, [])

  async function copy() {
    window.clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(name)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
    timer.current = window.setTimeout(() => setStatus('idle'), RESET_MS)
  }

  return (
    <span className={styles.wrap}>
      <button
        type="button"
        className={styles.button}
        onClick={copy}
        // The visible text is the token; the accessible name has to say what
        // the button DOES, or it announces as "--color-accent-primary, button".
        aria-label={`Copy ${name}`}
      >
        <code className={styles.name}>{label ?? name}</code>
        <span
          className={[styles.hint, status !== 'idle' ? styles.hintActive : null]
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
        >
          {status === 'copied' ? 'Copied' : status === 'failed' ? 'Failed' : 'Copy'}
        </span>
      </button>
      <span role="status" aria-live="polite" className="visually-hidden">
        {status === 'copied'
          ? `${name} copied to clipboard`
          : status === 'failed'
            ? `Could not copy ${name}`
            : ''}
      </span>
    </span>
  )
}
