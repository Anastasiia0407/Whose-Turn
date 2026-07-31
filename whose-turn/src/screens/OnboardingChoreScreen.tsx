import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppShell,
  Button,
  Heading,
  ProgressBar,
  Subtitle,
  TextField,
} from '../ui'
import { useHousehold } from '../state'
import styles from './Onboarding.module.css'

/**
 * Onboarding step 2 — Figma frame 83:18.
 *
 * Continue is where the ONE write happens: household, members and chores are
 * inserted together by the `create_household_with_setup` RPC. If it fails,
 * nothing is written and the user stays here with the error.
 */
export function OnboardingChoreScreen() {
  const navigate = useNavigate()
  const { draft, setDraftChores, completeOnboarding, busy, error } =
    useHousehold()
  // Frame 83:18 has exactly ONE input and no add control. Onboarding creates
  // exactly one chore; more are added later from home.
  const [chores, setChores] = useState<string[]>(() =>
    draft.chores.length > 0 ? draft.chores.slice(0, 1) : [''],
  )

  const filled = chores.filter((c) => c.trim().length > 0).length
  const canContinue = filled >= 1 && !busy

  function update(index: number, value: string) {
    setChores((prev) => prev.map((c, i) => (i === index ? value : c)))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canContinue) return

    const cleaned = chores.map((c) => c.trim()).filter((c) => c.length > 0)
    setDraftChores(cleaned)

    // Pass the cleaned list explicitly: setDraftChores has not flushed yet, so
    // reading it off the draft here would commit the previous value.
    const done = await completeOnboarding({ chores: cleaned })
    if (done) void navigate('/', { replace: true })
  }

  return (
    <AppShell>
      <form className={styles.body} onSubmit={onSubmit}>
        <ProgressBar value={1} label="Setup progress: step 2 of 2" />

        <div className={styles.titles}>
          <Heading accent="What chore" rest=" needs doing?" size="h1" />
          <Subtitle>
            Add at least 1 chore to continue. You can add more later.
          </Subtitle>
        </div>

        <div className={styles.fields}>
          <div className={styles.chores}>
            {chores.map((chore, index) => (
              // Figma shows a bare cream input with no visible label (83:36).
              // hideLabel keeps a real <label> for assistive tech without
              // adding chrome the design does not have.
              <TextField
                key={index}
                label={`Chore ${index + 1}`}
                hideLabel
                placeholder="Enter chore"
                value={chore}
                onChange={(e) => update(index, e.target.value)}
                autoComplete="off"
                autoFocus={index === 0}
                disabled={busy}
              />
            ))}
          </div>

        </div>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" variant="primary" disabled={!canContinue}>
          Continue
        </Button>
      </form>
    </AppShell>
  )
}
