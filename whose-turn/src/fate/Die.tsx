import { useMemo } from 'react'
import blankDie from '../assets/illustrations/die-iso-blank.svg?raw'
import {
  FRONT_LEFT,
  FRONT_RIGHT,
  LAYOUT,
  TOP,
  faceTransform,
  sideValues,
  type FaceBasis,
} from './dieFaces'
import styles from './Die.module.css'

type DieProps = {
  /** The member's stored colour. */
  color: string
  /** 1..6, or null before the roll settles. */
  value: number | null
  tumbling: boolean
  highlighted: boolean
  label: string
  /** Resting tilt so the dice never settle in a neat grid. */
  settleAngle: number
}

const PIP_FILL = '#302111'
/** Radius in unit grid space; the face basis skews it into perspective. */
const PIP_R = 0.34

function Face({ basis, value }: { basis: FaceBasis; value: number }) {
  return (
    <g transform={faceTransform(basis)}>
      {LAYOUT[value].map(([i, j], k) => (
        <circle key={k} cx={i} cy={j} r={PIP_R} fill={PIP_FILL} />
      ))}
    </g>
  )
}

/**
 * A die in its member's colour — the real isometric art from Figma (node
 * 157:71 / 104:476), exported via MCP with its pips stripped so all three
 * visible faces can be drawn programmatically.
 *
 * Pips are unit circles inside each face's basis, so the transform skews them
 * into that face's plane and they render as elongated ovals in perspective.
 * The TOP face carries the value that counts; the two side faces are plausible
 * — never the top value and never its opposite, since opposite faces sum to 7.
 */
export function Die({
  color,
  value,
  tumbling,
  highlighted,
  label,
  settleAngle,
}: DieProps) {
  // The export's body fill is amber; swap it for this member's colour.
  const body = useMemo(() => blankDie.replace(/#E8A838/gi, color), [color])

  const top = value ?? 5
  const [left, right] = sideValues(top)

  return (
    <div
      className={[
        styles.die,
        tumbling ? styles.tumbling : null,
        highlighted ? styles.highlighted : null,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ '--settle-angle': `${settleAngle}deg` } as React.CSSProperties}
      role="img"
      aria-label={value ? `${label} rolled ${value}` : `${label} rolling`}
    >
      <div className={styles.inner}>
        <div
          className={styles.body}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: body }}
        />
        <svg className={styles.pips} viewBox="0 0 149 161" aria-hidden="true">
          <Face basis={TOP} value={top} />
          <Face basis={FRONT_LEFT} value={left} />
          <Face basis={FRONT_RIGHT} value={right} />
        </svg>
      </div>
    </div>
  )
}
