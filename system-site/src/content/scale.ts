import type { TokenName } from '../tokens/resolve'

/**
 * AUTHORED CONTENT — frames 366:271 spacing · 366:443 radius, border & shadow ·
 * 366:555 layout.
 *
 * Names and prose only. Every px figure the pages show is resolved from the
 * token layer at runtime, including the ones the frames also write down.
 */

/* -------------------------------------------------------------------------- *
 * Spacing — frame 366:271
 * -------------------------------------------------------------------------- */

export const SPACING_LEDE =
  'One scale, twelve steps. The rhythm is mostly 2·4·6·8·12·16·20·24·32·40 — with two documented exceptions that earned their place.'

export type ScaleEntry = {
  /** The Figma variable path. */
  figmaToken: string
  /** The CSS custom property, or null when the code layer has no equivalent. */
  codeToken: TokenName | null
  /** USED FOR / USED ON, verbatim from the frame. */
  usedFor: string
}

export const SPACING: ScaleEntry[] = [
  { figmaToken: 'spacing/2xs', codeToken: '--spacing-2xs', usedFor: 'Hairline inset used on almost every container' },
  { figmaToken: 'spacing/xs', codeToken: '--spacing-xs', usedFor: 'Tight gap inside title blocks' },
  { figmaToken: 'spacing/sm', codeToken: '--spacing-sm', usedFor: 'Status-bar icon gap' },
  {
    figmaToken: 'spacing/md',
    codeToken: '--spacing-md',
    usedFor: 'Gap between a label and its field; icon-to-label gap in buttons',
  },
  { figmaToken: 'spacing/inline', codeToken: '--spacing-inline', usedFor: 'Member-row gap and sheet-header inset' },
  { figmaToken: 'spacing/lg', codeToken: '--spacing-lg', usedFor: 'Row gap and vertical padding' },
  { figmaToken: 'spacing/xl', codeToken: '--spacing-xl', usedFor: 'Screen gutter' },
  { figmaToken: 'spacing/2xl', codeToken: '--spacing-2xl', usedFor: 'Right padding of list rows' },
  {
    figmaToken: 'spacing/3xl',
    codeToken: '--spacing-3xl',
    usedFor: 'Left padding of chore rows; screen-level section gap',
  },
  { figmaToken: 'spacing/sheet-top', codeToken: '--spacing-sheet-top', usedFor: 'Bottom-sheet top padding' },
  { figmaToken: 'spacing/4xl', codeToken: '--spacing-4xl', usedFor: 'Bottom padding of every screen' },
  { figmaToken: 'spacing/5xl', codeToken: null, usedFor: 'Hero top spacing — login only' },
]

/** THE TWO EXCEPTIONS, verbatim from frame 366:271. */
export const SPACING_EXCEPTIONS: { token: string; value: string; why: string }[] = [
  {
    token: 'spacing/lg',
    value: '14px',
    why: 'Sits outside the rhythm but carries the vertical padding of every row — 122 bindings. Changing it changes the height of every list in the product.',
  },
  {
    token: 'spacing/5xl',
    value: '96px',
    why: 'Hero top spacing on login. 96 = 6× the gutter = 4× spacing/3xl. Added as a scale step rather than left as a one-off.',
  },
]

/* -------------------------------------------------------------------------- *
 * Radius, border & shadow — frame 366:443
 * -------------------------------------------------------------------------- */

export const RADIUS_LEDE =
  'The three properties that make the product look drawn rather than rendered: thick outlines, generous corners, and a hard shadow with no blur at all.'

export const RADIUS: ScaleEntry[] = [
  { figmaToken: 'radius/sm', codeToken: '--radius-sm', usedFor: 'Icon buttons and home indicator' },
  { figmaToken: 'radius/avatar', codeToken: '--radius-avatar', usedFor: 'Avatar corner radius' },
  { figmaToken: 'radius/md', codeToken: '--radius-md', usedFor: 'Rows, inputs, chips, sheet top corners' },
  { figmaToken: 'radius/full', codeToken: '--radius-full', usedFor: 'Pill buttons' },
]

export const BORDERS: ScaleEntry[] = [
  { figmaToken: 'border/xs', codeToken: null, usedFor: 'Hairline outline used only on the 20px avatar' },
  { figmaToken: 'border/sm', codeToken: '--border-sm', usedFor: 'Default outline width' },
  { figmaToken: 'border/lg', codeToken: '--border-lg', usedFor: 'Emphasised outline: CTAs, selected row, sheet' },
]

export const SHADOW_OFFSETS: ScaleEntry[] = [
  {
    figmaToken: 'shadow/offset-sm',
    codeToken: '--shadow-offset-sm',
    usedFor: 'Hard-shadow offset for 44px icon buttons',
  },
  {
    figmaToken: 'shadow/offset-lg',
    codeToken: '--shadow-offset-lg',
    usedFor: 'Hard-shadow offset for rows, inputs, CTAs',
  },
]

/** THE SHADOW IS NOT A MISTAKE, verbatim from frame 366:443. */
export const SHADOW_NOTE =
  'Both shadows have zero blur and zero spread: 4px 4px 0 and 2px 2px 0, always in the brand ink. That flat offset is the style. A soft shadow would read as a different product.'

/* -------------------------------------------------------------------------- *
 * Layout — frame 366:555
 * -------------------------------------------------------------------------- */

export const LAYOUT_LEDE =
  'Three numbers that describe the canvas and the smallest thing a finger can reliably hit.'

export const LAYOUT: ScaleEntry[] = [
  { figmaToken: 'layout/tap-target', codeToken: '--layout-tap-target', usedFor: 'Minimum interactive target' },
  { figmaToken: 'layout/min-width', codeToken: '--layout-min-width', usedFor: 'Fluid floor' },
  { figmaToken: 'layout/canvas-width', codeToken: '--layout-canvas-width', usedFor: 'Design canvas width' },
]

/** ONE MISMATCH WORTH KNOWING, verbatim from frame 366:555. */
export const LAYOUT_MISMATCH = {
  where: 'Canvas height',
  what: 'Figma frames are 700px tall; the code canvas is 844. The width matches at 390. Screens are designed shorter than they render.',
}
