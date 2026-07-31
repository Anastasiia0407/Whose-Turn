import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useHousehold } from '../state'
import { LoginScreen } from '../screens/LoginScreen'
import { OnboardingMembersScreen } from '../screens/OnboardingMembersScreen'
import { OnboardingChoreScreen } from '../screens/OnboardingChoreScreen'
import { HomeScreen } from '../screens/HomeScreen'
import { FateRoute } from '../fate/FateRoute'
import { Gallery } from '../dev/Gallery'

/**
 * Minimum routing for the Stage 0 screen map. Fate and result routes arrive in
 * Stage 5 — not stubbed here.
 *
 * Every redirect is driven by the RESOLVED household status, never a local
 * flag, so an existing household can never be shown onboarding.
 */
export function AppRoutes() {
  const { status } = useHousehold()
  const location = useLocation()

  const isDevRoute = location.pathname.startsWith('/dev')

  // One dev route remains: the design-system gallery, which has no equivalent in
  // the product. The Stage 1/2 preview and data-harness routes are gone — every
  // screen they stood in for is now reachable through the real flow.
  if (import.meta.env.DEV && isDevRoute) {
    return (
      <Routes>
        <Route path="/dev/gallery" element={<Gallery />} />
        <Route path="/dev/*" element={<Navigate to="/dev/gallery" replace />} />
      </Routes>
    )
  }

  // Session restore is still in flight — render nothing rather than flashing
  // the login screen at a user who is already signed in.
  if (status === 'loading') return null

  if (status === 'signed-out') {
    return (
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  if (status === 'needs-onboarding') {
    return (
      <Routes>
        <Route path="/onboarding/members" element={<OnboardingMembersScreen />} />
        <Route path="/onboarding/chore" element={<OnboardingChoreScreen />} />
        <Route
          path="*"
          element={<Navigate to="/onboarding/members" replace />}
        />
      </Routes>
    )
  }

  // status === 'ready'
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/fate/:mode" element={<FateRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
