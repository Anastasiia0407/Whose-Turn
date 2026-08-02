import type { CSSProperties } from 'react'
import styles from './MemberAvatar.module.css'

type MemberAvatarProps = {
  /**
   * The member's STORED colour (`members.color`), assigned once at creation.
   * Never recomputed from array position or sort_order at render time — doing
   * that reshuffles everyone's identity as soon as a member is removed.
   */
  color: string
  /** Full name; the initial is derived from it. Omit for the plain dot. */
  name?: string
  /** sm 20 (dice chips), md 24 (onboarding), lg 32 (sheets). */
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function initialOf(name: string): string {
  return [...name.trim()][0] ?? ''
}

export function MemberAvatar({
  color,
  name,
  size = 'lg',
  className,
}: MemberAvatarProps) {
  const style = { '--member-color': color } as CSSProperties

  return (
    <span
      className={[styles.avatar, styles[size], className].filter(Boolean).join(' ')}
      style={style}
      aria-hidden="true"
    >
      {/* Only the 32px avatar carries a glyph; the 24 and 20 are plain dots in
          their frames (145:25 and 153:37 have no text child). */}
      {size === 'lg' && name ? initialOf(name) : null}
    </span>
  )
}
