#!/usr/bin/env node
/**
 * Capture Figma variables into the committed snapshot.
 *
 * TWO PATHS, because this file's plan only permits one of them:
 *
 *   --rest              GET /v1/files/:key/variables/local, using FIGMA_TOKEN.
 *                       Returns collection and mode for every variable, whether
 *                       or not anything is bound to it. ENTERPRISE ONLY. On this
 *                       plan (pro/student) it 403s; the script says so and stops
 *                       rather than writing a half-snapshot.
 *
 *   --from-mcp <file>   Merge a raw Figma MCP sweep. This is the path that works
 *                       here. MCP is an agent tool, not something Node can call,
 *                       so a human or agent runs the sweep and this script turns
 *                       the result into a snapshot with provenance attached.
 *
 * The script NEVER touches the app's token layer. It writes one file:
 * figma/tokens.snapshot.json. What to do about a difference is a decision, and
 * decisions are not made by scripts.
 */

import fs from 'node:fs'
import path from 'node:path'
import { CAPTURE_DIR, FILE_KEY, SNAPSHOT_FILE, rel } from './lib/paths.mjs'

const args = process.argv.slice(2)
const useRest = args.includes('--rest')
const fromMcpIndex = args.indexOf('--from-mcp')

/** Variables the Foundations frames document but no sweep has ever bound. */
const DOCUMENTED_ONLY = [
  'color/black',
  'color/brown/500',
  'color/brown/900',
  'color/cream/50',
  'color/cream/100',
  'color/green/500',
  'color/red/500',
  'color/sand/200',
  'color/teal/500',
  'color/pink/500',
  'color/caramel/500',
  'color/member/4',
  'color/member/5',
  'color/member/6',
  'layout/tap-target',
  'layout/min-width',
  'layout/canvas-width',
  'shadow/offset-sm',
  'shadow/offset-lg',
]

function groupOf(name) {
  if (/^[A-Z]/.test(name)) return 'text-style'
  return name.split('/')[0]
}

async function captureViaRest() {
  const token = process.env.FIGMA_TOKEN
  if (!token) {
    fail(
      'FIGMA_TOKEN is not set.\n' +
        '  The REST path needs a personal access token with file_variables:read.\n' +
        '  Copy system-site/.env.example to .env.local and fill it in.\n' +
        '  NOTE: this endpoint is Enterprise-only and this file is on a pro plan,\n' +
        '  so it will 403 even with a valid token. Use --from-mcp instead.',
    )
  }

  const url = `https://api.figma.com/v1/files/${FILE_KEY}/variables/local`
  const response = await fetch(url, { headers: { 'X-Figma-Token': token } })

  if (response.status === 403) {
    fail(
      `Figma returned 403 for ${url}\n` +
        `  ${(await response.text()).slice(0, 200)}\n\n` +
        '  The Variables REST API requires an Enterprise plan. `whoami` reports this\n' +
        '  account on pro/student tiers, so this is expected and is not a token problem.\n' +
        '  Use:  npm --prefix system-site run figma:capture -- --from-mcp <capture.json>',
    )
  }
  if (!response.ok) {
    fail(`Figma returned ${response.status} for ${url}\n  ${(await response.text()).slice(0, 200)}`)
  }

  const body = await response.json()
  const collections = body.meta?.variableCollections ?? {}
  const variables = body.meta?.variables ?? {}
  const tokens = []

  for (const variable of Object.values(variables)) {
    const collection = collections[variable.variableCollectionId]
    for (const [modeId, value] of Object.entries(variable.valuesByMode ?? {})) {
      const mode = collection?.modes?.find((m) => m.modeId === modeId)
      tokens.push({
        name: variable.name,
        value: formatRestValue(value),
        collection: collection?.name ?? null,
        mode: mode?.name ?? null,
        group: groupOf(variable.name),
        source: 'rest:variables/local',
        boundAt: null,
      })
    }
  }

  return {
    method: 'rest',
    methodNote: 'Full collection read. Coverage is complete: unbound variables are included.',
    tokens: tokens.sort(byName),
    documentedOnly: [],
  }
}

function formatRestValue(value) {
  if (value && typeof value === 'object' && 'r' in value) {
    const to255 = (n) => Math.round(n * 255)
    const hex = [to255(value.r), to255(value.g), to255(value.b)]
      .map((n) => n.toString(16).padStart(2, '0'))
      .join('')
    const alpha = value.a === undefined || value.a === 1 ? '' : to255(value.a).toString(16).padStart(2, '0')
    return `#${hex}${alpha}`
  }
  return String(value)
}

