import { useState, type FormEvent } from 'react'
import { AppShell, Button, SectionLabel, TextField } from '../ui'
import { useHousehold } from '../state'
import wheelSvg from '../assets/illustrations/wheel.svg?raw'
import diceAmberSvg from '../assets/illustrations/die-amber.svg?raw'
import diceTerracottaSvg from '../assets/illustrations/die-terracotta.svg?raw'
import styles from './LoginScreen.module.css'

/**
 * Login — Figma frame 179:44, recomposed at 390x700.
 *
 * The three fate objects now FRAME the form: the coin small and above it, the
 * wheel bottom-right and the dice bottom-left. They sit in a decorative layer
 * behind the content; the headline, subtitle and form are in normal flow.
 *
 * Email is an identifier, not a credential: nothing is sent, nothing verified.
 */
export function LoginScreen() {
  const { signIn, busy, error, clearError } = useHousehold()
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)

  const trimmed = email.trim()
  // Deliberately permissive — this is an identifier, not a verified address.
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
  const showInvalid = touched && trimmed.length > 0 && !isValid

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!isValid || busy) return
    await signIn(trimmed)
  }

  return (
    <AppShell bleed>
      <div className={styles.canvas}>
        {/* Decorative — real vectors exported from Figma, not redrawn. */}
        <div className={styles.stage} aria-hidden="true">
          {/* Node 179:195 is a COIN. Two stacked faces so the flip swaps
              colour via opacity rather than repainting a background. */}
          <div className={styles.coin}>
            <div className={`${styles.coinFace} ${styles.coinFaceA}`} />
            <div className={`${styles.coinFace} ${styles.coinFaceB}`} />
          </div>

          <div
            className={styles.wheel}
            dangerouslySetInnerHTML={{ __html: wheelSvg }}
          />

          <div className={styles.diceGroup}>
            <div
              className={styles.diceAmber}
              dangerouslySetInnerHTML={{ __html: diceAmberSvg }}
            />
            <div
              className={styles.diceTerracotta}
              dangerouslySetInnerHTML={{ __html: diceTerracottaSvg }}
            />
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.titles}>
            <h1 className={styles.headline}>
              Whose <span className={styles.headlineAccent}>Turn?</span>
            </h1>
            <p className={styles.subtitle}>
              Set up your household and
              <br />
              let fate assign the chores
            </p>
          </div>

          <form className={styles.form} onSubmit={onSubmit} noValidate>
            <div className={styles.fieldGroup}>
              <SectionLabel>Email</SectionLabel>
              <div className={styles.field}>
                <TextField
                  label="Email"
                  hideLabel
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) clearError()
                  }}
                  onBlur={() => setTouched(true)}
                  invalid={showInvalid}
                  message={
                    showInvalid
                      ? 'Enter an email address like you@example.com.'
                      : undefined
                  }
                  disabled={busy}
                />
              </div>
            </div>

            {/* Node 179:61 is drawn at 50% opacity — that is this button's
                existing disabled state with an empty field, not a new style. */}
            <Button type="submit" variant="primary" disabled={!isValid || busy}>
              Get Started
            </Button>

            {error ? (
              <p className={styles.error} role="alert">
                {error}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </AppShell>
  )
}
