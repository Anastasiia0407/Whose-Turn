import { useCallback, useLayoutEffect, useRef, useState } from 'react'

/**
 * Keeps a scroller's top/bottom padding equal to the heights of the two opaque
 * blocks pinned over it, so the first and last item can each be scrolled fully
 * clear of them.
 *
 * Measured rather than hard-coded from Figma on purpose. The blocks are built
 * from real components whose heights do not always match the frame — the
 * section label renders 12px against a 22px box in the file, and the buttons
 * render 62 against 56 — so a constant taken off the frame would leave the
 * first or last row permanently short of clearing. Measuring makes the
 * invariant hold whatever those components do, and it also survives the header
 * changing height when the wordmark scales below 360px.
 */
export function useBlockInsets() {
  const [insets, setInsets] = useState({ top: 0, bottom: 0 })
  const topEl = useRef<HTMLElement | null>(null)
  const bottomEl = useRef<HTMLElement | null>(null)
  const observer = useRef<ResizeObserver | null>(null)

  const measure = useCallback(() => {
    setInsets((prev) => {
      const top = topEl.current?.offsetHeight ?? 0
      const bottom = bottomEl.current?.offsetHeight ?? 0
      // Bail out when nothing moved, so the observer cannot loop.
      if (prev.top === top && prev.bottom === bottom) return prev
      return { top, bottom }
    })
  }, [])

  const attach = useCallback(
    (which: 'top' | 'bottom') => (node: HTMLElement | null) => {
      const ref = which === 'top' ? topEl : bottomEl
      if (ref.current && observer.current) observer.current.unobserve(ref.current)
      ref.current = node
      if (!node) return
      if (!observer.current) observer.current = new ResizeObserver(measure)
      observer.current.observe(node)
      measure()
    },
    [measure],
  )

  useLayoutEffect(() => {
    measure()
    return () => {
      observer.current?.disconnect()
      observer.current = null
    }
  }, [measure])

  return { insets, topRef: attach('top'), bottomRef: attach('bottom') }
}
