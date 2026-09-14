/**
 * Runtime access to the token layer.
 *
 * Nothing here knows a single token NAME or VALUE. Every name is discovered by
 * reading the `:root` rules the browser actually loaded, and every value is
 * resolved by asking the browser what it computed. That is the whole point: the
 * documentation cannot describe a token layer other than the one shipping,
 * because it has no independent copy to describe.
 *
 * The token layer itself is `whose-turn/src/styles/tokens.css`, imported by
 * `main.tsx` through the `@ds` alias. Edit a value there and every page that
 * shows it changes on the next HMR tick, with no edit here.
 */

/** A custom property, as declared on `:root`. */
export type TokenName = `--${string}`

/**
 * One hidden element, reused for every resolution.
 *
 * Values are resolved by SETTING them on a real element and reading back what
 * the browser computed, rather than by parsing the declared text. That is the
 * only way to get a trustworthy answer for a token defined in terms of other
 * tokens — `--shadow-hard-lg` is built from two other variables, and
 * `--layout-gutter` is an alias of `--spacing-xl`.
 */
let probe: HTMLElement | null = null

function getProbe(): HTMLElement {
  if (probe?.isConnected) return probe
  const el = document.createElement('div')
  el.setAttribute('aria-hidden', 'true')
  el.style.cssText =
    'position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none;contain:strict'
  document.body.appendChild(el)
  probe = el
  return el
}

/** The declared text of a token, or '' when it is not defined at all. */
export function rawValue(name: TokenName): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/** Whether the token layer defines this name. */
export function exists(name: TokenName): boolean {
  return rawValue(name) !== ''
}

export type Rgba = { r: number; g: number; b: number; a: number }

function parseComputedColor(value: string): Rgba | null {
  // getComputedStyle always normalises `color` to rgb()/rgba() — or to
  // `color(srgb ...)` in newer engines for wide-gamut inputs. Handle both.
  const nums = value.match(/-?[\d.]+(?:e[-+]?\d+)?/gi)
  if (!nums || nums.length < 3) return null
  const isColorFn = value.startsWith('color(')
  const scale = isColorFn ? 255 : 1
  const [r, g, b, a] = nums.map(Number)
  return {
    r: r * scale,
    g: g * scale,
    b: b * scale,
    a: a === undefined ? 1 : a,
  }
}

/**
 * Resolve a token to sRGB, through the real cascade.
 *
 * Returns null when the token is undefined or does not name a colour, so a
 * caller can render "not in the token layer" instead of a plausible lie.
 */
export function resolveColor(name: TokenName): Rgba | null {
  if (!exists(name)) return null
  const el = getProbe()

  // `background-color`, not `color`, and the reason is load-bearing.
  //
  // When a var() substitution yields something the property cannot accept, the
  // declaration is invalid at computed-value time and the property falls back
  // to its INHERITED value for an inherited property, or to its INITIAL value
  // for a non-inherited one. `color` is inherited, so probing with it made
  // `--spacing-xl` report the page's text colour instead of failing — a wrong
  // answer that looked entirely plausible.
  //
  // `background-color` is not inherited and its initial value is transparent,
  // which gives an unambiguous failure signal: alpha 0. No token in the layer
  // is fully transparent, so nothing real is misread as a failure.
  el.style.backgroundColor = ''
  el.style.backgroundColor = `var(${name})`
  const rgba = parseComputedColor(getComputedStyle(el).backgroundColor)
  if (!rgba || rgba.a === 0) return null
  return rgba
}

/**
 * Resolve a colour LITERAL through the same engine path.
 *
 * For values that reach the site as imported JavaScript rather than as a custom
 * property — `MEMBER_PALETTE` is the only such source, because member identity
 * is stored per member and lives in TypeScript, not in `tokens.css`.
 *
 * This is for IMPORTED values only. It is not a licence to pass a hex written
 * into a page; if a page can type the argument, the value has escaped the
 * system and belongs back in it.
 */
export function resolveColorValue(value: string): Rgba | null {
  const el = getProbe()
  el.style.backgroundColor = ''
  el.style.backgroundColor = value
  const rgba = parseComputedColor(getComputedStyle(el).backgroundColor)
  if (!rgba || rgba.a === 0) return null
  return rgba
}

/**
 * Resolve a token to pixels, through the real cascade.
 *
 * Uses `width` rather than arithmetic so `calc()`, aliases and unit conversions
 * are all handled by the engine. Returns null for anything that is not a
 * length.
 */
export function resolveLength(name: TokenName): number | null {
  if (!exists(name)) return null
  const el = getProbe()

  // `padding-top` for the same reason `background-color` is used above: it is
  // not inherited, so an invalid value falls back to its initial 0px rather
  // than to something inherited and believable. A colour token probed here
  // reports 0 and is correctly rejected.
  //
  // The cost is that a token of exactly 0 would be indistinguishable from a
  // failure. None exists, and a 0 step is not a step.
  el.style.paddingTop = ''
  el.style.paddingTop = `var(${name})`
  const px = Number.parseFloat(getComputedStyle(el).paddingTop)
  if (!Number.isFinite(px) || px <= 0) return null
  return px
}

