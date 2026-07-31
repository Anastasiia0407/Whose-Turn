/** Row types mirroring the `create_whose_turn_schema` migration. */

export type FateMode = 'wheel' | 'dice' | 'coin'

export type Household = {
  id: string
  email: string
  created_at: string
}

export type Member = {
  id: string
  household_id: string
  name: string
  /** Resolved hex, frozen at insert from the join-order palette slot. */
  color: string
  sort_order: number
  created_at: string
}

export type Chore = {
  id: string
  household_id: string
  name: string
  created_at: string
}

export type Spin = {
  id: string
  household_id: string
  chore_id: string
  member_id: string
  mode: FateMode
  created_at: string
}

/**
 * Every data-layer function returns this instead of throwing, so callers must
 * deal with the failure path explicitly. `error` is a human-readable message;
 * the raw Postgres code is kept for callers that need to branch on it.
 */
export type Result<T> =
  | { data: T; error: null; code: null }
  | { data: null; error: string; code: string | null }

export function ok<T>(data: T): Result<T> {
  return { data, error: null, code: null }
}

export function fail<T>(error: string, code: string | null = null): Result<T> {
  return { data: null, error, code }
}
