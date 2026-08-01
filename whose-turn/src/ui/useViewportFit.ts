import { useEffect } from 'react'

/**
 * Keeps the layout inside the *visible* viewport, and keeps a focused field and
 * its submit button on screen together while the keyboard is open.
 *
 * Why this is needed at all:
 *
 *  - On Android, `interactive-widget=resizes-content` (set in index.html) makes
 *    the keyboard shrink the layout viewport, so `100dvh` already tells the
 *    truth and this hook measures an inset of ~0. Nothing is compensated twice.
 *  - On iOS Safari the keyboard does NOT change the layout viewport. `dvh` is
 *    unchanged, so a full-height column keeps its full height and its bottom —
 *    the CTA — sits underneath the keyboard. Only `visualViewport` can see it.
 *
 * So the inset published here is exactly "how much of the layout viewport is
 * covered by something the CSS viewport units cannot see", which is non-zero on
 * iOS and zero elsewhere.
 *
 * Deliberately NOT `position: fixed` for the bottom action: iOS Safari
 * mispositions fixed elements over the keyboard. Every CTA stays in normal flow
 * and the shell simply gets shorter.
 */

/** Below this, a viewport change is chrome collapsing, not a keyboard. */
const KEYBOARD_MIN_INSET = 120

/** iOS reports intermediate sizes mid-animation; settle before scrolling. */
const SETTLE_MS = 320

function isTextEntry(el: Element | null): el is HTMLElement {
  if (!el) return false
  const tag = el.tagName
  return (
    tag === 'INPUT' || tag === 'TEXTAREA' || (el as HTMLElement).isContentEditable
  )
}

export function useViewportFit(): void {
  useEffect(() => {
    const vv = window.visualViewport
    const root = document.documentElement
    if (!vv) return

    let settleTimer: number | undefined

    const applyInset = () => {
      // What the layout viewport thinks it has, minus what is actually visible.
      const covered = root.clientHeight - (vv.height + vv.offsetTop)
      const inset = Math.max(0, Math.round(covered))
      const open = inset >= KEYBOARD_MIN_INSET
      root.style.setProperty('--keyboard-inset', `${open ? inset : 0}px`)
      if (open) root.setAttribute('data-keyboard', 'open')
      else root.removeAttribute('data-keyboard')
      return open
    }

    /**
     * Bring the focused field AND the button that submits it into view together
     * — seeing what you typed without seeing the button that accepts it is not
     * good enough. The CTA is scrolled last so it wins if both cannot fit.
     */
    const revealFocused = () => {
      const field = document.activeElement
      if (!isTextEntry(field)) return
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const behavior: ScrollBehavior = smooth ? 'smooth' : 'auto'
      const scope =
        field.closest('form') ??
        field.closest('[role="dialog"]') ??
        document.body
      const cta =
        scope.querySelector<HTMLElement>('button[type="submit"]:not(:disabled)') ??
        scope.querySelector<HTMLElement>('button[type="submit"]')
      field.scrollIntoView({ block: 'nearest', behavior })
      cta?.scrollIntoView({ block: 'nearest', behavior })
    }

    const onViewportChange = () => {
      const open = applyInset()
      window.clearTimeout(settleTimer)
      if (open) settleTimer = window.setTimeout(revealFocused, SETTLE_MS)
    }

    const onFocusIn = (event: FocusEvent) => {
      if (!isTextEntry(event.target as Element)) return
      window.clearTimeout(settleTimer)
      // The keyboard has not opened yet on focus; wait for it to finish moving.
      settleTimer = window.setTimeout(() => {
        applyInset()
        revealFocused()
      }, SETTLE_MS)
    }

    applyInset()
    vv.addEventListener('resize', onViewportChange)
    vv.addEventListener('scroll', onViewportChange)
    document.addEventListener('focusin', onFocusIn)

    return () => {
      window.clearTimeout(settleTimer)
      vv.removeEventListener('resize', onViewportChange)
      vv.removeEventListener('scroll', onViewportChange)
      document.removeEventListener('focusin', onFocusIn)
      root.style.removeProperty('--keyboard-inset')
      root.removeAttribute('data-keyboard')
    }
  }, [])
}
