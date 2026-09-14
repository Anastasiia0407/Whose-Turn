import fs from 'node:fs'
import { PALETTE_TS, TOKENS_CSS, rel } from './paths.mjs'

/**
 * Read the code's token layer.
 *
 * Two sources, because the system genuinely has two: `tokens.css` holds the
 * custom properties, and `palette.ts` holds member identity, which is stored
 * per member and passed as a prop rather than declared as CSS.
 *
 * This READS ONLY. Nothing in this pipeline writes to the app — code is what
 * ships, and a diff is a decision for a human, not an edit for a script.
 */

/** Strip comments so a commented-out declaration is never read as live. */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

/**
 * Every custom property declared in the `:root` block, with one level of var()
 * substitution resolved so aliases like --layout-gutter report a real value.
 */
export function readCssTokens() {
  const raw = fs.readFileSync(TOKENS_CSS, 'utf8')
  const source = stripComments(raw)

  const rootMatch = source.match(/:root\s*\{([\s\S]*?)\n\}/)
  if (!rootMatch) {
    throw new Error(
      `Could not find a :root block in ${rel(TOKENS_CSS)}. The token layer moved, ` +
        `or its shape changed — this parser needs updating before the diff can be trusted.`,
    )
  }

  const tokens = new Map()
  const declaration = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi
  let match
  while ((match = declaration.exec(rootMatch[1])) !== null) {
    tokens.set(match[1], match[2].trim().replace(/\s+/g, ' '))
  }

  // Resolve var() chains. Bounded rather than recursive: a cycle would other-
  // wise hang the check, and a token layer with a cycle is broken anyway.
  for (let pass = 0; pass < 5; pass += 1) {
    let changed = false
    for (const [name, value] of tokens) {
      const resolved = value.replace(/var\((--[a-z0-9-]+)(?:\s*,[^)]*)?\)/gi, (whole, ref) =>
        tokens.has(ref) ? tokens.get(ref) : whole,
      )
      if (resolved !== value) {
        tokens.set(name, resolved)
        changed = true
      }
    }
    if (!changed) break
  }

  return tokens
}

/** MEMBER_PALETTE, in order, from the app's TypeScript. */
export function readMemberPalette() {
  const source = fs.readFileSync(PALETTE_TS, 'utf8')
  const block = source.match(/export const MEMBER_PALETTE\s*=\s*\[([\s\S]*?)\]\s*as const/)
  if (!block) {
    throw new Error(
      `Could not find MEMBER_PALETTE in ${rel(PALETTE_TS)}. Member colours moved — ` +
        `update this parser before trusting the member rows of the diff.`,
    )
  }
  return [...block[1].matchAll(/'(#[0-9a-fA-F]{3,8})'/g)].map((m) => m[1])
}

/**
 * One lookup covering both sources.
 *
 * `--custom-property` resolves from the CSS; `MEMBER_PALETTE[n]` resolves from
 * the array. The name map decides which form a Figma variable points at.
 */
export function readCodeTokens() {
  const css = readCssTokens()
  const palette = readMemberPalette()

  return {
    css,
    palette,
    lookup(reference) {
      if (reference.startsWith('--')) {
        return css.has(reference) ? css.get(reference) : null
      }
      const member = reference.match(/^MEMBER_PALETTE\[(\d+)\]$/)
      if (member) {
        const index = Number(member[1])
        return index < palette.length ? palette[index] : null
      }
      return null
    },
  }
}
