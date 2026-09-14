import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * The site is a sibling workspace of the app, not a copy of it.
 *
 * `@ds/*` resolves into `whose-turn/src`, so every component and every token
 * the documentation shows is the module the product actually ships. There is
 * deliberately no build step in between and no published package: an import
 * here is the same file the app imports.
 *
 * Two settings make that work and both are load-bearing:
 *
 *  - `fs.allow` — the alias points OUTSIDE this project root, and Vite's dev
 *    server refuses to serve such files unless the parent is allowlisted.
 *  - `dedupe` — npm workspaces already hoist a single React to the repo root,
 *    but if a nested install ever reappears the site and the app would render
 *    against two React copies and every hook would throw. This pins it.
 */
const appSrc = fileURLToPath(new URL('../whose-turn/src', import.meta.url))
const repoRoot = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@ds': appSrc },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    // 5173 belongs to the app and is strictPort there. The site takes the next
    // one so both dev servers can run at once.
    port: 5174,
    strictPort: true,
    fs: { allow: [repoRoot] },
  },
})