function captureFromMcp(captureFile) {
  const resolved = path.isAbsolute(captureFile) ? captureFile : path.join(CAPTURE_DIR, captureFile)
  if (!fs.existsSync(resolved)) {
    fail(`No such capture file: ${rel(resolved)}`)
  }

  const capture = JSON.parse(fs.readFileSync(resolved, 'utf8'))
  if (capture.fileKey !== FILE_KEY) {
    fail(
      `Capture is for file ${capture.fileKey}, expected ${FILE_KEY}.\n` +
        '  Refusing to merge a sweep of a different Figma file.',
    )
  }
  if (!Array.isArray(capture.sweeps) || capture.sweeps.length === 0) {
    fail(`Capture has no sweeps: ${rel(resolved)}`)
  }

  /** name -> { value, boundAt[] }, with a conflict check across sweeps. */
  const merged = new Map()
  const conflicts = []

  for (const sweep of capture.sweeps) {
    for (const [name, value] of Object.entries(sweep.variables ?? {})) {
      const existing = merged.get(name)
      if (!existing) {
        merged.set(name, { value, boundAt: [sweep.nodeId] })
        continue
      }
      if (existing.value !== value) {
        conflicts.push({ name, a: existing.value, b: value, nodes: [...existing.boundAt, sweep.nodeId] })
      }
      existing.boundAt.push(sweep.nodeId)
    }
  }

  if (conflicts.length > 0) {
    // Two nodes reporting different values for one variable means modes are in
    // play, and the MCP path cannot tell us which is which. Guessing would put a
    // wrong value into a committed snapshot, so stop instead.
    fail(
      'The sweep reports conflicting values for the same variable:\n' +
        conflicts
          .map((c) => `    ${c.name}: "${c.a}" vs "${c.b}"  (nodes ${c.nodes.join(', ')})`)
          .join('\n') +
        '\n\n  This usually means the file has more than one mode. get_variable_defs\n' +
        '  cannot report which mode a value came from, so the snapshot cannot be\n' +
        '  written safely. Resolve in Figma, or capture per mode by hand.',
    )
  }

  const tokens = [...merged.entries()]
    .map(([name, { value, boundAt }]) => ({
      name,
      value,
      collection: null,
      mode: null,
      group: groupOf(name),
      source: 'figma-mcp:get_variable_defs',
      boundAt: [...new Set(boundAt)].sort(),
    }))
    .sort(byName)

  const captured = new Set(tokens.map((t) => t.name))

  return {
    method: 'figma-mcp',
    methodNote:
      'Coverage is binding-driven: get_variable_defs returns only variables bound ' +
      'somewhere in the queried subtree, so a variable used by nothing cannot appear. ' +
      'collection and mode are null because MCP does not report them — that needs the ' +
      'Enterprise-only Variables REST API.',
    captureFile: rel(resolved),
    sweeps: capture.sweeps.map((s) => ({ nodeId: s.nodeId, label: s.label })),
    tokens,
    documentedOnly: DOCUMENTED_ONLY.filter((name) => !captured.has(name)).map((name) => ({
      name,
      group: groupOf(name),
      reason: 'Documented on a Foundations frame; not bound at any node swept, so no value could be read.',
    })),
  }
}

function byName(a, b) {
  return a.name.localeCompare(b.name)
}

function fail(message) {
  console.error(`\nfigma:capture failed\n\n  ${message}\n`)
  process.exit(1)
}

async function main() {
  if (!useRest && fromMcpIndex === -1) {
    fail(
      'Choose a capture path:\n' +
        '    --from-mcp <file>   merge a Figma MCP sweep   (works on this plan)\n' +
        '    --rest              read the Variables API    (Enterprise only)',
    )
  }

  const result = useRest ? await captureViaRest() : captureFromMcp(args[fromMcpIndex + 1])

  const snapshot = {
    $comment: [
      'COMMITTED SNAPSHOT of the Figma side of the design system.',
      'Generated by scripts/figma-capture.mjs. Do not hand-edit.',
      'Committed so the drift check runs in CI without Figma access or a token.',
    ],
    fileKey: FILE_KEY,
    capturedAt: new Date().toISOString().slice(0, 10),
    method: result.method,
    methodNote: result.methodNote,
    captureFile: result.captureFile ?? null,
    sweeps: result.sweeps ?? null,
    tokenCount: result.tokens.length,
    documentedOnlyCount: result.documentedOnly.length,
    tokens: result.tokens,
    documentedOnly: result.documentedOnly,
  }

  fs.writeFileSync(SNAPSHOT_FILE, `${JSON.stringify(snapshot, null, 2)}\n`)

  console.log(`\nWrote ${rel(SNAPSHOT_FILE)}`)
  console.log(`  ${result.tokens.length} variables captured via ${result.method}`)
  if (result.documentedOnly.length > 0) {
    console.log(`  ${result.documentedOnly.length} documented but unbound — no value readable`)
  }
  console.log(`\nNext:  npm --prefix system-site run figma:diff\n`)
}

main().catch((error) => fail(error.stack ?? String(error)))
