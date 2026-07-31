import { useCallback, useRef, useState } from 'react'
import { drawWinner } from './engine'
import { preload } from '../audio/player'
import type { Member } from '../data'

export type DrawPhase = 'idle' | 'running' | 'done'

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Shared draw lifecycle for all three modes.
 *
 * The winner is decided the instant the draw starts — before a single pixel
 * moves — and handed to the animation, which is purely presentational. A draw
 * cannot be started twice: `phase` gates it and a ref guards against a second
 * synchronous call slipping past a stale render.
 */
export function useDraw(members: Member[]) {
  const [phase, setPhase] = useState<DrawPhase>('idle')
  const [winner, setWinner] = useState<Member | null>(null)
  const running = useRef(false)

  const start = useCallback(
    (
      /** Runs the animation and resolves when it has finished. */
      animate: (winner: Member, reducedMotion: boolean) => Promise<void>,
      onSettled?: (winner: Member) => void,
    ) => {
      if (running.current || members.length === 0) return
      running.current = true
      setPhase('running')

      // Warmed HERE, not on the result screen — by then it is too late for the
      // fetch to finish before the sting is supposed to fire.
      preload('winner')

      // Decided FIRST. Everything after this point is presentation.
      const picked = drawWinner(members)
      setWinner(picked)

      const reduced = prefersReducedMotion()
      void animate(picked, reduced).then(() => {
        setPhase('done')
        running.current = false
        onSettled?.(picked)
      })
    },
    [members],
  )

  return { phase, winner, start, isRunning: phase === 'running' }
}
