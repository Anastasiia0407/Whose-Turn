import styles from './ProgressBar.module.css'

type ProgressBarProps = {
  /** 0..1. Figma: step 1 is 179/358 = 0.5, step 2 is 358/358 = 1. */
  value: number
  label: string
  className?: string
}

export function ProgressBar({ value, label, className }: ProgressBarProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)

  return (
    <div
      className={[styles.track, className].filter(Boolean).join(' ')}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
    >
      <div className={styles.fill} style={{ width: `${pct}%` }} />
    </div>
  )
}
