import type { PostgrestError } from '@supabase/supabase-js'
import { supabase } from './client'
import { colorForMemberIndex, MAX_HOUSEHOLD_MEMBERS } from '../tokens'
import { fail, ok, type Member, type Result } from './types'

function toFail<T>(error: PostgrestError): Result<T> {
  return fail<T>(error.message, error.code ?? null)
}

/** Members in join order — the order that decides their palette colour. */
export async function listMembers(
  householdId: string,
): Promise<Result<Member[]>> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('household_id', householdId)
    .order('sort_order', { ascending: true })

  if (error) return toFail(error)
  return ok((data ?? []) as Member[])
}

/**
 * Add a member, assigning the next palette colour by join order.
 *
 * The colour is resolved through `colorForMemberIndex` and frozen onto the row
 * at insert. Persisting the hex (rather than recomputing from position) is what
 * makes a member's colour survive another member being deleted.
 */
export async function addMember(
  householdId: string,
  name: string,
): Promise<Result<Member>> {
  const existing = await listMembers(householdId)
  // Compare against null explicitly: a truthiness check cannot narrow the
  // union, because the failure branch's `error: string` could be "".
  if (existing.error !== null) return fail(existing.error, existing.code)

  const members = existing.data
  if (members.length >= MAX_HOUSEHOLD_MEMBERS) {
    return fail(
      `This household is full — ${MAX_HOUSEHOLD_MEMBERS} members maximum.`,
      'HOUSEHOLD_FULL',
    )
  }

  // Next free slot, so a delete-then-add reuses the freed colour rather than
  // skipping past the palette end.
  const used = new Set(members.map((m) => m.sort_order))
  let slot = 0
  while (used.has(slot)) slot += 1

  const { data, error } = await supabase
    .from('members')
    .insert({
      household_id: householdId,
      name: name.trim(),
      color: colorForMemberIndex(slot),
      sort_order: slot,
    })
    .select()
    .single()

  if (error) return toFail(error)
  return ok(data as Member)
}

export async function removeMember(memberId: string): Promise<Result<true>> {
  const { error } = await supabase.from('members').delete().eq('id', memberId)
  if (error) return toFail(error)
  return ok(true)
}
