import { readCodeTokens } from './code-tokens.mjs'
import { compareValues } from './normalise.mjs'
import { codeRefsOf, readNameMap, readSnapshot } from './snapshot.mjs'

/**
 * Diff the committed Figma snapshot against the code's token layer.
 *
 * Buckets, in the order a reader cares about them:
 *
 *   drifted        same token, different value — the only bucket that fails CI
 *   renamed        same value, different name; recorded so it stops being noise
 *   identical      agreed
 *   figmaOnly      in the design file, nothing in code
 *   codeOnly       in code, nothing in the design file
 *   unverifiable   documented in Figma but never bound, so no value can be read
 *   composite      Figma text/effect styles, compared through their atoms
 *
 * Pure: it reads two files and returns a structure. Printing and exit codes are
 * someone else's job, so the CI check and the human report share one truth.
 */
export function diffTokens() {
  const snapshot = readSnapshot()
  const nameMap = readNameMap()
  const code = readCodeTokens()

  const result = {
    capturedAt: snapshot.capturedAt,
    method: snapshot.method,
    drifted: [],
    renamed: [],
    identical: [],
    figmaOnly: [],
    codeOnly: [],
    unverifiable: [],
    composite: [],
    unmapped: [],
  }

  const claimedCodeRefs = new Set()

  for (const token of snapshot.tokens) {
    const entry = nameMap.get(token.name)

    if (!entry) {
      // A variable exists in Figma that the map has never heard of. Not a drift,
      // but it must be surfaced: someone added a token and nobody decided what
      // it means in code.
      result.unmapped.push({ name: token.name, value: token.value, group: token.group })
      continue
    }

    if (entry.compare === 'composite') {
      result.composite.push({ name: token.name, value: token.value, note: entry.note ?? null })
      continue
    }

    const refs = codeRefsOf(entry)
    if (refs.length === 0) {
      result.figmaOnly.push({
        name: token.name,
        value: token.value,
        group: token.group,
        note: entry.note ?? null,
      })
      continue
    }

    for (const ref of refs) claimedCodeRefs.add(ref)

    for (const ref of refs) {
      const codeValue = code.lookup(ref)
      if (codeValue === null) {
        result.figmaOnly.push({
          name: token.name,
          value: token.value,
          group: token.group,
          note: `Name map points at ${ref}, which does not exist in the code token layer.`,
          broken: true,
        })
        continue
      }

      const comparison = compareValues(entry.compare, token.value, codeValue)
      const row = {
        name: token.name,
        code: ref,
        figmaValue: comparison.figma,
        codeValue: comparison.code,
        rename: Boolean(entry.rename),
        note: entry.note ?? null,
      }

      if (!comparison.equal) result.drifted.push(row)
      else if (entry.rename) result.renamed.push(row)
      else result.identical.push(row)
    }
  }

  for (const token of snapshot.documentedOnly ?? []) {
    const entry = nameMap.get(token.name)
    const refs = entry ? codeRefsOf(entry) : []
    // Claimed, so a code token paired with an unverifiable Figma variable is
    // not ALSO reported as code-only. It is spoken for; we just cannot read the
    // other side's value to compare it.
    for (const ref of refs) claimedCodeRefs.add(ref)
    result.unverifiable.push({
      name: token.name,
      group: token.group,
      code: refs[0] ?? null,
      codeValue: refs[0] ? code.lookup(refs[0]) : null,
      reason: token.reason,
    })
  }

  // Anything in the CSS layer that no Figma variable claims.
  for (const [name, value] of code.css) {
    if (claimedCodeRefs.has(name)) continue
    result.codeOnly.push({ name, value })
  }
  for (let index = 0; index < code.palette.length; index += 1) {
    const ref = `MEMBER_PALETTE[${index}]`
    if (!claimedCodeRefs.has(ref)) {
      result.codeOnly.push({ name: ref, value: code.palette[index] })
    }
  }

  return result
}
