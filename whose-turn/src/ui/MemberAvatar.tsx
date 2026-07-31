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
  size?: 'sm' | 'md'
  className?: string
}

function initialOf(name: string): string {
  return [...name.trim()][0] ?? ''
}

export function MemberAvatar({
  color,
  name,
  size = 'md',
  className,
}: MemberAvatarProps) {
  const style = { '--member-color': color } as CSSProperties

  return (
    <span
      className={[styles.avatar, styles[size], className].filter(Boolean).join(' ')}
      style={style}
      aria-hidden="true"
    >
      {size === 'md' && name ? initialOf(name) : null}
    </span>
  )
}
