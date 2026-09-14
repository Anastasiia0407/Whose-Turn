#!/usr/bin/env node
/**
 * The readable report. Prints; never edits; always exits 0.
 *
 * Exiting 0 even when tokens have drifted is deliberate — this command is for
 * reading, and a human deciding what to do about a difference should not have to
 * fight a non-zero exit. `check-drift.mjs` is the one that fails.
 */

import { diffTokens } from './lib/token-diff.mjs'

const BULLET = '  •'

function heading(text, count) {
  console.log(`\n${text}  (${count})`)
  console.log('─'.repeat(Math.min(72, text.length + 8)))
}

function main() {
  const diff = diffTokens()

  console.log('\nFigma ↔ code token diff')
  console.log(`  snapshot captured ${diff.capturedAt} via ${diff.method}`)

  heading('DRIFTED — same token, different value', diff.drifted.length)
  if (diff.drifted.length === 0) console.log('  none')
  for (const row of diff.drifted) {
    console.log(`${BULLET} ${row.name}`)
    console.log(`      figma  ${row.figmaValue}`)
    console.log(`      code   ${row.codeValue}   ${row.code}`)
    if (row.note) console.log(`      note   ${row.note}`)
  }

  heading('RENAMED — same value, different name', diff.renamed.length)
  for (const row of diff.renamed) {
    console.log(`${BULLET} ${row.name}  →  ${row.code}   ${row.codeValue}`)
  }

  heading('FIGMA ONLY — no code equivalent', diff.figmaOnly.length)
  for (const row of diff.figmaOnly) {
    console.log(`${BULLET} ${row.name} = ${row.value}${row.broken ? '   [BROKEN MAPPING]' : ''}`)
    if (row.note) console.log(`      ${row.note}`)
  }

  heading('CODE ONLY — no Figma variable claims it', diff.codeOnly.length)
  for (const row of diff.codeOnly) {
    console.log(`${BULLET} ${row.name} = ${row.value}`)
  }

  heading('UNVERIFIABLE — documented in Figma, never bound', diff.unverifiable.length)
  for (const row of diff.unverifiable) {
    const code = row.code ? `   code has ${row.code} = ${row.codeValue ?? 'nothing'}` : ''
    console.log(`${BULLET} ${row.name}${code}`)
  }

  heading('UNMAPPED — in Figma, missing from name-map.json', diff.unmapped.length)
  if (diff.unmapped.length === 0) console.log('  none')
  for (const row of diff.unmapped) {
    console.log(`${BULLET} ${row.name} = ${row.value}`)
  }

  heading('COMPOSITE — text and effect styles, compared through their atoms', diff.composite.length)
  for (const row of diff.composite) {
    console.log(`${BULLET} ${row.name}`)
  }

  heading('IDENTICAL', diff.identical.length)
  console.log(`  ${diff.identical.length} token${diff.identical.length === 1 ? '' : 's'} agree`)

  console.log('\nSummary')
  console.log(
    `  ${diff.identical.length} identical · ${diff.drifted.length} drifted · ` +
      `${diff.renamed.length} renamed · ${diff.figmaOnly.length} figma-only · ` +
      `${diff.codeOnly.length} code-only · ${diff.unverifiable.length} unverifiable`,
  )
  console.log(
    '\n  This report does not change anything. The code token layer is what ships;\n' +
      '  what to do about a difference is your call.\n',
  )
}

main()
