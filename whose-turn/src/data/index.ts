/**
 * Typed data layer. Pure async functions — no React, no UI logic.
 * Components must never call `supabase` directly; every query lives here so the
 * RLS assumptions stay in one place.
 */

export {
  supabase,
  signInWithHouseholdEmail,
  signOut,
  currentHouseholdEmail,
  verifyHouseholdClaim,
  normaliseEmail,
  HOUSEHOLD_EMAIL_CLAIM,
} from './client'

export {
  getHouseholdByEmail,
  createHousehold,
  getOrCreateHousehold,
  createHouseholdWithSetup,
} from './households'
export type { HouseholdSetup } from './households'
export { listMembers, addMember, removeMember } from './members'
export { listChores, addChore, removeChore } from './chores'
export { recordSpin, listRecentSpins } from './spins'

export { ok, fail } from './types'
export type {
  Household,
  Member,
  Chore,
  Spin,
  FateMode,
  Result,
} from './types'
