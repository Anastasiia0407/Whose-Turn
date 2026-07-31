/**
 * Isometric die face geometry, measured from the exported art (node 157:71,
 * viewBox 149x161) and the pip positions inside it.
 *
 * Each face is described by an origin and two in-plane axes. Pips are drawn as
 * unit circles inside that basis, so the SVG transform skews them into the
 * face's plane automatically — they come out as elongated ovals sitting in
 * perspective, which is what the design does.
 */

export type FaceBasis = {
  /** Face centre in the 149x161 viewBox. */
  c: [number, number]
  /** Across-face axis (one grid step). */
  u: [number, number]
  /** Down-face axis (one grid step). */
  v: [number, number]
}

/** Measured from the four top-face pips at the diamond vertices. */
export const TOP: FaceBasis = {
  c: [73.75, 41.28],
  u: [34.25 * 0.58, 0.85 * 0.58],
  v: [1.65 * 0.58, -23.1 * 0.58],
}

/** Measured from the six front-right pips (2 columns x 3 rows). */
export const FRONT_RIGHT: FaceBasis = {
  c: [107.97, 102.22],
  u: [16.25, -9.5],
  v: [0.7, 18.8],
}

/** Mirror of the right face about the die's vertical centre (x ~= 74.5). */
export const FRONT_LEFT: FaceBasis = {
  c: [41.0, 102.22],
  u: [-16.25, -9.5],
  v: [-0.7, 18.8],
}

/** Standard die layout on a 3x3 grid, in (i, j) with i, j in -1..1. */
export const LAYOUT: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[-1, -1], [1, 1]],
  3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
}

/** SVG transform mapping unit grid space onto a face. */
export function faceTransform({ c, u, v }: FaceBasis): string {
  return `matrix(${u[0]} ${u[1]} ${v[0]} ${v[1]} ${c[0]} ${c[1]})`
}

/** Opposite faces of a real die always sum to 7. */
export function opposite(value: number): number {
  return 7 - value
}

/**
 * Two plausible side values for a die whose top face reads `top`.
 *
 * A side may never show the top value nor its opposite, because those are the
 * two faces you physically cannot see alongside it. Deterministic in `top`, so
 * a given result always renders the same die.
 */
export function sideValues(top: number): [number, number] {
  const candidates = [1, 2, 3, 4, 5, 6].filter(
    (v) => v !== top && v !== opposite(top),
  )
  // Four remain; take a stable pair that are not opposite each other either.
  const first = candidates[0]
  const second = candidates.find((v) => v !== first && v !== opposite(first))
  return [first, second ?? candidates[1]]
}
