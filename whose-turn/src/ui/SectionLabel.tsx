import type { ReactNode } from 'react'
import styles from './SectionLabel.module.css'

type SectionLabelProps = {
  children: ReactNode
  /** `p` for a standalone section heading, `label` when it labels a field. */
  as?: 'p' | 'label'
  htmlFor?: string
  visuallyHidden?: boolean
  className?: string
}

export function SectionLabel({
  children,
  as = 'p',
  htmlFor,
  visuallyHidden = false,
  className,
}: SectionLabelProps) {
  const classes = [
    styles.label,
    visuallyHidden ? styles.visuallyHidden : null,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (as === 'label') {
    return (
      <label className={classes} htmlFor={htmlFor}>
        {children}
      </label>
    )
  }

  return <p className={classes}>{children}</p>
}
