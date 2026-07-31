import { useState, type FormEvent } from 'react'
import { AppShell, Button, TextField } from '../ui'
import { SectionLabel } from '../ui'
import { useHousehold } from '../state'
import wheelSvg from '../assets/illustrations/wheel.svg?raw'
import diceAmberSvg from '../assets/illustrations/die-amber.svg?raw'
import diceTerracottaSvg from '../assets/illustrations/die-terracotta.svg?raw'
import styles from './LoginScreen.module.css'

/**
 * Login — Figma frame 179:44.
 *
 * The frame is flattened in Figma (no child layers), so its geometry could not
 * be read through MCP. Positions come from measurements off the native 390x844
 * render and are laid out on a proportionally-scaling reference canvas — see
 * LoginScreen.module.css.
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
        <div
          className={styles.wheel}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: wheelSvg }}
        />
        {/* Node 179:195 is a COIN, not a ball. Two stacked faces so the flip
            swaps colour via opacity rather than repainting a background. */}
        <div className={styles.coin} aria-hidden="true">
          <div className={`${styles.coinFace} ${styles.coinFaceA}`} />
          <div className={`${styles.coinFace} ${styles.coinFaceB}`} />
        </div>
        <div className={styles.dice} aria-hidden="true">
          <div className={styles.diceInner}>
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

        <h1 className={styles.headline}>
          Whose <span className={styles.headlineAccent}>Turn?</span>
        </h1>

        <p className={styles.subtitle}>
          Set up your household and
          <br />
          let fate assign the chores
        </p>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <SectionLabel className={styles.label}>Email</SectionLabel>
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

          <div className={styles.submit}>
            <Button type="submit" variant="primary" disabled={!isValid || busy}>
              Get Started
            </Button>
          </div>

          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
        </form>
      </div>
    </AppShell>
  )
}
