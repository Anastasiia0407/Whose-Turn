import { useEffect, useRef, type ReactNode } from 'react'
import { useOutline } from '../shell/outline'
import { figmaUrl } from '../figma'
import { slug } from './slug'
import styles from './Page.module.css'

type PageProps = {
  title: string
  /** The standfirst. One paragraph, as written in the frame. */
  lede?: ReactNode
  /** Node id of the frame this page documents, e.g. `364:271`. */
  figmaNode?: string
  children: ReactNode
}

/**
 * One documentation page.
 *
 * The "Open in Figma" link is built from the node map, so a page either points
 * at the exact frame it documents or shows no link at all. There is no default
 * and no file-level fallback: a link that lands on the wrong frame is worse
 * than no link, because it is believed.
 */
export function Page({ title, lede, figmaNode, children }: PageProps) {
  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <h1>{title}</h1>
        {lede ? <p className={styles.lede}>{lede}</p> : null}
        {figmaNode ? (
          <a
            className={styles.figmaLink}
            href={figmaUrl(figmaNode)}
            target="_blank"
            rel="noreferrer noopener"
          >
            Open in Figma
            <span className={styles.figmaNode}>{figmaNode}</span>
          </a>
        ) : null}
      </header>
      {children}
    </article>
  )
}

type SectionProps = {
  title: string
  id?: string
  children: ReactNode
}

/** A top-level section. Renders an h2 and registers with the page outline. */
export function Section({ title, id, children }: SectionProps) {
  const headingId = id ?? slug(title)
  const ref = useOutlineRegistration(headingId, title, 2)

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId} ref={ref} className={styles.sectionHeading}>
        {title}
      </h2>
      {children}
    </section>
  )
}

/** A nested section. Renders an h3 and indents in the table of contents. */
export function SubSection({ title, id, children }: SectionProps) {
  const headingId = id ?? slug(title)
  const ref = useOutlineRegistration(headingId, title, 3)

  return (
    <section className={styles.subSection} aria-labelledby={headingId}>
      <h3 id={headingId} ref={ref}>
        {title}
      </h3>
      {children}
    </section>
  )
}

function useOutlineRegistration(id: string, label: string, level: 2 | 3) {
  const { register } = useOutline()
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    return register({ id, label, level, element })
  }, [register, id, label, level])

  return ref
}

/** Body copy inside a section. */
export function Prose({ children }: { children: ReactNode }) {
  return <p className={styles.prose}>{children}</p>
}
