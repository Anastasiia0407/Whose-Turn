import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'icon'
export type ButtonTone = 'surface' | 'canvas' | 'accent' | 'danger'

type BaseProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

type ButtonProps = BaseProps & {
  variant?: ButtonVariant
  /** Icon-button fill. Ignored by primary/secondary, which have fixed fills. */
  tone?: ButtonTone
  /** Leading icon, as on "＋ Add a new chore" (node 65:35). */
  leadingIcon?: IconName
  children?: ReactNode
  /**
   * Required for `variant="icon"` — the icon is decorative, so the button
   * needs its own accessible name.
   */
  'aria-label'?: string
}

const TONE_CLASS: Record<ButtonTone, string> = {
  surface: styles.toneSurface,
  canvas: styles.toneCanvas,
  accent: styles.toneAccent,
  danger: styles.toneDanger,
}

export function Button({
  variant = 'primary',
  tone = 'surface',
  leadingIcon,
  children,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isIcon = variant === 'icon'

  const classes = [
    styles.button,
    styles[variant],
    isIcon ? TONE_CLASS[tone] : null,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...rest}>
      {leadingIcon ? <Icon name={leadingIcon} size={24} /> : null}
      {children}
    </button>
  )
}
