import { useMemo } from 'react'
import { exists, resolveComputed, type TokenName } from '../tokens/resolve'
import { useTokenVersion } from '../tokens/useTokenLayer'
import { CopyableToken } from './CopyableToken'
import styles from './TypeSpecimen.module.css'

type TypeSpecimenProps = {
  /** The style name between `--type-` and its axis: `h1`, `body-bold`, … */
  group: string
  /** The line to set. Use the words the design file sets it in. */
  sample: string
}

const AXES = ['family', 'weight', 'size', 'line'] as const
type Axis = (typeof AXES)[number]

const CSS_PROPERTY: Record<Axis, 'fontFamily' | 'fontWeight' | 'fontSize' | 'lineHeight'> =
  {
    family: 'fontFamily',
    weight: 'fontWeight',
    size: 'fontSize',
    line: 'lineHeight',
  }

const AXIS_LABEL: Record<Axis, string> = {
  family: 'Family',
  weight: 'Weight',
  size: 'Size',
  line: 'Line height',
}

/**
 * A live line of text in a real type token, with the values beside it.
 *
 * The specimen is styled by pointing CSS at the tokens — the sample below is
 * literally `font-size: var(--type-h1-size)`. The spec list is then read back
 * off a probe element, so it reports what the browser did rather than what this
 * file expected. If a font fails to load, the family column says so.
 *
 * Axes a style does not declare are omitted rather than defaulted. The sheet
 * title declares a size and nothing else, and inventing a weight for it would
 * put a value in the documentation that exists nowhere in the system.
 */
export function TypeSpecimen({ group, sample }: TypeSpecimenProps) {
  const version = useTokenVersion()

  const spec = useMemo(() => {
    void version
    return AXES.map((axis) => {
      const token = `--type-${group}-${axis}` as TokenName
      if (!exists(token)) return null
      return {
        axis,
        token,
        value: resolveComputed(token, CSS_PROPERTY[axis]),
      }
    }).filter((entry) => entry !== null)
  }, [group, version])

  const style = Object.fromEntries(
    spec.map(({ axis, token }) => [CSS_PROPERTY[axis], `var(${token})`]),
  )

  if (spec.length === 0) {
    return (
      <div className={styles.specimen}>
        <p className={styles.absent}>
          No <code>--type-{group}-*</code> tokens in the token layer.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.specimen}>
      <p className={styles.sample} style={style}>
        {sample}
      </p>
      <dl className={styles.spec}>
        {spec.map(({ axis, token, value }) => (
          <div key={axis} className={styles.specItem}>
            <dt className={styles.specTerm}>{AXIS_LABEL[axis]}</dt>
            <dd className={styles.specValue}>{value ?? '—'}</dd>
            <dd className={styles.specToken}>
              <CopyableToken name={token} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
