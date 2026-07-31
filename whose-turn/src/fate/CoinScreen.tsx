import { useState } from 'react'
import { FateLayout } from './FateLayout'
import { useDraw } from './useDraw'
import { solveCoin } from './engine'
import type { Chore, Member } from '../data'
import styles from './CoinScreen.module.css'

type Props = {
  chore: Chore
  members: Member[]
  onSettled: (winner: Member) => void
}

const HALF_FLIP_MS = 260

/**
 * Coin mode — Figma 92:331. Reachable only with exactly two members.
 *
 * Heads is member 1, tails is member 2. `solveCoin` chooses the flip PARITY so
 * the coin lands on the pre-decided winner's face — the landing is arithmetic,
 * not physics.
 */
export function CoinScreen({ chore, members, onSettled }: Props) {
  const [face, setFace] = useState(0)
  const [flipping, setFlipping] = useState(false)
  const { phase, winner, start } = useDraw(members)

  const shown = members[face]

  function flip() {
    start(
      (picked, reducedMotion) =>
        new Promise<void>((resolve) => {
          const winnerIndex = members.indexOf(picked)
          const { flips, landsOn } = solveCoin(winnerIndex)

          if (reducedMotion) {
            setFace(landsOn)
            window.setTimeout(resolve, 200)
            return
          }

          setFlipping(true)
          let done = 0
          const tick = window.setInterval(() => {
            done += 1
            // Swap the visible face at each half-flip, so parity is what lands.
            setFace((f) => (f === 0 ? 1 : 0))
            if (done >= flips) {
              window.clearInterval(tick)
              setFace(landsOn)
              setFlipping(false)
              window.setTimeout(resolve, 500)
            }
          }, HALF_FLIP_MS)
        }),
      onSettled,
    )
  }

  return (
    <FateLayout
      choreName={chore.name}
      caption="However the coin lands — that is fate!"
      ctaLabel="Flip the coin"
      onStart={flip}
      disabled={phase !== 'idle'}
      announcement={
        phase === 'done' && winner ? `The coin landed on ${winner.name}.` : null
      }
    >
      <div
        className={[styles.coin, flipping ? styles.flipping : null]
          .filter(Boolean)
          .join(' ')}
        style={{ background: shown.color }}
        role="img"
        aria-label={`Coin showing ${shown.name}`}
      >
        <span className={styles.initial}>{[...shown.name][0] ?? ''}</span>
      </div>
    </FateLayout>
  )
}
