import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))

/** system-site/ */
export const SITE_ROOT = path.resolve(here, '../..')
/** repo root */
export const REPO_ROOT = path.resolve(SITE_ROOT, '..')
/** the app whose token layer and components are the source of truth */
export const APP_SRC = path.join(REPO_ROOT, 'whose-turn', 'src')

export const FIGMA_DIR = path.join(SITE_ROOT, 'figma')
export const SNAPSHOT_FILE = path.join(FIGMA_DIR, 'tokens.snapshot.json')
export const COMPONENTS_SNAPSHOT_FILE = path.join(FIGMA_DIR, 'components.snapshot.json')
export const NAME_MAP_FILE = path.join(FIGMA_DIR, 'name-map.json')
export const CAPTURE_DIR = path.join(FIGMA_DIR, 'capture')
export const MAPPINGS_DIR = path.join(SITE_ROOT, 'src', 'mappings')

export const TOKENS_CSS = path.join(APP_SRC, 'styles', 'tokens.css')
export const PALETTE_TS = path.join(APP_SRC, 'tokens', 'palette.ts')
export const UI_BARREL = path.join(APP_SRC, 'ui', 'index.ts')

export const FILE_KEY = 'ow8Eo53KIe4QrORvA7TQ2E'

/** Repo-relative, for error messages a human can act on. */
export function rel(absolute) {
  return path.relative(REPO_ROOT, absolute)
}
