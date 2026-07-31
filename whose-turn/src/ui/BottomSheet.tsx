import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react'
import { Button } from './Button'
import styles from './BottomSheet.module.css'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

type BottomSheetProps = {
  open: boolean
  onClose: () => void
  /** Sheet heading. Pass `accentTitle` to render a second, terracotta word. */
  title: string
  accentTitle?: string
  children: ReactNode
}

/**
 * Modal bottom sheet.
 *
 * The design defines none of the interaction behaviour, so the standard modal
 * contract is added here: Escape closes, scrim click closes, focus moves in on
 * open and returns to the trigger on close, Tab is trapped, and the page behind
 * is scroll-locked.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  accentTitle,
  children,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const titleId = useId()

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!open) return

      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !sheetRef.current) return

      const focusable = Array.from(
        sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      )
      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    },
    [open, onClose],
  )

  useEffect(() => {
    if (!open) return

    returnFocusRef.current = document.activeElement as HTMLElement | null

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    // Move focus into the sheet so keyboard users land inside it.
    const firstFocusable =
      sheetRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? sheetRef.current
    firstFocusable?.focus()

    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', handleKeyDown)
      returnFocusRef.current?.focus()
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div
      className={styles.scrim}
      // Clicking the scrim closes; clicks inside the sheet must not bubble out.
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={sheetRef}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className={styles.handle} aria-hidden="true">
          <div className={styles.handleBar} />
        </div>

        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
            {accentTitle ? (
              <span className={styles.titleAccent}>{accentTitle}</span>
            ) : null}
          </h2>
          <Button
            variant="icon"
            tone="canvas"
            leadingIcon="x"
            aria-label={`Close ${title}${accentTitle ?? ''}`}
            onClick={onClose}
          />
        </div>

        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}
