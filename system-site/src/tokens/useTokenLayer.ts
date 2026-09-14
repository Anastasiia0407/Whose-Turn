import { useMemo, useSyncExternalStore } from 'react'
import { listCustomProperties, type TokenName } from './resolve'

/**
 * Keeps the documentation live against the token layer.
 *
 * `tokens.css` is imported through the `@ds` alias, so editing it in the app
 * triggers a Vite CSS hot update — which swaps the <style> element rather than
 * re-rendering React. Without this, a token change would repaint the shell but
 * leave every printed value stale, and the site would quietly start lying.
 *
 * A MutationObserver over <head> catches the swap and bumps a version, which is
 * the only thing components depend on. Reads stay synchronous and on-demand.
 */

let version = 0
const listeners = new Set<() => void>()
let observer: MutationObserver | null = null
let scheduled = false

function bump(): void {
  if (scheduled) return
  scheduled = true
  // Coalesce: one CSS hot update fires several mutations.
  //
  // setTimeout, not requestAnimationFrame. rAF is paused in a background or
  // hidden tab, so a token edit made while the documentation was not the
  // frontmost tab would repaint the swatches — CSS applies regardless — but
  // leave every printed value showing the old one. The page would then be
  // displaying a colour and a hex that disagree, which is the exact failure
  // this whole mechanism exists to prevent.
  setTimeout(() => {
    scheduled = false
    version += 1
    for (const listener of listeners) listener()
  }, 0)
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  if (!observer) {
    observer = new MutationObserver(bump)
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['href'],
    })
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      observer?.disconnect()
      observer = null
    }
  }
}

function getSnapshot(): number {
  return version
}

/**
 * A counter that changes whenever the loaded stylesheets change.
 *
 * Depend on this anywhere a token value is read during render, so the read is
 * repeated after a hot update.
 */
export function useTokenVersion(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

/** Every custom property currently declared on `:root`, discovered live. */
export function useCustomProperties(): TokenName[] {
  const tokenVersion = useTokenVersion()
  return useMemo(() => {
    // The version is the invalidation key, not an input. Reading it here is
    // what makes that explicit to both the reader and the linter — the answer
    // genuinely changes when the stylesheets change, and only then.
    void tokenVersion
    return listCustomProperties()
  }, [tokenVersion])
}
