import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { OutlineContext, useOutlineState } from './outline'
import { Sidebar } from './Sidebar'
import { TableOfContents } from './TableOfContents'
import styles from './Layout.module.css'

const NAV_ID = 'site-nav'

/**
 * The persistent frame every page renders inside.
 *
 * This is a desktop reading experience that happens to be on-brand — cream,
 * ink outlines, hard shadows, Corben headings. It is deliberately NOT a phone
 * mockup: the product is 390px wide, the documentation of the product is not.
 */
export function Layout() {
  const outline = useOutlineState()
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  // A route change under the mobile disclosure must not leave it hanging open
  // over the page the reader just asked for.
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <OutlineContext.Provider value={outline}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>

      <header className={styles.mobileBar}>
        <Brand />
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-controls={NAV_ID}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </header>

      <div className={styles.shell}>
        <aside
          id={NAV_ID}
          className={[styles.sidebar, menuOpen ? styles.sidebarOpen : null]
            .filter(Boolean)
            .join(' ')}
        >
          <div className={styles.sidebarBrand}>
            <Brand />
          </div>
          <Sidebar onNavigate={() => setMenuOpen(false)} />
        </aside>

        <main id="main-content" className={styles.main} tabIndex={-1}>
          <div className={styles.content}>
            <Outlet />
          </div>
        </main>

        <div className={styles.tocColumn}>
          <TableOfContents />
        </div>
      </div>
    </OutlineContext.Provider>
  )
}

function Brand() {
  return (
    <Link to="/" className={styles.brand}>
      <span className={styles.brandName}>
        Whose <span className={styles.brandAccent}>Turn?</span>
      </span>
      <span className={styles.brandSuffix}>Design System</span>
    </Link>
  )
}
