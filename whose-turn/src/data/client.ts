import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill both in.',
  )
}

export const supabase = createClient(url, anonKey)

/**
 * Key under which the household email is stored in the auth user's metadata.
 * RLS policies read this exact path — keep the two in sync.
 */
export const HOUSEHOLD_EMAIL_CLAIM = 'household_email'

/** Emails are identifiers, so they must normalise to a single canonical form. */
export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * Sign in and bind this session to a household email.
 *
 * DELIBERATE MVP TRADEOFF — THIS IS NOT ACCOUNT SECURITY.
 * Email here is an identifier, like a nickname, not a credential. Nothing is
 * sent, nothing is verified, and there is no password. Anyone who types a known
 * email reaches that household's data. We use Supabase anonymous auth purely so
 * every request carries a JWT and RLS can scope rows to one household, which
 * stops data leaking between households and blocks unauthenticated API pokes.
 * It does not stop deliberate impersonation. Upgrading this to real auth is a
 * conscious product decision, not a bug fix — do not "improve" it unasked.
 */
export async function signInWithHouseholdEmail(email: string) {
  const householdEmail = normaliseEmail(email)

  const { data: session, error: signInError } =
    await supabase.auth.signInAnonymously()
  if (signInError) return { data: null, error: signInError }

  // The email must live in user_metadata, because an anonymous session has no
  // top-level `email` claim for policies to read.
  const { data, error } = await supabase.auth.updateUser({
    data: { [HOUSEHOLD_EMAIL_CLAIM]: householdEmail },
  })
  if (error) return { data: null, error }

  // Refresh so the access token actually carries the new metadata claim —
  // updateUser changes the user record but the in-hand JWT predates it.
  const { error: refreshError } = await supabase.auth.refreshSession()
  if (refreshError) return { data: null, error: refreshError }

  return { data: data.user ?? session.user, error: null }
}

export async function signOut() {
  return supabase.auth.signOut()
}

/** The household email bound to the current session, or null if signed out. */
export async function currentHouseholdEmail(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  const meta = data.session?.user.user_metadata as
    | Record<string, unknown>
    | undefined
  const email = meta?.[HOUSEHOLD_EMAIL_CLAIM]
  return typeof email === 'string' ? email : null
}

/** Decode a JWT payload without verifying it. Read-only inspection. */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const part = token.split('.')[1]
  if (!part) return null
  try {
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

/**
 * Confirm the ACCESS TOKEN actually carries the household_email claim the RLS
 * policies read.
 *
 * This exists to catch a specific, nasty failure: if the claim is missing, every
 * policy denies, every lookup comes back empty, and an existing household looks
 * like a brand-new user who then gets pushed through onboarding again. Checking
 * the user object is not enough — `updateUser` changes the user record while the
 * in-hand JWT still predates it, so the token itself must be inspected.
 */
export async function verifyHouseholdClaim(
  expectedEmail: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) return { ok: false, reason: 'No active session.' }

  const payload = decodeJwtPayload(token)
  if (!payload) return { ok: false, reason: 'Could not decode the access token.' }

  const meta = payload.user_metadata as Record<string, unknown> | undefined
  const claim = meta?.[HOUSEHOLD_EMAIL_CLAIM]

  if (typeof claim !== 'string' || claim.length === 0) {
    return {
      ok: false,
      reason:
        'The access token is missing the household_email claim, so every row would be denied. This is a sign-in bug, not an empty database.',
    }
  }

  if (claim !== normaliseEmail(expectedEmail)) {
    return {
      ok: false,
      reason: `The access token is bound to "${claim}" but the app expected "${normaliseEmail(expectedEmail)}".`,
    }
  }

  return { ok: true }
}
