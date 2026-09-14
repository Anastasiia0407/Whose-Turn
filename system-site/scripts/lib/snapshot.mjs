import fs from 'node:fs'
import { NAME_MAP_FILE, SNAPSHOT_FILE, COMPONENTS_SNAPSHOT_FILE, rel } from './paths.mjs'

function readJson(file, what) {
  if (!fs.existsSync(file)) {
    throw new Error(
      `Missing ${what}: ${rel(file)}\n` +
        `  Run:  npm --prefix system-site run figma:capture -- --from-mcp <capture.json>`,
    )
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

export function readSnapshot() {
  return readJson(SNAPSHOT_FILE, 'the Figma token snapshot')
}

export function readComponentsSnapshot() {
  return readJson(COMPONENTS_SNAPSHOT_FILE, 'the Figma component snapshot')
}

/** The name map, with the `$comment` key dropped. */
export function readNameMap() {
  const raw = readJson(NAME_MAP_FILE, 'the Figma-to-code name map')
  const map = new Map()
  for (const [key, value] of Object.entries(raw)) {
    if (key.startsWith('$')) continue
    map.set(key, value)
  }
  return map
}

/** Every `code` reference a name-map entry points at, flattened. */
export function codeRefsOf(entry) {
  if (entry.codeExpr) return [entry.codeExpr]
  if (!entry.code) return []
  return Array.isArray(entry.code) ? entry.code : [entry.code]
}
