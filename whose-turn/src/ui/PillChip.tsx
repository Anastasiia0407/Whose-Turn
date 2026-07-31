import type { HTMLAttributes, ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import styles from './PillChip.module.css'

export type ChipTone = 'success' | 'surface' | 'canvas'

type PillChipProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: ChipTone
  /** Trailing icon — the check on the selected-chore chip (node 86:93). */
  trailingIcon?: IconName
  uppercase?: boolean
  children: ReactNode
}

const TONE_CLASS: Record<ChipTone, string> = {
  success: styles.toneSuccess,
  surface: styles.toneSurface,
  canvas: styles.toneCanvas,
}

export function PillChip({
  tone = 'success',
  trailingIcon,
  uppercase = false,
  children,
  className,
  ...rest
}: PillChipProps) {
  const classes = [
    styles.chip,
    TONE_CLASS[tone],
    uppercase ? styles.uppercase : null,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes} {...rest}>
      {/* Full text carried on `title` so truncation never hides information. */}
      <span
        className={styles.text}
        title={typeof children === 'string' ? children : undefined}
      >
        {children}
      </span>
      {trailingIcon ? (
        <Icon name={trailingIcon} size={24} className={styles.icon} />
      ) : null}
    </span>
  )
}
