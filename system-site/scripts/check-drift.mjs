#!/usr/bin/env node
/**
 * The CI gate.
 *
 * Fails when, and only when, something has genuinely come apart:
 *
 *   1. a code token no longer matches the committed Figma snapshot
 *   2. a Figma component gained a variant with no mapping
 *   3. a mapping points at a node, a module or an export that no longer exists
 *   4. a Figma variable exists that name-map.json has never heard of
 *
 * Everything else — renames, one-sided tokens, unverifiable variables — is
 * reported and passes. Those are known, decided states of this system, and a
 * check that fails on them would be muted within a week.
 *
 * Accepted drift is declared in figma/accepted-drift.json with a reason and a
 * date. That file is the difference between "we decided this" and "nobody
 * noticed": a drift with no entry fails, and an entry that no longer matches a
 * real drift also fails, so the list cannot rot.
 */

import fs from 'node:fs'
import path from 'node:path'
import { diffTokens } from './lib/token-diff.mjs'
import { buildCoverage } from './lib/coverage.mjs'
import { FIGMA_DIR, rel } from './lib/paths.mjs'

const ACCEPTED_FILE = path.join(FIGMA_DIR, 'accepted-drift.json')

function readAccepted() {
  if (!fs.existsSync(ACCEPTED_FILE)) return new Map()
  const raw = JSON.parse(fs.readFileSync(ACCEPTED_FILE, 'utf8'))
  return new Map(
    (raw.accepted ?? []).map((entry) => [`${entry.token}@${entry.code}`, entry]),
  )
}

const failures = []
const notes = []

/* -- 1. Tokens ------------------------------------------------------------ */

const diff = diffTokens()
const accepted = readAccepted()
const matchedAcceptances = new Set()

for (const row of diff.drifted) {
  const key = `${row.name}@${row.code}`
  const entry = accepted.get(key)
  if (entry && entry.figma === row.figmaValue && entry.codeValue === row.codeValue) {
    matchedAcceptances.add(key)
    notes.push(
      `accepted drift  ${row.name}: figma ${row.figmaValue} vs code ${row.codeValue}\n` +
        `                  ${entry.reason} (${entry.decidedOn})`,
    )
    continue
  }

  failures.push({
    title: `Token drifted: ${row.name}`,
    detail:
      `  Figma snapshot says  ${row.figmaValue}\n` +
      `  Code says            ${row.codeValue}   (${row.code})` +
      (entry
        ? `\n\n  There IS an acceptance for this token, but it no longer matches:\n` +
          `    accepted: figma ${entry.figma} vs code ${entry.codeValue}\n` +
          `    actual:   figma ${row.figmaValue} vs code ${row.codeValue}`
        : ''),
    fix:
      'Decide which side is right, then either:\n' +
      '    • change the code token in whose-turn/src/styles/tokens.css (or palette.ts), or\n' +
      '    • change the variable in Figma and re-run figma:capture, or\n' +
      `    • record the difference in ${rel(ACCEPTED_FILE)} with a reason and a date.`,
  })
}

for (const [key, entry] of accepted) {
  if (matchedAcceptances.has(key)) continue
  failures.push({
    title: `Stale acceptance: ${entry.token}`,
    detail:
      `  ${rel(ACCEPTED_FILE)} accepts a drift on ${entry.token} that is no longer there.\n` +
      `  Accepted: figma ${entry.figma} vs code ${entry.codeValue}`,
    fix: 'The drift was resolved. Remove the entry so the list stays honest.',
  })
}

for (const row of diff.unmapped) {
  failures.push({
    title: `Unmapped Figma variable: ${row.name}`,
    detail: `  Figma has ${row.name} = ${row.value}, and name-map.json has never heard of it.`,
    fix:
      `Add an entry to ${rel(path.join(FIGMA_DIR, 'name-map.json'))} saying which code token it\n` +
      '    corresponds to, or `"code": null` with a note if it deliberately has none.',
  })
}

for (const row of diff.figmaOnly.filter((r) => r.broken)) {
  failures.push({
    title: `Broken name mapping: ${row.name}`,
    detail: `  ${row.note}`,
    fix: 'Point the map at a token that exists, or set it to null with a note.',
  })
}

/* -- 2. Components -------------------------------------------------------- */

const coverage = buildCoverage()
for (const problem of coverage.problems) {
  failures.push({
    title: `${problem.rule}: ${problem.message}`,
    detail: `  declared at ${problem.where}`,
    fix: problem.fix,
  })
}

/* -- Report --------------------------------------------------------------- */

console.log('\nDesign-system drift check')
console.log(
  `  tokens: ${diff.identical.length} identical, ${diff.drifted.length} drifted, ` +
    `${diff.renamed.length} renamed, ${diff.figmaOnly.length} figma-only, ` +
    `${diff.codeOnly.length} code-only, ${diff.unverifiable.length} unverifiable`,
)
console.log(
  `  components: ${coverage.counts.connected} connected, ` +
    `${coverage.counts.designOnly} design-only, ${coverage.counts.codeOnly} code-only`,
)

for (const note of notes) console.log(`\n  ${note}`)

if (failures.length === 0) {
  console.log('\n  PASS — nothing has drifted apart.\n')
  process.exit(0)
}

console.log(`\n${'━'.repeat(72)}`)
console.log(`FAILED — ${failures.length} problem${failures.length === 1 ? '' : 's'}`)
console.log('━'.repeat(72))

for (const [index, failure] of failures.entries()) {
  console.log(`\n${index + 1}. ${failure.title}`)
  if (failure.detail) console.log(failure.detail)
  console.log(`\n  To fix:\n    ${failure.fix.split('\n').join('\n    ')}`)
}

console.log(`\n${'━'.repeat(72)}`)
console.log('Useful commands:')
console.log('  npm --prefix system-site run figma:diff       full token report')
console.log('  npm --prefix system-site run figma:coverage   full component table')
console.log('  npm --prefix system-site run figma:capture -- --from-mcp <file>')
console.log(`${'━'.repeat(72)}\n`)

process.exit(1)
