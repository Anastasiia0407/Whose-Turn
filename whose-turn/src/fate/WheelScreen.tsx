import { useMemo, useState } from 'react'
import { FateLayout } from './FateLayout'
import { Wheel } from './Wheel'
import { useDraw } from './useDraw'
import { buildSectors, solveWheel } from './engine'
import type { Chore, Member } from '../data'

type Props = {
  chore: Chore
  members: Member[]
  onSettled: (winner: Member) => void
}

const SPIN_SECONDS = 3.8

/**
 * Wheel mode — Figma 86:78.
 *
 * The winner is drawn before the wheel moves; `solveWheel` then computes the
 * exact rotation that parks one of that winner's sectors under the pointer.
 * The animation is pure presentation and cannot change the outcome.
 */
export function WheelScreen({ chore, members, onSettled }: Props) {
  const sectors = useMemo(() => buildSectors(members.length), [members.length])
  const [rotation, setRotation] = useState(0)
  const [duration, setDuration] = useState(0)
  const { phase, winner, start, isRunning } = useDraw(members)

  function spin() {
    start(
      (picked, reducedMotion) =>
        new Promise<void>((resolve) => {
          const winnerIndex = members.indexOf(picked)
          const { rotation: solved } = solveWheel(sectors, winnerIndex)

          if (reducedMotion) {
            // Skip straight to the final state — same outcome, no spin.
            setDuration(0)
            setRotation(solved)
            window.setTimeout(resolve, 200)
            return
          }

          setDuration(SPIN_SECONDS)
          // Next frame, so the transition has a start value to animate from.
          requestAnimationFrame(() => setRotation(solved))
          window.setTimeout(resolve, SPIN_SECONDS * 1000 + 400)
        }),
      onSettled,
    )
  }

  return (
    <FateLayout
      choreName={chore.name}
      caption="Wherever the wheel stops - that is fate!"
      ctaLabel="Spin the wheel"
      onStart={spin}
      disabled={phase !== 'idle'}
      announcement={
        phase === 'done' && winner ? `Fate has chosen ${winner.name}.` : null
      }
    >
      <Wheel
        members={members}
        sectors={sectors}
        rotation={rotation}
        durationSeconds={isRunning ? duration : duration}
      />
    </FateLayout>
  )
}
