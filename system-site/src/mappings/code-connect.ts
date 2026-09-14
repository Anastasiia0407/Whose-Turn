import type { ReactNode } from 'react'

/**
 * A local stand-in for `@figma/code-connect`.
 *
 * WHY A SHIM RATHER THAN THE REAL PACKAGE
 * Code Connect publishing needs a Dev or Full seat on an Organization or
 * Enterprise plan. This file is on pro/student tiers, and the API says so
 * outright when asked. Installing `@figma/code-connect` would add a dependency
 * whose only command — `figma connect publish` — cannot run.
 *
 * So the mapping files are written in Code Connect's real shape against this
 * shim. Two things follow, and both are the point:
 *
 *  1. They are the repo's source of truth for Figma↔code today. The coverage
 *     table on the site is generated from them, and CI checks them.
 *  2. If the plan is ever upgraded, swapping this import for the real package
 *     is a one-line change per file. Nothing else moves.
 *
 * `designOnly` and `codeOnly` are extensions Code Connect does not have. They
 * exist because an honest inventory has to record the things that DON'T pair up
 * — a Figma component with no code, and a code component with no node — and
 * Code Connect can only describe matches.
 */

/* -------------------------------------------------------------------------- *
 * Prop descriptors
 * -------------------------------------------------------------------------- */

/**
 * Carries the runtime mapping and, through `__type`, the value type — so an
 * `example` below typechecks against the real component's props. If someone
 * renames a Button variant, the mapping file stops compiling.
 */
export type PropDescriptor<T> = {
  kind: 'enum' | 'boolean' | 'string' | 'instance'
  /** The Figma property name, exactly as the variant axis is spelled. */
  figmaProp: string
  /** Figma variant value -> code value. */
  options?: Record<string, unknown>
  __type?: T
}

type PropMap = Record<string, PropDescriptor<unknown>>

type Resolved<M extends PropMap> = {
  [K in keyof M]: M[K] extends PropDescriptor<infer T> ? T : never
}

/* -------------------------------------------------------------------------- *
 * Registry
 * -------------------------------------------------------------------------- */

export type Connection = {
  kind: 'connected'
  /** Figma component name, for the coverage table. */
  figmaName: string
  nodeId: string
  url: string
  /** The exported name of the React component. */
  codeName: string
  /** Where that component lives, repo-relative. */
  codeSource: string
  /** Extra Figma nodes this one mapping accounts for. */
  covers: string[]
  props: Record<string, { figmaProp: string; kind: string; options: string[] }>
  note?: string
}

export type DesignOnly = {
  kind: 'design-only'
  figmaName: string
  /** null when the thing exists in the file but was never published. */
  nodeId: string | null
  reason: string
}

export type CodeOnly = {
  kind: 'code-only'
  codeName: string
  codeSource: string
  reason: string
}

export type Entry = Connection | DesignOnly | CodeOnly

const registry: Entry[] = []

/** Everything declared by the mapping files, in declaration order. */
export function allEntries(): readonly Entry[] {
  return registry
}

/* -------------------------------------------------------------------------- *
 * The API
 * -------------------------------------------------------------------------- */

function nodeIdFromUrl(url: string): string {
  const match = url.match(/node-id=([0-9]+)[-:]([0-9]+)/)
  if (!match) {
    throw new Error(
      `code-connect: could not read a node id out of "${url}". ` +
        'Use a URL of the form https://www.figma.com/design/<key>/?node-id=123-456',
    )
  }
  return `${match[1]}:${match[2]}`
}

type ConnectConfig<M extends PropMap> = {
  figmaName: string
  codeName: string
  codeSource: string
  props?: M
  /** Extra node ids this mapping accounts for, e.g. the eight icon symbols. */
  covers?: string[]
  note?: string
  /**
   * The snippet Dev Mode would show. Never executed here — but it is
   * typechecked, so a prop rename in the app breaks this file at `tsc -b`.
   */
  example?: (props: Resolved<M>) => ReactNode
}

export const figma = {
  connect<M extends PropMap>(_component: unknown, url: string, config: ConnectConfig<M>): void {
    registry.push({
      kind: 'connected',
      figmaName: config.figmaName,
      nodeId: nodeIdFromUrl(url),
      url,
      codeName: config.codeName,
      codeSource: config.codeSource,
      covers: config.covers ?? [],
      note: config.note,
      props: Object.fromEntries(
        Object.entries(config.props ?? {}).map(([name, descriptor]) => [
          name,
          {
            figmaProp: descriptor.figmaProp,
            kind: descriptor.kind,
            options: Object.keys(descriptor.options ?? {}),
          },
        ]),
      ),
    })
  },

  /** A Figma variant axis mapped onto a code value. */
  enum<T>(figmaProp: string, options: Record<string, T>): PropDescriptor<T> {
    return { kind: 'enum', figmaProp, options }
  },

  /** A Figma variant axis that becomes a boolean prop. */
  boolean(figmaProp: string, options?: Record<string, boolean>): PropDescriptor<boolean> {
    return { kind: 'boolean', figmaProp, options: options ?? { True: true, False: false } }
  },

  /** A Figma text layer that becomes a string prop. */
  string(figmaProp: string): PropDescriptor<string> {
    return { kind: 'string', figmaProp }
  },

  /** A Figma instance-swap slot that becomes a node prop. */
  instance(figmaProp: string): PropDescriptor<ReactNode> {
    return { kind: 'instance', figmaProp }
  },

  /* -- Extensions beyond Code Connect -------------------------------------- */

  /**
   * In the design file, deliberately absent from the code.
   *
   * `url` is null for something that exists in the file but was never published
   * as a component — StatusBar is 17 zero-opacity layers on screen frames, not a
   * library entry, and it still belongs in an honest inventory.
   */
  designOnly(url: string | null, entry: { figmaName: string; reason: string }): void {
    registry.push({
      kind: 'design-only',
      figmaName: entry.figmaName,
      nodeId: url === null ? null : nodeIdFromUrl(url),
      reason: entry.reason,
    })
  },

  /** Shipping in the code, with no Figma component behind it. */
  codeOnly(entry: { codeName: string; codeSource: string; reason: string }): void {
    registry.push({ kind: 'code-only', ...entry })
  },
}
