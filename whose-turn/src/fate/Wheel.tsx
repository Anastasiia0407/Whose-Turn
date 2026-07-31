import { INK } from '../tokens'
import { sectorAngle } from './engine'
import type { Member } from '../data'
import styles from './Wheel.module.css'

type WheelProps = {
  members: Member[]
  /** Sector ring as member indices, from buildSectors(). */
  sectors: number[]
  /** Current rotation in degrees. */
  rotation: number
  /** Seconds; 0 means snap with no transition (reduced motion). */
  durationSeconds: number
}

const SIZE = 350
const R = SIZE / 2
const HUB = 58

function wedgePath(startDeg: number, endDeg: number): string {
  // -90 puts 0deg at 12 o'clock, matching the pointer.
  const toXY = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180
    return [R + R * Math.cos(rad), R + R * Math.sin(rad)]
  }
  const [x1, y1] = toXY(startDeg)
  const [x2, y2] = toXY(endDeg)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0
  return `M ${R} ${R} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`
}

/**
 * The fortune wheel — Figma 86:78.
 *
 * Sector colours are the members' STORED colours, so a household of 2 shows two
 * colours and a household of 5 shows five, and identities survive a removal. Rotation is handed in already solved for the pre-decided winner.
 */
export function Wheel({
  members,
  sectors,
  rotation,
  durationSeconds,
}: WheelProps) {
  const theta = sectorAngle(sectors.length)

  return (
    <div className={styles.wrap}>
      <div
        className={styles.rotor}
        style={{
          transform: `rotate(${rotation}deg)`,
          transitionDuration: `${durationSeconds}s`,
        }}
      >
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={styles.svg}>
          <circle cx={R} cy={R} r={R - 2} fill="none" stroke={INK} strokeWidth={4} />
          {sectors.map((memberIndex, i) => (
            <path
              key={i}
              d={wedgePath(i * theta, (i + 1) * theta)}
              fill={members[memberIndex].color}
              stroke={INK}
              strokeWidth={1}
            />
          ))}
          {sectors.map((memberIndex, i) => {
            const mid = (i + 0.5) * theta
            // Labels run along the sector. On the left half they would come out
            // upside down, so they are flipped to stay readable.
            const flip = mid > 180
            const y = R * 0.34
            return (
              <g key={`l${i}`} transform={`rotate(${mid} ${R} ${R})`}>
                <text
                  x={R}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={styles.label}
                  transform={`rotate(${flip ? -90 : 90} ${R} ${y})`}
                >
                  {members[memberIndex].name}
                </text>
              </g>
            )
          })}
          <circle
            cx={R}
            cy={R}
            r={HUB / 2}
            fill="var(--color-background-surface)"
            stroke={INK}
            strokeWidth={3}
          />
        </svg>
      </div>
      {/* Pointer stays put at 12 o'clock while the wheel turns beneath it. */}
      <svg className={styles.pointer} viewBox="0 0 40 40" aria-hidden="true">
        <path d="M20 30 L6 4 L34 4 Z" fill={INK} />
      </svg>
    </div>
  )
}
