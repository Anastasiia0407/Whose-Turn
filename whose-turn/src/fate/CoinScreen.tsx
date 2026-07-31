import { useEffect, useState } from 'react'
import { FateLayout } from './FateLayout'
import { useDraw } from './useDraw'
import { solveCoin } from './engine'
import { play, preload, stop } from '../audio/player'
import type { Chore, Member } from '../data'
import styles from './CoinScreen.module.css'

type Props = {
  chore: Chore
  members: Member[]
  onSettled: (winner: Member) => void
}

const HALF_FLIP_MS = 260
/** The coin rests on its landed face before the result appears. */
const SETTLE_MS = 500

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

  useEffect(() => {
    preload('coin')
    return stop
  }, [])

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

          // Flip length varies with parity (6 or 7 half-flips), so the exact
          // duration is handed over and the player decides loop vs fade. The
          // reveal shifts with it, and the applause lead-in follows.
          play('coin', {
            durationMs: flips * HALF_FLIP_MS,
            revealInMs: flips * HALF_FLIP_MS + SETTLE_MS,
          })
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
              window.setTimeout(resolve, SETTLE_MS)
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
