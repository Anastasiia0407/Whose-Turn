import { MEMBER_PALETTE } from '@ds/tokens'
import { fromToken, fromValue, type ColorRef } from '../tokens/color'
import type { TokenName } from '../tokens/resolve'

/**
 * AUTHORED CONTENT — the words on the Figma frames, and the names of things.
 *
 * There is not a single colour value in this file, and there must never be one.
 * What lives here is prose transcribed from the design file plus the NAMES that
 * connect a Figma variable to the code that carries it. Every value the colour
 * pages print is resolved at runtime from those names.
 *
 * Frames: 364:372 primitives · 364:525 semantic · 364:708 member identity.
 */

/* -------------------------------------------------------------------------- *
 * Primitives — frame 364:372
 * -------------------------------------------------------------------------- */

export const PRIMITIVES_LEDE =
  'Raw values with no meaning attached. A component must never reach for one of these directly: if nothing on the semantic shelf fits, the shelf is missing a token.'

export type PrimitiveEntry = {
  /** The Figma variable path. */
  token: string
  /** WHAT IT IS, verbatim from the frame. */
  what: string
  /**
   * Where the running code carries this value.
   *
   * The CSS layer has no primitive shelf — one primitive is named
   * (`--color-brown-800`) and the rest exist only inside the semantic token or
   * the member palette that uses them. So a primitive is shown THROUGH its
   * carrier, and a primitive with no carrier is shown as absent.
   */
  carrier: ColorRef | null
}

export const PRIMITIVES: PrimitiveEntry[] = [
  { token: 'color/amber/500', what: 'Yellow', carrier: fromToken('--color-accent-secondary') },
  { token: 'color/black', what: 'True black', carrier: null },
  { token: 'color/brown/500', what: 'Muted brown for secondary text', carrier: fromToken('--color-text-secondary') },
  {
    token: 'color/brown/800',
    what: 'The ink: every outline, every hard shadow, every heading',
    carrier: fromToken('--color-brown-800'),
  },
  {
    token: 'color/brown/900',
    what: 'Near-black for status bar and home indicator',
    carrier: fromToken('--color-text-primary'),
  },
  {
    token: 'color/caramel/500',
    what: 'Member slot 6',
    carrier: fromValue(MEMBER_PALETTE[5], 'MEMBER_PALETTE[5]'),
  },
  { token: 'color/cream/100', what: 'Pure white surface', carrier: fromToken('--color-background-surface') },
  { token: 'color/cream/50', what: 'App canvas cream', carrier: fromToken('--color-background-primary') },
  { token: 'color/green/500', what: 'Green', carrier: fromToken('--color-accent-success') },
  { token: 'color/orange/600', what: 'Terracotta', carrier: fromToken('--color-accent-primary') },
  {
    token: 'color/pink/500',
    what: 'Member slot 5',
    carrier: fromValue(MEMBER_PALETTE[4], 'MEMBER_PALETTE[4]'),
  },
  { token: 'color/red/500', what: 'Destructive action fill', carrier: fromToken('--color-accent-danger') },
  { token: 'color/sand/200', what: 'Unfilled progress track', carrier: fromToken('--color-progress-track') },
  {
    token: 'color/teal/500',
    what: 'Member slot 4',
    carrier: fromValue(MEMBER_PALETTE[3], 'MEMBER_PALETTE[3]'),
  },
]

/* -------------------------------------------------------------------------- *
 * Semantic — frame 364:525
 * -------------------------------------------------------------------------- */

export const SEMANTIC_LEDE =
  'The shelf you actually use. Each token names a purpose, not a hue. Most alias a primitive; the scrim is a literal because an alias cannot carry opacity.'

export type SemanticEntry = {
  /** The Figma variable path. */
  figmaToken: string
  /** The CSS custom property, or null when the code layer has no equivalent. */
  codeToken: TokenName | null
  /** ALIASES, verbatim from the frame. */
  aliases: string
  /** USED FOR, verbatim from the frame. */
  usedFor: string
}

