import { useId, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppShell,
  Button,
  Heading,
  MemberAvatar,
  ProgressBar,
  SectionLabel,
  Subtitle,
} from '../ui'
import { useHousehold } from '../state'
import { colorForMemberIndex } from '../tokens'
import styles from './Onboarding.module.css'

/**
 * Onboarding step 1 — Figma frame 82:10.
 *
 * Nothing is written to Supabase here. Names are held in the onboarding draft
 * and committed atomically at the end of step 2, so an abandoned onboarding
 * leaves no household behind.
 *
 * Colours are assigned automatically by join order — index 0 gets palette slot
 * 0, and so on. The user never picks a colour.
 */
export function OnboardingMembersScreen() {
  const navigate = useNavigate()
  const { draft, setDraftMembers } = useHousehold()
  const fieldId = useId()

  // Frame 82:10 has exactly TWO fixed slots and no add control. Onboarding
  // creates exactly two members; everyone else is added later from home.
  const [names, setNames] = useState<string[]>(() =>
    draft.members.length >= 2 ? draft.members.slice(0, 2) : ['', ''],
  )

  const filled = names.filter((n) => n.trim().length > 0).length
  const canContinue = filled >= 2

  function update(index: number, value: string) {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)))
  }


  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canContinue) return
    setDraftMembers(names.map((n) => n.trim()).filter((n) => n.length > 0))
    void navigate('/onboarding/chore')
  }

  return (
    <AppShell>
      <form className={styles.body} onSubmit={onSubmit}>
        <ProgressBar value={0.5} label="Setup progress: step 1 of 2" />

        <div className={styles.titles}>
          <Heading accent="Who's" rest=" in your household?" size="h1" />
          <Subtitle>
            Add at least 2 members to continue. You can add more from your
            profile later.
          </Subtitle>
        </div>

        <div className={styles.fields}>
          {names.map((name, index) => (
            <div className={styles.field} key={index}>
              <SectionLabel as="label" htmlFor={`${fieldId}-${index}`}>
                {`Member ${index + 1}`}
              </SectionLabel>
              <div className={styles.memberRow}>
                // No member row exists yet — this previews the colour the member
                  // WILL be assigned at creation, from the same helper the insert uses.
                  <MemberAvatar color={colorForMemberIndex(index)} name={name} />
                <input
                  id={`${fieldId}-${index}`}
                  className={styles.bareInput}
                  placeholder="Enter name"
                  value={name}
                  onChange={(e) => update(index, e.target.value)}
                  autoComplete="off"
                  autoFocus={index === 0}
                />
              </div>
            </div>
          ))}

        </div>

        <Button type="submit" variant="primary" disabled={!canContinue}>
          Continue
        </Button>
      </form>
    </AppShell>
  )
}
