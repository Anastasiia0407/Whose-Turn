import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { Icon } from './Icon'
import styles from './Card.module.css'

type CardProps = HTMLAttributes<HTMLDivElement> & { children?: ReactNode }

/** Plain outlined surface — the base shape everything else is cut from. */
export function Card({ children, className, ...rest }: CardProps) {
  return (
    <div className={[styles.card, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  )
}

type ChoreRowProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'onSelect'
> & {
  label: string
  selected?: boolean
  /** Rendered before the label — a MemberAvatar on member rows. */
  leading?: ReactNode
}

/**
 * Selectable row. Rendered as a real <button> so chore selection is
 * keyboard-operable, and marked with aria-pressed so the selected state is
 * exposed to assistive tech rather than being carried by fill colour alone.
 * Visually, selection is fill *plus* check icon — never colour alone.
 */
export function ChoreRow({
  label,
  selected = false,
  leading,
  className,
  type = 'button',
  ...rest
}: ChoreRowProps) {
  const classes = [
    styles.card,
    styles.row,
    selected ? styles.rowSelected : null,
    leading ? styles.rowLeading : null,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} aria-pressed={selected} {...rest}>
      {leading}
      <span className={styles.label} title={label}>
        {label}
      </span>
      {selected ? <Icon name="check" size={24} className={styles.check} /> : null}
    </button>
  )
}

type StaticRowProps = HTMLAttributes<HTMLDivElement> & {
  label: string
  leading?: ReactNode
  trailing?: ReactNode
}

/** Non-interactive row, for read-only lists such as the dice member roster. */
export function StaticRow({
  label,
  leading,
  trailing,
  className,
  ...rest
}: StaticRowProps) {
  const classes = [
    styles.card,
    styles.row,
    leading ? styles.rowLeading : null,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} {...rest}>
      {leading}
      <span className={styles.label} title={label}>
        {label}
      </span>
      {trailing}
    </div>
  )
}
