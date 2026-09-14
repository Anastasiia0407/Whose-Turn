import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout as Shell } from './shell/Layout'
import { GettingStarted } from './pages/GettingStarted'
import { ColourPrimitives } from './pages/ColourPrimitives'
import { ColourSemantic } from './pages/ColourSemantic'
import { ColourMembers } from './pages/ColourMembers'
import { Spacing } from './pages/Spacing'
import { RadiusBorderShadow } from './pages/RadiusBorderShadow'
import { Layout } from './pages/Layout'
import { Typography } from './pages/Typography'
import { Decisions } from './pages/Decisions'
import { Coverage } from './pages/Coverage'

/**
 * There is one live version of this documentation.
 *
 * No version segment in the URL, no switcher, no archive of old releases. A
 * page either describes what ships today or it does not exist.
 *
 * Routes for the pages listed in the sidebar but not yet written are
 * deliberately absent rather than stubbed — the sidebar already says which
 * those are, and a stub route that renders an apology is worse than a link that
 * is visibly not a link.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<GettingStarted />} />

          <Route path="foundations">
            <Route path="colour-primitives" element={<ColourPrimitives />} />
            <Route path="colour-semantic" element={<ColourSemantic />} />
            <Route path="colour-members" element={<ColourMembers />} />
            <Route path="spacing" element={<Spacing />} />
            <Route path="radius-border-shadow" element={<RadiusBorderShadow />} />
            <Route path="layout" element={<Layout />} />
            <Route path="typography" element={<Typography />} />
          </Route>

          <Route path="figma-code" element={<Coverage />} />
          <Route path="decisions" element={<Decisions />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
