import { exportedNames, readMappings } from './mappings.mjs'
import { readComponentsSnapshot } from './snapshot.mjs'

/**
 * Reconcile the mapping files against the Figma component snapshot and the
 * code's real exports.
 *
 * Returns findings, not verdicts. The report prints them; the check decides
 * which are fatal.
 */
export function buildCoverage() {
  const snapshot = readComponentsSnapshot()
  const entries = readMappings()

  const connected = entries.filter((e) => e.kind === 'connected')
  const designOnly = entries.filter((e) => e.kind === 'design-only')
  const codeOnly = entries.filter((e) => e.kind === 'code-only')

  const knownNodes = new Map(snapshot.components.map((c) => [c.nodeId, c]))
  for (const component of snapshot.components) {
    for (const variant of component.variants) knownNodes.set(variant.nodeId, component)
  }

  const problems = []
  const accountedFor = new Set()

  /* 1. Every mapping must point at a node that still exists. */
  for (const entry of [...connected, ...designOnly]) {
    if (entry.nodeId === null) continue
    if (!knownNodes.has(entry.nodeId)) {
      problems.push({
        rule: 'stale-node',
        where: entry.where,
        message:
          `${entry.figmaName ?? entry.codeName} maps to node ${entry.nodeId}, which is not in ` +
          `the component snapshot. Either the component was deleted or renamed in Figma, or ` +
          `the snapshot is out of date.`,
        fix: 'Re-capture: npm --prefix system-site run figma:capture -- --from-mcp <capture.json>',
      })
      continue
    }
    accountedFor.add(entry.nodeId)
    for (const covered of entry.covers ?? []) {
      if (!knownNodes.has(covered)) {
        problems.push({
          rule: 'stale-node',
          where: entry.where,
          message: `${entry.figmaName} claims to cover node ${covered}, which no longer exists.`,
          fix: 'Remove the stale id from `covers`, or re-capture the snapshot.',
        })
      } else {
        accountedFor.add(covered)
      }
    }
  }

  /* 2. Every mapping must point at a component the code still exports. */
  for (const entry of connected) {
    if (!entry.codeSource) continue
    const names = exportedNames(entry.codeSource)
    if (names === null) {
      problems.push({
        rule: 'missing-source',
        where: entry.where,
        message: `${entry.figmaName} maps to ${entry.codeSource}, which does not exist.`,
        fix: 'Update codeSource, or restore the module.',
      })
      continue
    }
    for (const name of (entry.codeName ?? '').split(' + ').map((n) => n.trim()).filter(Boolean)) {
      if (!names.has(name)) {
        problems.push({
          rule: 'missing-export',
          where: entry.where,
          message: `${entry.figmaName} maps to \`${name}\`, which ${entry.codeSource} no longer exports.`,
          fix: 'The component was renamed or removed. Update the mapping to match the code.',
        })
      }
    }
  }

  /* 3. Every Figma component must be accounted for. */
  const unaccounted = []
  for (const component of snapshot.components) {
    if (accountedFor.has(component.nodeId)) continue
    const coveredByVariant = component.variants.some((v) => accountedFor.has(v.nodeId))
    if (coveredByVariant) continue
    unaccounted.push(component)
    problems.push({
      rule: 'unmapped-component',
      where: 'system-site/src/mappings/',
      message:
        `Figma component "${component.name}" (${component.nodeId}) has no mapping. ` +
        `Every published component must be either connected to code or declared design-only.`,
      fix: 'Add a figma.connect(...) or figma.designOnly(...) entry in system-site/src/mappings/.',
    })
  }

  /* 4. Every variant value must be covered by the mapping's prop options. */
  const variantGaps = []
  for (const component of snapshot.components) {
    const mapping = connected.find(
      (e) => e.nodeId === component.nodeId || (e.covers ?? []).includes(component.nodeId),
    )
    if (!mapping) continue

    for (const [axis, values] of Object.entries(component.axes ?? {})) {
      const declared = Object.values(mapping.props ?? {}).find((p) => p.figmaProp === axis)
      if (!declared) {
        variantGaps.push({ component: component.name, axis, missing: values, reason: 'axis not mapped' })
        problems.push({
          rule: 'unmapped-axis',
          where: mapping.where,
          message:
            `Figma component "${component.name}" has a variant axis "${axis}" ` +
            `(${values.join(', ')}) that the mapping does not declare.`,
          fix: `Add a prop using figma.enum('${axis}', { ... }) to the mapping.`,
        })
        continue
      }
      const missing = values.filter((value) => !declared.options.includes(value))
      if (missing.length > 0) {
        variantGaps.push({ component: component.name, axis, missing, reason: 'values not mapped' })
        problems.push({
          rule: 'unmapped-variant',
          where: mapping.where,
          message:
            `Figma component "${component.name}" gained ${missing.length} value(s) on axis ` +
            `"${axis}": ${missing.join(', ')} — with no mapping.`,
          fix: `Add the missing value(s) to figma.enum('${axis}', { ... }) in the mapping.`,
        })
      }
    }
  }

  return {
    capturedAt: snapshot.capturedAt,
    connected,
    designOnly,
    codeOnly,
    unaccounted,
    variantGaps,
    problems,
    counts: {
      figmaComponents: snapshot.components.length,
      connected: connected.length,
      designOnly: designOnly.length,
      codeOnly: codeOnly.length,
    },
  }
}
