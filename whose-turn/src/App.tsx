import { BrowserRouter } from 'react-router-dom'
import { HouseholdProvider } from './state'
import { AppRoutes } from './routes/AppRoutes'
import { useViewportFit } from './ui/useViewportFit'

export default function App() {
  // Publishes --keyboard-inset and data-keyboard on <html>. Mounted once at the
  // root so it covers login, both onboarding steps and every sheet.
  useViewportFit()

  return (
    <BrowserRouter>
      <HouseholdProvider>
        <AppRoutes />
      </HouseholdProvider>
    </BrowserRouter>
  )
}
