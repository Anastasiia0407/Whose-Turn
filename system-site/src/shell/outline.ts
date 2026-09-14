import { createContext, useCallback, useContext, useState } from 'react'

/**
 * The "on this page" outline.
 *
 * Sections register themselves as they mount rather than the table of contents
 * scraping the DOM. Scraping needs a timing guess — run it too early and the
 * page is empty, too late and it flickers — whereas registration is exact and
 * survives a page swap without a cleanup pass.
 */

export type OutlineEntry = {
  id: string
  label: string
  /** 2 for a section, 3 for a subsection. Mirrors the heading level rendered. */
  level: 2 | 3
  element: HTMLElement
}

export type OutlineApi = {
  entries: OutlineEntry[]
  /** Returns its own cleanup. */
  register: (entry: OutlineEntry) => () => void
}

const NOOP_OUTLINE: OutlineApi = {
  entries: [],
  register: () => () => {},
}

export const OutlineContext = createContext<OutlineApi>(NOOP_OUTLINE)

export function useOutline(): OutlineApi {
  return useContext(OutlineContext)
}

function byDocumentPosition(a: OutlineEntry, b: OutlineEntry): number {
  const relation = a.element.compareDocumentPosition(b.element)
  if (relation & Node.DOCUMENT_POSITION_FOLLOWING) return -1
  if (relation & Node.DOCUMENT_POSITION_PRECEDING) return 1
  return 0
}

/** Owns the registry. Rendered once, by the layout. */
export function useOutlineState(): OutlineApi {
  const [entries, setEntries] = useState<OutlineEntry[]>([])

  const register = useCallback((entry: OutlineEntry) => {
    setEntries((previous) =>
      [...previous.filter((item) => item.id !== entry.id), entry].sort(
        byDocumentPosition,
      ),
    )
    return () => {
      setEntries((previous) => previous.filter((item) => item.id !== entry.id))
    }
  }, [])

  return { entries, register }
}
