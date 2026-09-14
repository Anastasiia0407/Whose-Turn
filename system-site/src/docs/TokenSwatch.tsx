import { useMemo } from 'react'
import { formatColor, type TokenName } from '../tokens/resolve'
import { fromToken, refCss, refLabel, resolveRef, type ColorRef } from '../tokens/color'
import { useTokenVersion } from '../tokens/useTokenLayer'
import { ContrastReadout } from './ContrastReadout'
import { CopyableToken } from './CopyableToken'
import styles from './TokenSwatch.module.css'

/** The two surfaces every colour in this product is seen against. */
export const CANVAS: TokenName = '--color-background-primary'
export const SURFACE: TokenName = '--color-background-surface'

type TokenSwatchProps = {
  /**
   * The colour. A token, or a literal imported from the app's TypeScript.
   *
   * `null` means the system has no such colour — the swatch then renders a
   * drawn absence rather than being dropped from the list, so a palette can
   * show its own gaps in place.
   */
  color: ColorRef | null
  /**
   * The Figma variable this aliases, as written on the frame.
   *
   * Authored, not derived — the CSS layer has no primitive shelf, so nothing in
   * the running system records what a semantic token points at. This is the one
   * field on the swatch that comes from the design file rather than the code.
   */
  alias?: string
  /** What the token is for, as written on the frame. */
  description?: string
  /**
   * What to call the colour when `color` is null.
   *
   * Without it an absent swatch falls back to its alias, which names the wrong
   * thing: the reader needs to know which token is missing, not what it would
   * have pointed at.
   */
  absentName?: string
  /** Backgrounds to measure against. Defaults to the canvas and the surface. */
  against?: TokenName[]
}

/**
 * One colour: the chip, its name, the value the engine resolved, what it
 * aliases, and its measured contrast against each surface it can appear on.
 *
 * The chip is painted with a reference — `var(--token)` or the imported literal
 * — and the printed value is read back from the same declaration. The two are
 * the same fact rendered twice, so they cannot disagree.
 */
export function TokenSwatch({
  color,
  alias,
  description,
  absentName,
  against = [CANVAS, SURFACE],
}: TokenSwatchProps) {
  const version = useTokenVersion()

  const resolved = useMemo(() => {
    void version
    if (!color) return null
    const rgba = resolveRef(color)
    return rgba ? formatColor(rgba) : null
  }, [color, version])

  return (
    <div className={styles.swatch}>
      {color && resolved ? (
        <div
          className={styles.chip}
          style={{ background: refCss(color) }}
          aria-hidden="true"
        />
      ) : (
        <div className={styles.missing} aria-hidden="true" />
      )}

      <div className={styles.body}>
        {color ? (
          <CopyableToken name={refLabel(color)} />
        ) : (
          <p className={styles.absentName}>{absentName ?? alias ?? 'Unnamed'}</p>
        )}

        {resolved ? (
          <p className={styles.value}>{resolved}</p>
        ) : (
          <p className={styles.absent}>Not in the token layer</p>
        )}

        {alias ? (
          <p className={styles.alias}>
            <span className={styles.aliasLabel}>Aliases</span>
            <code>{alias}</code>
          </p>
        ) : null}

        {description ? <p className={styles.description}>{description}</p> : null}

        {color && resolved ? (
          <div className={styles.contrast}>
            {against.map((background) => (
              <ContrastReadout
                key={background}
                foreground={color}
                background={fromToken(background)}
                label={`on ${background}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
