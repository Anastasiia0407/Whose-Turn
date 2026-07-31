import type { PostgrestError } from '@supabase/supabase-js'
import { supabase } from './client'
import { fail, ok, type FateMode, type Result, type Spin } from './types'

function toFail<T>(error: PostgrestError): Result<T> {
  return fail<T>(error.message, error.code ?? null)
}

/**
 * Record a completed draw.
 *
 * Written only after the animation resolves — an abandoned draw leaves no
 * history. The winner is decided by the fate engine before any pixel moves;
 * this function just persists the outcome it is handed.
 */
export async function recordSpin(input: {
  householdId: string
  choreId: string
  memberId: string
  mode: FateMode
}): Promise<Result<Spin>> {
  const { data, error } = await supabase
    .from('spins')
    .insert({
      household_id: input.householdId,
      chore_id: input.choreId,
      member_id: input.memberId,
      mode: input.mode,
    })
    .select()
    .single()

  if (error) return toFail(error)
  return ok(data as Spin)
}

export async function listRecentSpins(
  householdId: string,
  limit = 20,
): Promise<Result<Spin[]>> {
  const { data, error } = await supabase
    .from('spins')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return toFail(error)
  return ok((data ?? []) as Spin[])
}
