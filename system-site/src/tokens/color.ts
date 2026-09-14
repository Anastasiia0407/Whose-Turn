import {
  resolveColor,
  resolveColorValue,
  type Rgba,
  type TokenName,
} from './resolve'

/**
 * Where a colour on this site can come from.
 *
 * Exactly two sources are legitimate, and neither is a value typed into a page:
 *
 *  - `token`  a CSS custom property from `tokens.css`
 *  - `value`  a literal IMPORTED from the app's TypeScript — in practice only
 *             `MEMBER_PALETTE`, which is where member identity actually lives
 *
 * Modelling both as one type means every consumer — swatch, contrast readout,
 * avatar demo — handles them identically and none of them can quietly grow a
 * third source.
 */
export type ColorRef =
  | { kind: 'token'; token: TokenName }
  | { kind: 'value'; value: string; label: string }

export function fromToken(token: TokenName): ColorRef {
  return { kind: 'token', token }
}

export function fromValue(value: string, label: string): ColorRef {
  return { kind: 'value', value, label }
}

/** What to print as the reference's name. */
export function refLabel(ref: ColorRef): string {
  return ref.kind === 'token' ? ref.token : ref.label
}

/** The CSS to paint with — always a reference, never an interpolated value. */
export function refCss(ref: ColorRef): string {
  return ref.kind === 'token' ? `var(${ref.token})` : ref.value
}

/** Resolve either kind to sRGB, or null when it does not resolve. */
export function resolveRef(ref: ColorRef): Rgba | null {
  return ref.kind === 'token'
    ? resolveColor(ref.token)
    : resolveColorValue(ref.value)
}
