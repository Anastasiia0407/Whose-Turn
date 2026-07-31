import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell, Button, Heading, PillChip, Subtitle } from '../ui'
import { resultPillCopy } from './choreCopy'
import { startApplause, stopApplause } from '../audio/player'
import confetti from '../assets/illustrations/confetti.png'
import type { Chore, Member } from '../data'
import styles from './ResultScreen.module.css'

type Props = {
  chore: Chore
  winner: Member
  onAccept: () => void
}

/**
 * Result — Figma frame 1:39.
 *
 * There is no re-spin: accepting is the only way out, and it returns home with
 * the chore deselected. The concept is explicit that fate is not re-rollable.
 */
export function ResultScreen({ chore, winner, onAccept }: Props) {
  const navigate = useNavigate()

  // The applause is normally ALREADY playing by now — the draw screen started
  // it a lead-in before this screen existed, so it carries across the cut.
  // This call claims it without restarting it, and only genuinely starts the
  // sound on the fallback path where it had not buffered in time.
  //
  // Leaving fades it out rather than cutting, whether or not it had finished.
  useEffect(() => {
    startApplause()
    return () => stopApplause()
  }, [])

  function accept() {
    onAccept()
    void navigate('/', { replace: true })
  }

  return (
    <AppShell>
      <div className={styles.body}>
        <div className={styles.titles}>
          <Heading accent="Fate" rest=" Has Chosen" size="h1" />
          <Subtitle>You can&apos;t re-spin fate — that&apos;s fair</Subtitle>
        </div>

        <div className={styles.hero}>
          {/* Decorative celebration graphic — node 38:76. */}
          <img
            className={styles.confetti}
            src={confetti}
            alt=""
            aria-hidden="true"
            width={356}
            height={240}
          />

          <div className={styles.winner}>
            <p className={styles.name} title={winner.name}>
              {winner.name}
            </p>
            <PillChip tone="surface" uppercase>
              {resultPillCopy(chore.name)}
            </PillChip>
          </div>
        </div>

        <Button variant="primary" onClick={accept}>
          I accept my fate
        </Button>
      </div>
    </AppShell>
  )
}
