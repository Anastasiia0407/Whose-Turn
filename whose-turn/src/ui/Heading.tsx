import styles from './Heading.module.css'

type HeadingProps = {
  /** The terracotta phrase. Rendered first or last per `accentPosition`. */
  accent: string
  /** The dark phrase. */
  rest: string
  accentPosition?: 'leading' | 'trailing'
  /**
   * REQUIRED, deliberately. Each frame specifies its own wordmark size, and a
   * default here is exactly how one screen's size silently leaks into another.
   * `h1` is the Heading/H1 token (Corben Bold 30/40) used by home and
   * onboarding; `display` is the larger centred treatment.
   * Login does NOT use this component — its wordmark scales with viewport width
   * on its own reference canvas, so the two can never affect each other.
   */
  size: 'h1' | 'display'
  className?: string
}

/**
 * Two-tone headline. Kept as one <h1> so screen readers announce a single
 * heading rather than two fragments.
 */
export function Heading({
  accent,
  rest,
  accentPosition = 'leading',
  size,
  className,
}: HeadingProps) {
  const classes = [
    styles.heading,
    size === 'display' ? styles.display : null,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <h1 className={classes}>
      {accentPosition === 'leading' ? (
        <>
          <span className={styles.accent}>{accent}</span>
          {rest}
        </>
      ) : (
        <>
          {rest}
          <span className={styles.accent}>{accent}</span>
        </>
      )}
    </h1>
  )
}

type SubtitleProps = {
  children: React.ReactNode
  size?: 'body' | 'display'
  className?: string
}

export function Subtitle({
  children,
  size = 'body',
  className,
}: SubtitleProps) {
  return (
    <p
      className={[
        styles.subtitle,
        size === 'display' ? styles.subtitleDisplay : null,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </p>
  )
}
