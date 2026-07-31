import { useEffect, useState } from 'react'
import { FateLayout } from './FateLayout'
import { Die } from './Die'
import { useDraw } from './useDraw'
import { rollDice } from './engine'
import { MemberAvatar, StaticRow } from '../ui'
import { play, preload, stop } from '../audio/player'
import type { Chore, Member } from '../data'
import styles from './DiceScreen.module.css'

/** Figma staggers the dice diagonally rather than lining them up (92:277). */
const SETTLE_ANGLES = [-9, 7, -14, 11, -5, 15]

type Props = {
  chore: Chore
  members: Member[]
  onSettled: (winner: Member) => void
}

const TUMBLE_MS = 1800
const HIGHLIGHT_MS = 1100

/**
 * Dice mode — Figma 92:277 (2 members) and 157:45 (3 members).
 *
 * One die per member, in that member's palette colour — the count and colours
 * follow the household, they are not fixed art. `rollDice` generates the faces
 * so the pre-decided winner holds the strict maximum, with no ties.
 */
export function DiceScreen({ chore, members, onSettled }: Props) {
  const [values, setValues] = useState<(number | null)[]>(
    () => members.map(() => null),
  )
  const [tumbling, setTumbling] = useState(false)
  const [highlight, setHighlight] = useState<number | null>(null)
  const { phase, winner, start } = useDraw(members)

  useEffect(() => {
    preload('dice')
    return stop
  }, [])

  function roll() {
    start(
      (picked, reducedMotion) =>
        new Promise<void>((resolve) => {
          const winnerIndex = members.indexOf(picked)
          const rolled = rollDice(members.length, winnerIndex)

          if (reducedMotion) {
            setValues(rolled)
            setHighlight(winnerIndex)
            window.setTimeout(resolve, 200)
            return
          }

          // Sound runs for the throw only, ending when the dice settle.
          play('dice', { durationMs: TUMBLE_MS })
          setTumbling(true)
          window.setTimeout(() => {
            setTumbling(false)
            setValues(rolled)
            setHighlight(winnerIndex)
            window.setTimeout(resolve, HIGHLIGHT_MS)
          }, TUMBLE_MS)
        }),
      onSettled,
    )
  }

  return (
    <FateLayout
      choreName={chore.name}
      caption="Whoever rolls the highest — gets the chore!"
      ctaLabel="Roll the dice"
      onStart={roll}
      disabled={phase !== 'idle'}
      announcement={
        phase === 'done' && winner
          ? `${winner.name} rolled the highest and gets the chore.`
          : null
      }
      belowNav={
        <div className={styles.roster}>
        {members.map((m) => (
          <StaticRow
            key={m.id}
            className={styles.rosterChip}
            label={m.name}
            leading={<MemberAvatar color={m.color} size="sm" />}
          />
          ))}
        </div>
      }
    >
      <div className={styles.dice} data-count={members.length}>
        {members.map((m, i) => (
          <Die
            key={m.id}
            color={m.color}
            value={values[i]}
            tumbling={tumbling}
            highlighted={highlight === i}
            label={m.name}
            settleAngle={SETTLE_ANGLES[i % SETTLE_ANGLES.length]}
          />
        ))}
      </div>
    </FateLayout>
  )
}
