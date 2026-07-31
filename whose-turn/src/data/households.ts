import type { PostgrestError } from '@supabase/supabase-js'
import { normaliseEmail, supabase } from './client'
import { fail, ok, type Household, type Result } from './types'

function toFail<T>(error: PostgrestError): Result<T> {
  return fail<T>(error.message, error.code ?? null)
}

/**
 * Look up a household by its email identifier.
 * Returns `data: null` when no household exists — that is the "new user, send
 * them to onboarding" signal, not an error.
 */
export async function getHouseholdByEmail(
  email: string,
): Promise<Result<Household | null>> {
  const { data, error } = await supabase
    .from('households')
    .select('*')
    .eq('email', normaliseEmail(email))
    .maybeSingle()

  if (error) return toFail(error)
  return ok(data as Household | null)
}

export async function createHousehold(email: string): Promise<Result<Household>> {
  const { data, error } = await supabase
    .from('households')
    .insert({ email: normaliseEmail(email) })
    .select()
    .single()

  if (error) return toFail(error)
  return ok(data as Household)
}

/**
 * Find the household for this email, creating it if absent.
 * Handles the race where two devices onboard the same email at once: the unique
 * constraint fires (23505) and we re-read instead of surfacing a crash.
 */
export async function getOrCreateHousehold(
  email: string,
): Promise<Result<Household>> {
  const existing = await getHouseholdByEmail(email)
  if (existing.error) return fail(existing.error, existing.code)
  if (existing.data) return ok(existing.data)

  const created = await createHousehold(email)
  if (created.data) return created

  if (created.code === '23505') {
    const retry = await getHouseholdByEmail(email)
    if (retry.error) return fail(retry.error, retry.code)
    if (retry.data) return ok(retry.data)
  }

  return fail(created.error ?? 'Could not create household', created.code)
}

export type HouseholdSetup = {
  email: string
  members: { name: string; color: string }[]
  chores: { name: string }[]
}

/**
 * Create the household, its members and its chores in ONE call.
 *
 * Supabase has no client-side transaction, so this delegates to the
 * `create_household_with_setup` Postgres function. Either everything lands or
 * nothing does — an interrupted onboarding cannot leave a household with no
 * members behind.
 */
export async function createHouseholdWithSetup(
  setup: HouseholdSetup,
): Promise<Result<Household>> {
  const { data, error } = await supabase.rpc('create_household_with_setup', {
    p_email: normaliseEmail(setup.email),
    p_members: setup.members,
    p_chores: setup.chores,
  })

  if (error) return fail(error.message, error.code ?? null)
  if (!data) return fail('Setup returned no household', null)
  return ok(data as Household)
}
