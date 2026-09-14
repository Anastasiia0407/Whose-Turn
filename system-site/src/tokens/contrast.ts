/**
 * WCAG 2.2 contrast maths.
 *
 * The ratios this produces are the ones the Foundations frames quote — white on
 * the primary CTA at 3.86:1, the disabled label at 1.42:1 — so a reader can
 * check the written number against a computed one rather than trusting either.
 */

import type { Rgba } from './resolve'

/** WCAG relative luminance, sRGB. */
function relativeLuminance({ r, g, b }: Rgba): number {
  const channel = (value: number) => {
    const c = value / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/**
 * Flatten a translucent colour onto an opaque one.
 *
 * A contrast ratio is only defined between two opaque colours. The scrim is the
 * one token in the layer with alpha, and reporting its ratio without
 * compositing would be a made-up number.
 */
export function composite(foreground: Rgba, background: Rgba): Rgba {
  const a = foreground.a
  if (a >= 1) return foreground
  return {
    r: foreground.r * a + background.r * (1 - a),
    g: foreground.g * a + background.g * (1 - a),
    b: foreground.b * a + background.b * (1 - a),
    a: 1,
  }
}

/** Contrast ratio, 1–21. Both colours are composited onto `background` first. */
export function contrastRatio(foreground: Rgba, background: Rgba): number {
  const fg = relativeLuminance(composite(foreground, background))
  const bg = relativeLuminance(composite(background, background))
  const lighter = Math.max(fg, bg)
  const darker = Math.min(fg, bg)
  return (lighter + 0.05) / (darker + 0.05)
}

export type ContrastLevel = 'AAA' | 'AA' | 'AA Large' | 'Fail'

/**
 * The highest WCAG level a ratio clears for normal-size text.
 *
 * "AA Large" means it passes only at 18.66px bold or 24px regular — which is
 * why the avatar initial and the CTA label are reported separately in the
 * Foundations copy.
 */
export function contrastLevel(ratio: number): ContrastLevel {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'AA Large'
  return 'Fail'
}

export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`
}
