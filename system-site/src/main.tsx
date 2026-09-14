import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

/* Order matters, and it is the app's own order: faces, then the token layer,
   then the site's chrome — which consumes the tokens and must land after them.
   Both of the first two are the app's real files, reached through the `@ds`
   alias. Nothing here is a copy, so the site cannot document a token layer that
   differs from the product's. */
import '@ds/styles/fonts.css'
import '@ds/styles/tokens.css'
import './site.css'

import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
