#!/usr/bin/env node
/** The Figma ↔ code coverage table, printed. Reads only; always exits 0. */

import { buildCoverage } from './lib/coverage.mjs'

const coverage = buildCoverage()

console.log('\nFigma ↔ code coverage')
console.log(`  component snapshot captured ${coverage.capturedAt}`)

console.log(`\nCONNECTED  (${coverage.connected.length})`)
console.log('─'.repeat(72))
for (const entry of coverage.connected) {
  const axes = Object.values(entry.props ?? {})
    .filter((p) => p.figmaProp)
    .map((p) => `${p.figmaProp}{${p.options.length}}`)
    .join(' ')
  console.log(`  ${entry.figmaName.padEnd(34)} → ${entry.codeName}`)
  console.log(`    ${entry.nodeId.padEnd(32)}   ${entry.codeSource}`)
  if (axes) console.log(`    axes: ${axes}`)
}

console.log(`\nDESIGN ONLY — in Figma, deliberately not in code  (${coverage.designOnly.length})`)
console.log('─'.repeat(72))
for (const entry of coverage.designOnly) {
  console.log(`  ${entry.figmaName.padEnd(34)} ${entry.nodeId ?? 'not published'}`)
}

console.log(`\nCODE ONLY — shipping, no Figma component  (${coverage.codeOnly.length})`)
console.log('─'.repeat(72))
for (const entry of coverage.codeOnly) {
  console.log(`  ${entry.codeName.padEnd(34)} ${entry.codeSource}`)
}

console.log(`\nSummary`)
console.log(
  `  ${coverage.counts.figmaComponents} Figma components · ` +
    `${coverage.counts.connected} connected · ${coverage.counts.designOnly} design-only · ` +
    `${coverage.counts.codeOnly} code-only`,
)

if (coverage.problems.length > 0) {
  console.log(`\n  ${coverage.problems.length} problem(s) — run figma:check for details`)
} else {
  console.log('\n  No coverage problems.')
}
console.log()