export const SEMANTIC: SemanticEntry[] = [
  {
    figmaToken: 'color/accent/destructive',
    codeToken: '--color-accent-danger',
    aliases: 'color/red/500',
    usedFor: 'Destructive action fill (delete)',
  },
  {
    figmaToken: 'color/accent/primary',
    codeToken: '--color-accent-primary',
    aliases: 'color/orange/600',
    usedFor: 'Primary action fill',
  },
  {
    figmaToken: 'color/accent/secondary',
    codeToken: '--color-accent-secondary',
    aliases: 'color/amber/500',
    usedFor: 'Secondary accent: members button',
  },
  {
    figmaToken: 'color/accent/success',
    codeToken: '--color-accent-success',
    aliases: 'color/green/500',
    usedFor: 'Selected-chore state',
  },
  {
    figmaToken: 'color/background/primary',
    codeToken: '--color-background-primary',
    aliases: 'color/cream/50',
    usedFor: 'App canvas',
  },
  {
    figmaToken: 'color/background/scrim',
    codeToken: '--color-scrim',
    aliases: 'literal',
    usedFor: 'Bottom-sheet scrim: color/brown/800 at 45% alpha',
  },
  {
    figmaToken: 'color/background/surface',
    codeToken: '--color-background-surface',
    aliases: 'color/cream/100',
    usedFor: 'Raised surface: list rows, sheets content, secondary buttons',
  },
  {
    figmaToken: 'color/border/default',
    codeToken: '--color-border-default',
    aliases: 'color/brown/800',
    usedFor: 'Every outline in the product',
  },
  {
    figmaToken: 'color/text/heading',
    codeToken: '--color-text-heading',
    aliases: 'color/brown/800',
    usedFor: 'Headings and row labels',
  },
  {
    figmaToken: 'color/text/onAccent',
    codeToken: '--color-text-on-accent',
    aliases: 'color/cream/100',
    usedFor: 'Text on a filled accent surface',
  },
  {
    figmaToken: 'color/text/primary',
    codeToken: '--color-text-primary',
    aliases: 'color/brown/900',
    usedFor: 'Status bar and home indicator',
  },
  {
    figmaToken: 'color/text/secondary',
    codeToken: '--color-text-secondary',
    aliases: 'color/brown/500',
    usedFor: 'Subtitles, captions, section labels',
  },
  {
    figmaToken: 'color/track/default',
    codeToken: '--color-progress-track',
    aliases: 'color/sand/200',
    usedFor: 'Unfilled portion of a progress bar',
  },
  {
    figmaToken: 'color/track/fill',
    codeToken: null,
    aliases: 'color/brown/800',
    usedFor: 'Filled portion of a progress bar',
  },
]

/* -------------------------------------------------------------------------- *
 * Member identity — frame 364:708
 * -------------------------------------------------------------------------- */

export const MEMBERS_LEDE =
  'Six slots. A member keeps the same colour across their avatar, die, coin, wheel sector and chip — that consistency is the mechanism by which a person recognises themselves in a draw.'

export type MemberEntry = {
  slot: number
  /** ALIASES, verbatim from the frame — the Figma primitive for this slot. */
  figmaAlias: string
  /** CODE, verbatim from the frame. */
  codeExpression: string
  /** The live colour, imported from the app. */
  color: ColorRef
}

export const MEMBERS: MemberEntry[] = MEMBER_PALETTE.map((value, index) => ({
  slot: index + 1,
  figmaAlias: [
    'color/orange/600',
    'color/amber/500',
    'color/green/500',
    'color/teal/500',
    'color/pink/500',
    'color/caramel/500',
  ][index],
  codeExpression: `MEMBER_PALETTE[${index}]`,
  color: fromValue(value, `MEMBER_PALETTE[${index}]`),
}))

/** TWO THINGS TO KNOW, verbatim from frame 364:708. */
export const MEMBER_FINDINGS: { finding: string; detail: string }[] = [
  {
    finding: 'Slot 3 reuses the success green',
    detail:
      'color/member/3 and color/accent/success are the same green. On the dice screen it means both "chosen" and "member 3".',
  },
  {
    finding: 'The wheel has them backwards',
    detail:
      'Wheel segments give each member the other one’s colour — all 12, consistently. Left as-is by decision on 2026-08-10.',
  },
]
