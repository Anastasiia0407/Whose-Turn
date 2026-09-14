import { useMemo } from 'react'
import { resolveRef, refLabel, type ColorRef } from '../tokens/color'
import { contrastRatio, formatRatio } from '../tokens/contrast'
import { useTokenVersion } from '../tokens/useTokenLayer'
import styles from './ContrastReadout.module.css'

/** WCAG 2.2 AA for normal-size text. The threshold every page marks against. */
export const AA_NORMAL = 4.5

type ContrastReadoutProps = {
  foreground: ColorRef
  background: ColorRef
  /** What the pairing is, e.g. "on canvas". Shown beside the ratio. */
  label: string
}

/**
 * One measured contrast ratio, with a pass/fail marker at 4.5:1.
 *
 * Both colours are resolved from the running token layer and the ratio is
 * computed here, every render. No ratio on this site is written down — the
 * numbers the Figma frames quote are checkable against these rather than
 * reproduced by them, which is the point.
 *
 * The verdict is carried by the word PASS or FAIL as well as by the fill, so it
 * survives being read by someone who cannot separate the two colours.
 */
export function ContrastReadout({
  foreground,
  background,
  label,
}: ContrastReadoutProps) {
  const version = useTokenVersion()

  const reading = useMemo(() => {
    void version
    const fg = resolveRef(foreground)
    const bg = resolveRef(background)
    if (!fg || !bg) return null
    return {
      ratio: contrastRatio(fg, bg),
      // A colour measured against itself is 1:1 by definition. Marking that
      // "Fail" is noise, and eleven meaningless failures on a page make the two
      // real ones invisible.
      identical: fg.r === bg.r && fg.g === bg.g && fg.b === bg.b && fg.a === bg.a,
    }
  }, [foreground, background, version])

  if (reading === null) {
    return (
      <span className={styles.readout}>
        <span className={styles.label}>{label}</span>
        <span className={styles.unresolved}>Unresolved</span>
      </span>
    )
  }

  if (reading.identical) {
    return (
      <span className={styles.readout}>
        <span className={styles.label}>{label}</span>
        <span className={styles.unresolved}>Same colour — not a pairing</span>
      </span>
    )
  }

  const { ratio } = reading
  const passes = ratio >= AA_NORMAL

  return (
    <span className={styles.readout}>
      <span className={styles.label}>{label}</span>
      <span className={styles.ratio}>{formatRatio(ratio)}</span>
      <span
        className={[styles.verdict, passes ? styles.pass : styles.fail].join(' ')}
      >
        {passes ? 'Pass' : 'Fail'}
      </span>
      <span className="visually-hidden">
        {refLabel(foreground)} on {refLabel(background)} measures{' '}
        {formatRatio(ratio)}, which {passes ? 'meets' : 'does not meet'} WCAG AA
        for normal text at {AA_NORMAL}:1.
      </span>
    </span>
  )
}
