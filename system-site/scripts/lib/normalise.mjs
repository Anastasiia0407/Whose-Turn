/**
 * Value normalisers.
 *
 * Figma and CSS write the same value differently — a bare `16` against `16px`,
 * `#33201473` against `rgba(51, 32, 20, 0.45)`, `Bold` against `700`. Comparing
 * the raw strings would report every token in the system as drifted.
 *
 * This is the whole of the "diff logic", and it is why no design-token framework
 * is needed here: five normalisers over ~60 tokens is a switch statement, not a
 * build pipeline.
 */

/** #RRGGBB / #RGB / rgb() / rgba() -> { r, g, b, a } or null. */
export function parseColor(value) {
  if (typeof value !== 'string') return null
  const text = value.trim().toLowerCase()

  const hex = text.match(/^#([0-9a-f]{3,8})$/)
  if (hex) {
    let digits = hex[1]
    if (digits.length === 3) digits = [...digits].map((d) => d + d).join('')
    if (digits.length === 6) digits += 'ff'
    if (digits.length !== 8) return null
    return {
      r: parseInt(digits.slice(0, 2), 16),
      g: parseInt(digits.slice(2, 4), 16),
      b: parseInt(digits.slice(4, 6), 16),
      a: parseInt(digits.slice(6, 8), 16) / 255,
    }
  }

  const fn = text.match(/^rgba?\(([^)]+)\)$/)
  if (fn) {
    const parts = fn[1].split(/[,\s/]+/).filter(Boolean).map(Number)
    if (parts.length < 3 || parts.some(Number.isNaN)) return null
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] === undefined ? 1 : parts[3] }
  }

  return null
}

function colorsEqual(a, b) {
  const x = parseColor(a)
  const y = parseColor(b)
  if (!x || !y) return false
  // Alpha is compared at 8-bit precision: Figma stores it as a byte, CSS as a
  // decimal, and 0.45 vs 115/255 differ in the seventh decimal place.
  return (
    x.r === y.r &&
    x.g === y.g &&
    x.b === y.b &&
    Math.round(x.a * 255) === Math.round(y.a * 255)
  )
}

/** A bare number, or a px length. Returns a number or null. */
export function parseLength(value) {
  if (typeof value !== 'string') return null
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)(px)?$/)
  return match ? Number(match[1]) : null
}

const WEIGHTS = {
  thin: 100,
  extralight: 200,
  light: 300,
  regular: 400,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
}

export function parseFontWeight(value) {
  if (typeof value !== 'string') return null
  const text = value.trim().toLowerCase().replace(/[\s-]/g, '')
  if (/^\d+$/.test(text)) return Number(text)
  return WEIGHTS[text] ?? null
}

/** The first family of a CSS stack, unquoted. */
export function headFamily(value) {
  if (typeof value !== 'string') return null
  const first = value.split(',')[0]?.trim()
  if (!first) return null
  return first.replace(/^['"]|['"]$/g, '').toLowerCase()
}

/**
 * Compare a Figma value with a code value under the named strategy.
 *
 * Returns { equal, figma, code } where the two values are the NORMALISED forms,
 * so a report can show what was actually compared rather than the raw strings.
 */
export function compareValues(strategy, figmaValue, codeValue) {
  switch (strategy) {
    case 'color':
    case 'color8': {
      const f = parseColor(figmaValue)
      const c = parseColor(codeValue)
      return {
        equal: colorsEqual(figmaValue, codeValue),
        figma: f ? formatRgba(f) : figmaValue,
        code: c ? formatRgba(c) : codeValue,
      }
    }
    case 'length': {
      const f = parseLength(figmaValue)
      const c = parseLength(codeValue)
      return {
        equal: f !== null && c !== null && f === c,
        figma: f === null ? figmaValue : `${f}px`,
        code: c === null ? codeValue : `${c}px`,
      }
    }
    case 'fontWeight': {
      const f = parseFontWeight(figmaValue)
      const c = parseFontWeight(codeValue)
      return {
        equal: f !== null && c !== null && f === c,
        figma: f === null ? figmaValue : String(f),
        code: c === null ? codeValue : String(c),
      }
    }
    case 'fontFamilyHead': {
      const f = headFamily(figmaValue)
      const c = headFamily(codeValue)
      return { equal: f !== null && c !== null && f === c, figma: f ?? figmaValue, code: c ?? codeValue }
    }
    default:
      return { equal: false, figma: figmaValue, code: codeValue }
  }
}

function formatRgba({ r, g, b, a }) {
  if (Math.round(a * 255) === 255) {
    return `#${[r, g, b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('')}`
  }
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${Number(a.toFixed(3))})`
}
