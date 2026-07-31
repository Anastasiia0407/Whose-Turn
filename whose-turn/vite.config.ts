import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Port 5173 is fixed because .claude/launch.json starts the preview there.
// strictPort makes a collision fail loudly instead of silently moving to 5174,
// which would leave the preview pointing at nothing.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
})
