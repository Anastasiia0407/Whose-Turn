import { useCallback, useState } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { useHousehold } from '../state'
import { useHouseholdData } from '../features/useHouseholdData'
import { WheelScreen } from './WheelScreen'
import { DiceScreen } from './DiceScreen'
import { CoinScreen } from './CoinScreen'
import { ResultScreen } from './ResultScreen'
import { isCoinAvailable } from './engine'
import { recordSpin, type FateMode, type Member } from '../data'

const MODES: FateMode[] = ['wheel', 'dice', 'coin']

function isMode(value: string | undefined): value is FateMode {
  return !!value && MODES.includes(value as FateMode)
}

/**
 * Resolves `/fate/:mode?chore=<id>` into a draw screen, then the result.
 *
 * Guards, in order: a valid mode, a chore that still exists, enough members,
 * and — for coin — exactly two members. Anything else goes home rather than
 * rendering a broken draw.
 */
export function FateRoute() {
  const { mode } = useParams()
  const [params] = useSearchParams()
  const { householdId } = useHousehold()
  const data = useHouseholdData(householdId)
  const [winner, setWinner] = useState<Member | null>(null)

  const choreId = params.get('chore')
  const chore = data.chores.find((c) => c.id === choreId) ?? null

  const onSettled = useCallback(
    (picked: Member) => {
      setWinner(picked)

      if (!householdId || !chore || !isMode(mode)) return
      // Persisted only once the animation has resolved, so an abandoned draw
      // leaves no history. A failed write must never block the result: it is
      // logged and the user carries on.
      void recordSpin({
        householdId,
        choreId: chore.id,
        memberId: picked.id,
        mode,
      }).then((result) => {
        if (result.error !== null) {
          console.error('Could not record this spin:', result.error)
        }
      })
    },
    [householdId, chore, mode],
  )

  // Still loading — render nothing rather than flashing a redirect.
  if (data.state === 'loading') return null
  if (!isMode(mode) || !chore || data.members.length < 2) {
    return <Navigate to="/" replace />
  }
  if (mode === 'coin' && !isCoinAvailable(data.members.length)) {
    return <Navigate to="/" replace />
  }

  if (winner) {
    return (
      <ResultScreen
        chore={chore}
        winner={winner}
        onAccept={() => setWinner(null)}
      />
    )
  }

  const shared = { chore, members: data.members, onSettled }
  if (mode === 'wheel') return <WheelScreen {...shared} />
  if (mode === 'dice') return <DiceScreen {...shared} />
  return <CoinScreen {...shared} />
}
