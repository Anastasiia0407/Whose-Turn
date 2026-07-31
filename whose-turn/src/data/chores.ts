import type { PostgrestError } from '@supabase/supabase-js'
import { supabase } from './client'
import { fail, ok, type Chore, type Result } from './types'

function toFail<T>(error: PostgrestError): Result<T> {
  return fail<T>(error.message, error.code ?? null)
}

export async function listChores(householdId: string): Promise<Result<Chore[]>> {
  const { data, error } = await supabase
    .from('chores')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: true })

  if (error) return toFail(error)
  return ok((data ?? []) as Chore[])
}

export async function addChore(
  householdId: string,
  name: string,
): Promise<Result<Chore>> {
  const { data, error } = await supabase
    .from('chores')
    .insert({ household_id: householdId, name: name.trim() })
    .select()
    .single()

  if (error) return toFail(error)
  return ok(data as Chore)
}

export async function removeChore(choreId: string): Promise<Result<true>> {
  const { error } = await supabase.from('chores').delete().eq('id', choreId)
  if (error) return toFail(error)
  return ok(true)
}
