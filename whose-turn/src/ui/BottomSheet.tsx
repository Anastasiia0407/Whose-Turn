import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Button } from './Button'
import { useBlockInsets } from './useBlockInsets'
import styles from './BottomSheet.module.css'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

type BottomSheetProps = {
  open: boolean
  onClose: () => void
  /** Sheet heading. Pass `accentTitle` to render a second, terracotta word. */
  title: string
  accentTitle?: string
  /**
   * Opt in to the fixed-frame layout: the handle and header stop taking part in
   * the flow and become an opaque block pinned over the content, so a list
   * inside can scroll BEHIND them instead of stopping at the header's edge.
   *
   * Opt-in on purpose — the new-chore and fate-mode sheets do not get this
   * pattern and must keep laying out exactly as they do now.
   *
   * The measured height of that block is published as `--sheet-top-block` for
   * the content to pad against.
   */
  framed?: boolean
  /**
   * Extra control rendered immediately left of the close button, inside the
   * header's button group. Only the members sheet uses one (node 251:147).
   */
  headerAction?: ReactNode
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
  framed = false,
  headerAction,
  children,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const titleId = useId()
  // Same hook home uses. Only the top slot is needed here; the content owns its
  // own bottom block and measures that itself.
  const { insets, topRef } = useBlockInsets()

  /**
   * `onClose` is read through a ref so the effect below never depends on its
   * identity.
   *
   * It used to: the effect depended on a `useCallback` keyed on `onClose`, and
   * callers pass a function defined in their render body. Every parent
   * re-render therefore produced a new identity, tore the trap down and set it
   * up again — and the setup MOVES FOCUS. Typing re-renders the parent on every
   * keystroke, so every keystroke pulled focus out of the field and onto the
   * sheet's first button.
   *
   * The rule this encodes: an effect that manages focus must not depend on
   * callback identity. Do not "fix" a future recurrence by wrapping the
   * caller's handler in useCallback — that makes correctness depend on every
   * call site remembering.
   */
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return

    returnFocusRef.current = document.activeElement as HTMLElement | null

    // Defined inside the effect so it has no identity outside it.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
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
    }

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    // Move focus into the sheet so keyboard users land inside it. Runs exactly
    // once per open, which is the whole point of the dependency list below.
    const firstFocusable =
      sheetRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? sheetRef.current
    firstFocusable?.focus()

    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', handleKeyDown)
      returnFocusRef.current?.focus()
    }
  }, [open])

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
        className={[styles.sheet, framed ? styles.framed : null]
          .filter(Boolean)
          .join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={
          framed
            ? ({ '--sheet-top-block': `${insets.top}px` } as React.CSSProperties)
            : undefined
        }
      >
        {/* Handle and header always share a wrapper so the framed variant has a
            single contiguous block to pin — a gap between them would let rows
            show through. Unframed, the wrapper is unstyled and the flow is
            exactly as before. */}
        <div className={styles.topBlock} ref={framed ? topRef : undefined}>
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
            {/* Node 251:147 — a 104x44 group flush with the header's right
                edge: the optional action at x=0 and the close button at x=60,
                i.e. two 44s with a 16 gap. */}
            <div className={styles.headerActions}>
              {headerAction}
              <Button
                variant="icon"
                tone="canvas"
                leadingIcon="x"
                aria-label={`Close ${title}${accentTitle ?? ''}`}
                onClick={onClose}
              />
            </div>
          </div>
        </div>

        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}
