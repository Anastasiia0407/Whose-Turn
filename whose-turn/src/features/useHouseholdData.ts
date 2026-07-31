import { useCallback, useEffect, useState } from 'react'
import {
  addChore as addChoreRequest,
  addMember as addMemberRequest,
  listChores,
  listMembers,
  removeChore as removeChoreRequest,
  removeMember as removeMemberRequest,
  type Chore,
  type Member,
} from '../data'
import { MAX_HOUSEHOLD_MEMBERS } from '../tokens'

export type LoadState = 'loading' | 'ready' | 'error'

/**
 * Which action produced a message. A message is only ever rendered in the
 * context that triggered it — adding a chore must never surface a members
 * message, and nothing is visible at rest.
 */
export type ActionScope =
  | 'chore-add'
  | 'chore-delete'
  | 'member-add'
  | 'member-delete'

export type ActionError = { scope: ActionScope; message: string }

/** Below this, a household cannot run a draw, so the last two are protected. */
export const MIN_HOUSEHOLD_MEMBERS = 2

/**
 * A household always has at least one chore.
 *
 * Onboarding guarantees the first one, and deleting the last is blocked, so the
 * chore list can never be empty. There is deliberately NO zero-chore UI: that
 * state has no Figma frame, so it is made unreachable instead of designed.
 */
export const MIN_HOUSEHOLD_CHORES = 1

/**
 * Loads and mutates the household's members and chores.
 *
 * Mutations are optimistic — the list updates immediately and rolls back if the
 * request fails, so a failed delete never silently disappears a row. All
 * Supabase access goes through the typed data layer; nothing here touches the
 * client directly.
 */
export function useHouseholdData(householdId: string | null) {
  const [members, setMembers] = useState<Member[]>([])
  const [chores, setChores] = useState<Chore[]>([])
  const [state, setState] = useState<LoadState>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionErrorState] = useState<ActionError | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    // No household resolved yet: settle on an empty ready state rather than
    // spinning on "loading" forever.
    if (!householdId) {
      setMembers([])
      setChores([])
      setState('ready')
      return
    }
    setState('loading')
    setLoadError(null)

    const [m, c] = await Promise.all([
      listMembers(householdId),
      listChores(householdId),
    ])

    if (m.error !== null) {
      setLoadError(m.error)
      setState('error')
      return
    }
    if (c.error !== null) {
      setLoadError(c.error)
      setState('error')
      return
    }

    setMembers(m.data)
    setChores(c.data)
    setState('ready')
  }, [householdId])

  useEffect(() => {
    void load()
  }, [load])

  const addChore = useCallback(
    async (name: string): Promise<boolean> => {
      if (!householdId) return false
      setActionErrorState(null)
      setBusy(true)
      try {
        const result = await addChoreRequest(householdId, name)
        if (result.error !== null) {
          setActionErrorState({ scope: 'chore-add', message: result.error })
          return false
        }
        setChores((prev) => [...prev, result.data])
        return true
      } finally {
        setBusy(false)
      }
    },
    [householdId],
  )

  /**
   * Blocks deleting the final chore, the same way removing the second-to-last
   * member is blocked. Sets the explanation rather than disabling the control,
   * so the reason is said out loud instead of leaving a dead button.
   * Returns false when the delete must not proceed.
   */
  const guardChoreDelete = useCallback(
    (): boolean => {
      if (chores.length <= MIN_HOUSEHOLD_CHORES) {
        setActionErrorState({
          scope: 'chore-delete',
          // Deliberately no chore name: a long one pushed this to four lines.
          message: `A household needs at least ${MIN_HOUSEHOLD_CHORES} chore. Add another one first.`,
        })
        return false
      }
      setActionErrorState(null)
      return true
    },
    [chores],
  )

  const removeChore = useCallback(async (chore: Chore): Promise<boolean> => {
    if (!guardChoreDelete()) return false

    const snapshot = chores
    // Optimistic: drop it now, restore the exact previous list if the call fails.
    setChores((prev) => prev.filter((c) => c.id !== chore.id))

    const result = await removeChoreRequest(chore.id)
    if (result.error !== null) {
      setChores(snapshot)
      setActionErrorState({ scope: 'chore-delete', message: `Could not delete that chore. ${result.error}` })
      return false
    }
    return true
  }, [chores, guardChoreDelete])

  const addMember = useCallback(
    async (name: string): Promise<boolean> => {
      if (!householdId) return false
      setActionErrorState(null)
      setBusy(true)
      try {
        const result = await addMemberRequest(householdId, name)
        if (result.error !== null) {
          setActionErrorState({ scope: 'member-add', message: result.error })
          return false
        }
        setMembers((prev) =>
          [...prev, result.data].sort((a, b) => a.sort_order - b.sort_order),
        )
        return true
      } finally {
        setBusy(false)
      }
    },
    [householdId],
  )

  const removeMember = useCallback(
    async (member: Member): Promise<boolean> => {
      setActionErrorState(null)

      // Guarded here rather than by disabling the control, so the reason can be
      // said out loud instead of leaving a dead button.
      if (members.length <= MIN_HOUSEHOLD_MEMBERS) {
        setActionErrorState({
          scope: 'member-delete',
          // Deliberately no member name, for the same reason as chores.
          message: `A household needs at least ${MIN_HOUSEHOLD_MEMBERS} members. Add someone else first.`,
        })
        return false
      }

      const snapshot = members
      setMembers((prev) => prev.filter((m) => m.id !== member.id))

      const result = await removeMemberRequest(member.id)
      if (result.error !== null) {
        setMembers(snapshot)
        setActionErrorState({
          scope: 'member-delete',
          message: `Could not remove that member. ${result.error}`,
        })
        return false
      }
      return true
    },
    [members],
  )

  return {
    members,
    chores,
    state,
    loadError,
    actionError,
    busy,
    householdFull: members.length >= MAX_HOUSEHOLD_MEMBERS,
    canRemoveMember: members.length > MIN_HOUSEHOLD_MEMBERS,
    canRemoveChore: chores.length > MIN_HOUSEHOLD_CHORES,
    reload: load,
    clearActionError: () => setActionErrorState(null),
    addChore,
    guardChoreDelete,
    removeChore,
    addMember,
    removeMember,
  }
}