/** Format an Rgba back to the shortest honest CSS string. */
export function formatColor({ r, g, b, a }: Rgba): string {
  const round = (n: number) => Math.round(n)
  if (a >= 1) {
    const hex = [r, g, b]
      .map((n) => round(n).toString(16).padStart(2, '0'))
      .join('')
    return `#${hex}`
  }
  return `rgba(${round(r)}, ${round(g)}, ${round(b)}, ${Number(a.toFixed(3))})`
}

/**
 * Resolve a token by applying it to one CSS property and reading the result.
 *
 * The escape hatch for values that are neither a colour nor a length — a font
 * stack, a weight, a line-height. Same principle as the two above: ask the
 * engine, never parse the text.
 */
export function resolveComputed(
  name: TokenName,
  property: 'fontFamily' | 'fontWeight' | 'fontSize' | 'lineHeight',
): string | null {
  if (!exists(name)) return null
  const el = getProbe()
  // Reset first: the probe is shared, and a failed declaration would otherwise
  // read back the previous token's value.
  el.style[property] = ''
  el.style[property] = `var(${name})`
  const computed = getComputedStyle(el)[property]
  return computed === '' ? null : computed
}

/* ------------------------------------------------------------------------ *
 * Discovery
 * ------------------------------------------------------------------------ */

function collectFromRules(rules: CSSRuleList, into: Set<TokenName>): void {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      // `:root` is where the token layer declares; anything else is a component
      // or site-chrome rule and is not part of the system's vocabulary.
      if (!/(^|,)\s*:root\b/.test(rule.selectorText)) continue
      for (const property of Array.from(rule.style)) {
        if (property.startsWith('--')) into.add(property as TokenName)
      }
    } else if ('cssRules' in rule) {
      collectFromRules((rule as CSSGroupingRule).cssRules, into)
    }
  }
}

/**
 * Every custom property declared on `:root` by any loaded stylesheet, sorted.
 *
 * Discovered, never listed. Adding a token to `tokens.css` makes it appear here
 * with no change to the site.
 */
export function listCustomProperties(): TokenName[] {
  const names = new Set<TokenName>()
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      // A cross-origin sheet cannot be read. We only ship same-origin CSS, so
      // this is a foreign stylesheet and not ours to document.
      continue
    }
    collectFromRules(rules, names)
  }
  return [...names].sort()
}

/**
 * The shelf a token sits on, taken from its own name.
 *
 * This reads the token layer's naming convention — which mirrors the Figma
 * variable path — rather than encoding a list of tokens. A new `--spacing-*`
 * token files itself.
 */
export type TokenGroup =
  | 'color'
  | 'spacing'
  | 'radius'
  | 'border'
  | 'shadow'
  | 'type'
  | 'font'
  | 'layout'
  | 'other'

export function groupOf(name: TokenName): TokenGroup {
  const stem = name.slice(2).split('-')[0]
  switch (stem) {
    case 'color':
    case 'spacing':
    case 'radius':
    case 'border':
    case 'shadow':
    case 'type':
    case 'font':
    case 'layout':
      return stem
    default:
      return 'other'
  }
}

export function tokensInGroup(
  names: readonly TokenName[],
  group: TokenGroup,
): TokenName[] {
  return names.filter((name) => groupOf(name) === group)
}

/* ------------------------------------------------------------------------ *
 * Type styles
 * ------------------------------------------------------------------------ */

/** The four axes a type token group can declare. */
export type TypeAxis = 'family' | 'weight' | 'size' | 'line'

const TYPE_AXES: readonly TypeAxis[] = ['family', 'weight', 'size', 'line']

export type TypeGroup = {
  /** e.g. `h1`, `body-bold`, `sheet-title`. */
  name: string
  axes: Partial<Record<TypeAxis, TokenName>>
}

/**
 * Group `--type-*` tokens into the styles they describe.
 *
 * `--type-h1-size` and `--type-h1-line` belong to one specimen; the trailing
 * segment is the axis and everything between `--type-` and it is the style
 * name. Styles that declare only some axes (the sheet title declares a size and
 * nothing else) come back partial rather than being dropped.
 */
export function listTypeGroups(names: readonly TokenName[]): TypeGroup[] {
  const groups = new Map<string, Partial<Record<TypeAxis, TokenName>>>()

  for (const name of names) {
    if (!name.startsWith('--type-')) continue
    const rest = name.slice('--type-'.length)
    const lastDash = rest.lastIndexOf('-')
    if (lastDash < 1) continue
    const axis = rest.slice(lastDash + 1) as TypeAxis
    if (!TYPE_AXES.includes(axis)) continue
    const styleName = rest.slice(0, lastDash)
    const existing = groups.get(styleName) ?? {}
    existing[axis] = name
    groups.set(styleName, existing)
  }

  return [...groups.entries()].map(([name, axes]) => ({ name, axes }))
}
