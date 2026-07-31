import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { Button } from '../ui'
import styles from './SwipeRow.module.css'

/** Distance the row travels to expose the 44px control plus its 16px gap. */
export const REVEAL_DISTANCE = 60
const OPEN_THRESHOLD = 24
/** Past this the gesture is a swipe, and the row must not also select. */
const DRAG_SLOP = 6

type SwipeRowProps = {
  children: ReactNode
  /** Accessible name for the destructive control, e.g. "Delete Cook dinner". */
  deleteLabel: string
  onRequestDelete: () => void
  disabled?: boolean
  /** True when this row is the one currently revealed. */
  open: boolean
  /** Ask the owner to open this row (closing any other) or close it. */
  onOpenChange: (open: boolean) => void
  /**
   * Make the row itself focusable. Needed when the content is not interactive
   * (a member row is a plain div), so the keyboard path to delete still works.
   */
  focusableRow?: boolean
  rowLabel?: string
}

/**
 * Row with a swipe-to-reveal delete control — Figma 70:8 and 76:67.
 *
 * The row TRANSLATES left and the red control is revealed to its right, with
 * the row's leading edge clipped by its own track. That clipping is intentional
 * for this reveal; the resting state is never clipped.
 *
 * One implementation covers touch and mouse via Pointer Events. A drag past the
 * slop threshold suppresses the row's own click, so swiping never also selects.
 * Delete/Backspace opens it from the keyboard, Escape closes.
 */
export function SwipeRow({
  children,
  deleteLabel,
  onRequestDelete,
  disabled = false,
  open,
  onOpenChange,
  focusableRow = false,
  rowLabel,
}: SwipeRowProps) {
  const startX = useRef<number | null>(null)
  const dragged = useRef(false)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    setOffset(open ? -REVEAL_DISTANCE : 0)
  }, [open])

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (disabled) return
      startX.current = event.clientX
      dragged.current = false
    },
    [disabled],
  )

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (startX.current === null) return
      const dx = event.clientX - startX.current
      if (Math.abs(dx) > DRAG_SLOP) dragged.current = true
      // Follow the finger/cursor, clamped to the reveal distance.
      const base = open ? -REVEAL_DISTANCE : 0
      setOffset(Math.max(-REVEAL_DISTANCE, Math.min(0, base + dx)))
    },
    [open],
  )

  const endDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (startX.current === null) return
      const dx = event.clientX - startX.current
      startX.current = null
      if (dx < -OPEN_THRESHOLD) onOpenChange(true)
      else if (dx > OPEN_THRESHOLD) onOpenChange(false)
      else setOffset(open ? -REVEAL_DISTANCE : 0)
    },
    [open, onOpenChange],
  )

  // A drag must not also trigger the row's select action.
  const onClickCapture = useCallback((event: React.MouseEvent) => {
    if (dragged.current) {
      event.preventDefault()
      event.stopPropagation()
      dragged.current = false
    }
  }, [])

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault()
        onOpenChange(true)
      } else if (event.key === 'Escape' && open) {
        event.preventDefault()
        onOpenChange(false)
      }
    },
    [disabled, open, onOpenChange],
  )

  return (
    <div className={styles.track}>
      <div
        className={styles.wrap}
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onKeyDown={onKeyDown}
        tabIndex={focusableRow ? 0 : undefined}
        role={focusableRow ? 'group' : undefined}
        aria-label={focusableRow ? rowLabel : undefined}
      >
        <div className={styles.slider}>{children}</div>
        <div className={styles.delete}>
          <Button
            variant="icon"
            tone="danger"
            leadingIcon="trash"
            aria-label={deleteLabel}
            aria-hidden={!open}
            tabIndex={open ? 0 : -1}
            disabled={disabled || !open}
            onClick={onRequestDelete}
          />
        </div>
      </div>
    </div>
  )
}
