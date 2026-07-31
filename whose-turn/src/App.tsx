import { BrowserRouter } from 'react-router-dom'
import { HouseholdProvider } from './state'
import { AppRoutes } from './routes/AppRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <HouseholdProvider>
        <AppRoutes />
      </HouseholdProvider>
    </BrowserRouter>
  )
}
