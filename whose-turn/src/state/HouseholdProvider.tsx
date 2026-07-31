import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createHouseholdWithSetup,
  currentHouseholdEmail,
  getHouseholdByEmail,
  signInWithHouseholdEmail,
  signOut as signOutRequest,
  supabase,
  verifyHouseholdClaim,
  type Household,
} from '../data'
import { colorForMemberIndex } from '../tokens'
import {
  HouseholdContext,
  type HouseholdContextValue,
  type HouseholdStatus,
  type OnboardingDraft,
} from './householdContext'

const EMPTY_DRAFT: OnboardingDraft = { members: [], chores: [] }

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<HouseholdStatus>('loading')
  const [household, setHousehold] = useState<Household | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [draft, setDraft] = useState<OnboardingDraft>(EMPTY_DRAFT)

  /**
   * Resolve the household for a bound email.
   *
   * The claim is verified FIRST. Without it every policy denies, the lookup
   * comes back empty, and an existing household would be misread as a new user
   * and sent through onboarding again. That must surface as an error, never as
   * "you're new".
   */
  const resolve = useCallback(async (householdEmail: string) => {
    const claim = await verifyHouseholdClaim(householdEmail)
    if (!claim.ok) {
      setError(claim.reason)
      setStatus('signed-out')
      return
    }

    const result = await getHouseholdByEmail(householdEmail)
    if (result.error !== null) {
      setError(result.error)
      setStatus('signed-out')
      return
    }

    setEmail(householdEmail)
    if (result.data) {
      setHousehold(result.data)
      setStatus('ready')
    } else {
      setHousehold(null)
      setStatus('needs-onboarding')
    }
  }, [])

  // Restore an existing session on load, so a refresh keeps the user where they
  // are instead of pushing a returning household back through onboarding.
  useEffect(() => {
    let cancelled = false
    void (async () => {
      const existing = await currentHouseholdEmail()
      if (cancelled) return
      if (!existing) {
        setStatus('signed-out')
        return
      }
      await resolve(existing)
    })()
    return () => {
      cancelled = true
    }
  }, [resolve])

  const signIn = useCallback(
    async (input: string) => {
      setError(null)
      setBusy(true)
      setStatus('loading')
      try {
        const { error: authError } = await signInWithHouseholdEmail(input)
        if (authError) {
          setError(authError.message)
          setStatus('signed-out')
          return
        }
        const bound = await currentHouseholdEmail()
        if (!bound) {
          setError('Signed in, but the household email was not bound to the session.')
          setStatus('signed-out')
          return
        }
        await resolve(bound)
      } finally {
        setBusy(false)
      }
    },
    [resolve],
  )

  const completeOnboarding = useCallback(
    async (overrides?: Partial<OnboardingDraft>): Promise<boolean> => {
    if (!email) {
      setError('Cannot finish setup without a signed-in email.')
      return false
    }

    // Overrides win, so a screen can commit values it just collected without
    // waiting for a setState to flush.
    const members = (overrides?.members ?? draft.members)
      .map((name) => name.trim())
      .filter((name) => name.length > 0)
    const chores = (overrides?.chores ?? draft.chores)
      .map((name) => name.trim())
      .filter((name) => name.length > 0)

    if (members.length < 2) {
      setError('Add at least 2 members before finishing setup.')
      return false
    }
    if (chores.length < 1) {
      setError('Add at least 1 chore before finishing setup.')
      return false
    }

    setBusy(true)
    setError(null)
    try {
      // Colours are assigned here, by join order — the user never picks one.
      const result = await createHouseholdWithSetup({
        email,
        members: members.map((name, i) => ({
          name,
          color: colorForMemberIndex(i),
        })),
        chores: chores.map((name) => ({ name })),
      })

      if (result.error !== null) {
        setError(result.error)
        return false
      }

      setHousehold(result.data)
      setDraft(EMPTY_DRAFT)
      setStatus('ready')
      return true
    } finally {
      setBusy(false)
    }
    },
    [email, draft],
  )

  const signOut = useCallback(async () => {
    await signOutRequest()
    setHousehold(null)
    setEmail(null)
    setError(null)
    setDraft(EMPTY_DRAFT)
    setStatus('signed-out')
  }, [])

  const setDraftMembers = useCallback((members: string[]) => {
    setDraft((prev) => ({ ...prev, members }))
  }, [])

  const setDraftChores = useCallback((chores: string[]) => {
    setDraft((prev) => ({ ...prev, chores }))
  }, [])

  const clearError = useCallback(() => setError(null), [])

  // Keep context in step if the session is dropped elsewhere (token expiry).
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setHousehold(null)
        setEmail(null)
        setDraft(EMPTY_DRAFT)
        setStatus('signed-out')
      }
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const value = useMemo<HouseholdContextValue>(
    () => ({
      status,
      household,
      householdId: household?.id ?? null,
      email,
      error,
      busy,
      draft,
      setDraftMembers,
      setDraftChores,
      signIn,
      completeOnboarding,
      signOut,
      clearError,
    }),
    [
      status,
      household,
      email,
      error,
      busy,
      draft,
      setDraftMembers,
      setDraftChores,
      signIn,
      completeOnboarding,
      signOut,
      clearError,
    ],
  )

  return (
    <HouseholdContext.Provider value={value}>
      {children}
    </HouseholdContext.Provider>
  )
}
