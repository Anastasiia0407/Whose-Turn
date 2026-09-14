import { useMemo } from 'react'
import { rawValue, resolveLength, type TokenName } from '../tokens/resolve'
import { useTokenVersion } from '../tokens/useTokenLayer'
import { CopyableToken } from './CopyableToken'
import styles from './ScaleRow.module.css'

type ScaleRowProps = {
  name: TokenName
  /** `bar` for spacing, `box` for a radius, which has to be seen as a corner. */
  render?: 'bar' | 'box'
  description?: string
}

/**
 * One step of a scale, drawn at its real size.
 *
 * The bar's width is `var(--token)` — not a number this file computed and not a
 * number typed into the markup. A reader measuring the bar on screen is
 * measuring the token. The px figure beside it is read back from the same
 * declaration, so the drawing and the caption cannot drift apart.
 */
export function ScaleRow({ name, render = 'bar', description }: ScaleRowProps) {
  const version = useTokenVersion()

  const reading = useMemo(() => {
    void version
    return { px: resolveLength(name), declared: rawValue(name) }
  }, [name, version])

  return (
    <div className={styles.row}>
      <div className={styles.name}>
        <CopyableToken name={name} />
      </div>

      <div className={styles.figure}>
        {reading.px === null ? (
          <span className={styles.absent}>
            {reading.declared ? 'Not a length.' : 'Not in the token layer.'}
          </span>
        ) : render === 'box' ? (
          <span
            className={styles.box}
            style={{ borderRadius: `var(${name})` }}
            aria-hidden="true"
          />
        ) : (
          <span
            className={styles.bar}
            // min() keeps a large step inside the column at 360px instead of
            // pushing the page sideways.
            style={{ width: `min(var(${name}), 100%)` }}
            aria-hidden="true"
          />
        )}
      </div>

      <p className={styles.value}>
        {reading.px === null ? '—' : `${reading.px}px`}
      </p>

      {description ? <p className={styles.description}>{description}</p> : null}
    </div>
  )
}
