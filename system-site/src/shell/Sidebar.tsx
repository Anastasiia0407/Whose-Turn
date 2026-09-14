import { useId } from 'react'
import { NavLink } from 'react-router-dom'
import { NAV } from '../nav'
import styles from './Sidebar.module.css'

type SidebarProps = {
  /** Fired when a link is followed, so the mobile disclosure can close itself. */
  onNavigate?: () => void
}

/**
 * The persistent site map.
 *
 * Groups are labelled with `aria-labelledby` rather than real headings: the
 * page's own h1/h2/h3 chain is the document outline a screen-reader user
 * navigates by, and six sidebar headings competing with it on every page makes
 * that outline useless.
 */
export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <nav className={styles.nav} aria-label="Documentation">
      <ul className={styles.groups}>
        {NAV.map((group) => (
          <SidebarGroup key={group.label} group={group} onNavigate={onNavigate} />
        ))}
      </ul>
    </nav>
  )
}

function SidebarGroup({
  group,
  onNavigate,
}: {
  group: (typeof NAV)[number]
  onNavigate?: () => void
}) {
  const labelId = useId()

  return (
    <li className={styles.group}>
      <span className={styles.groupLabel} id={labelId}>
        {group.label}
      </span>

      {group.items.length === 0 ? (
        <p className={styles.empty}>Nothing here yet.</p>
      ) : (
        <ul className={styles.items} aria-labelledby={labelId}>
          {group.items.map((item) => (
            <li key={item.label}>
              {item.to ? (
                <NavLink
                  to={item.to}
                  end
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    [styles.link, isActive ? styles.linkActive : null]
                      .filter(Boolean)
                      .join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              ) : (
                /* Not a link and not focusable: the page does not exist. Saying
                   so is more use than a dead route that renders an apology. */
                <span className={styles.pending}>
                  {item.label}
                  <span className={styles.pendingBadge}>Not written yet</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
