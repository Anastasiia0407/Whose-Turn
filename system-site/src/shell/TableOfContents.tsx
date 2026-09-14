import { useEffect, useRef, useState } from 'react'
import { useOutline } from './outline'
import styles from './TableOfContents.module.css'

/**
 * "On this page", sticky beside the content on wide viewports.
 *
 * Hidden below 1280px in CSS rather than unmounted, so the sections it tracks
 * do not re-register on every resize.
 */
export function TableOfContents() {
  const { entries } = useOutline()
  const activeId = useActiveHeading(entries.map((entry) => entry.element))

  if (entries.length === 0) return null

  return (
    <nav className={styles.toc} aria-label="On this page">
      <p className={styles.title}>On this page</p>
      <ul className={styles.list}>
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className={[
                styles.link,
                entry.level === 3 ? styles.nested : null,
                entry.id === activeId ? styles.active : null,
              ]
                .filter(Boolean)
                .join(' ')}
              aria-current={entry.id === activeId ? 'location' : undefined}
            >
              {entry.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/**
 * The heading nearest the top of the viewport.
 *
 * Tracked with an IntersectionObserver rather than a scroll handler so it costs
 * nothing while the page is still. The top margin pulls the trip line down to
 * just under the sticky mobile bar; the bottom margin stops a heading counting
 * as active once it has scrolled most of the way out.
 */
function useActiveHeading(elements: HTMLElement[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null)

  // `elements` is a fresh array on every render, so it cannot be a dependency.
  // The set of heading ids is what actually changes; the array is read through
  // a ref so the observer is rebuilt when the page changes and not before.
  const elementsRef = useRef(elements)
  elementsRef.current = elements
  const key = elements.map((element) => element.id).join('|')

  useEffect(() => {
    const observed = elementsRef.current
    if (observed.length === 0) {
      setActiveId(null)
      return
    }

    const visible = new Set<string>()

    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          if (record.isIntersecting) visible.add(record.target.id)
          else visible.delete(record.target.id)
        }
        // Keep document order, so the topmost visible heading wins.
        const first = observed.find((element) => visible.has(element.id))
        if (first) setActiveId(first.id)
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    )

    for (const element of observed) observer.observe(element)
    return () => observer.disconnect()
  }, [key])

  return activeId
}
