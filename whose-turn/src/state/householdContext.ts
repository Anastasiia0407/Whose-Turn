import { createContext } from 'react'
import type { Household } from '../data'

export type HouseholdStatus =
  | 'loading'
  | 'signed-out'
  | 'needs-onboarding'
  | 'ready'

export type OnboardingDraft = {
  /** Member names in join order. Index === palette slot. */
  members: string[]
  chores: string[]
}

export type HouseholdContextValue = {
  status: HouseholdStatus
  household: Household | null
  /** Convenience accessor. Null until status is 'ready'. */
  householdId: string | null
  email: string | null
  error: string | null
  /** True while a sign-in or an onboarding commit is in flight. */
  busy: boolean

  draft: OnboardingDraft
  setDraftMembers: (members: string[]) => void
  setDraftChores: (chores: string[]) => void

  /** Sign in by email. New email -> needs-onboarding; existing -> ready. */
  signIn: (email: string) => Promise<void>
  /**
   * Commit the draft as household + members + chores in one atomic call.
   * Accepts overrides so a caller can pass values it has just collected without
   * waiting for a state update to flush.
   */
  completeOnboarding: (
    overrides?: Partial<OnboardingDraft>,
  ) => Promise<boolean>
  signOut: () => Promise<void>
  clearError: () => void
}

/**
 * The ONE place the current household is held. Components read it through
 * `useHousehold`; nothing re-derives it from the session or re-queries
 * `households` ad hoc.
 */
export const HouseholdContext = createContext<HouseholdContextValue | null>(null)
