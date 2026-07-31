/**
 * The fate engine.
 *
 * ARCHITECTURE — the winner is picked FIRST, by one uniform random draw, and
 * every animation is then solved backwards so it lands on that already-decided
 * winner. No animation's physics ever decides the outcome. This is what makes
 * the three modes provably identical in distribution, and what makes a draw
 * reproducible from a seed in tests.
 *
 * Everything here is pure: no DOM, no React, no time. Inject `rng` to make any
 * result deterministic.
 */

/** Returns a float in [0, 1). Matches `Math.random`'s contract. */
export type Rng = () => number

/**
 * Default RNG — crypto-backed, so a real draw is not predictable from previous
 * ones. Tests inject their own instead.
 */
export const defaultRng: Rng = () => {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  // 2^32 divisor keeps the result in [0, 1).
  return buf[0] / 4294967296
}

/** Deterministic RNG for tests and reproducible draws (mulberry32). */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Uniform integer in [0, n). */
export function randomIndex(n: number, rng: Rng = defaultRng): number {
  if (n <= 0) throw new RangeError('randomIndex needs n > 0')
  return Math.floor(rng() * n)
}

/**
 * THE draw. One uniform pick over the eligible members.
 * Everything else in this file exists only to animate towards this result.
 */
export function drawWinner<T>(members: readonly T[], rng: Rng = defaultRng): T {
  if (members.length === 0) throw new RangeError('drawWinner needs a member')
  return members[randomIndex(members.length, rng)]
}

// ---------------------------------------------------------------------------
// Wheel
// ---------------------------------------------------------------------------

/** Figma's wheel (86:78) shows 12 sectors for a 2-member household. */
export const TARGET_SECTORS = 12

/**
 * How many sectors each member gets, so the total sits near 12 and the wheel
 * still looks full for a household of 2.
 */
export function sectorsPerMember(memberCount: number): number {
  if (memberCount <= 0) throw new RangeError('sectorsPerMember needs > 0')
  return Math.max(1, Math.round(TARGET_SECTORS / memberCount))
}

/**
 * Sector ring as member indices, interleaved so the same member never occupies
 * two adjacent sectors. Because the ring is a cycle, the first and last sectors
 * are adjacent too and must also differ (possible whenever memberCount > 1).
 */
export function buildSectors(memberCount: number): number[] {
  const per = sectorsPerMember(memberCount)
  const total = per * memberCount
  const sectors: number[] = []
  for (let i = 0; i < total; i += 1) {
    // Round-robin: 0,1,2,...,n-1,0,1,2,... — adjacent entries always differ
    // for n > 1, and the wrap-around holds because total is a multiple of n.
    sectors.push(i % memberCount)
  }
  return sectors
}

/** Degrees per sector. */
export function sectorAngle(sectorCount: number): number {
  return 360 / sectorCount
}

export type WheelSolution = {
  /** Sector the pointer ends on. Always one of the winner's. */
  targetSector: number
  /** Absolute rotation in degrees to animate to. */
  rotation: number
}

/**
 * Solve the wheel backwards from the winner.
 *
 * Picks one of the winner's sectors at random, then computes the rotation that
 * parks that sector under the 12 o'clock pointer, plus a small offset inside
 * the sector so it never stops dead centre.
 */
export function solveWheel(
  sectors: readonly number[],
  winnerIndex: number,
  options: { turns?: number; rng?: Rng } = {},
): WheelSolution {
  const { turns = 5, rng = defaultRng } = options
  const owned = sectors
    .map((m, i) => (m === winnerIndex ? i : -1))
    .filter((i) => i >= 0)
  if (owned.length === 0) {
    throw new RangeError('winner owns no sector')
  }

  const targetSector = owned[randomIndex(owned.length, rng)]
  const theta = sectorAngle(sectors.length)
  const centre = (targetSector + 0.5) * theta

  // Keep clear of the seams so the pointer never straddles two sectors.
  const pad = theta * 0.18
  const jitter = (rng() * 2 - 1) * (theta / 2 - pad)

  // Rotating the wheel clockwise by R moves a sector centre from `centre` to
  // `centre + R`; we want it at 0 (under the pointer), hence 360k - centre.
  const rotation = 360 * turns - centre + jitter
  return { targetSector, rotation }
}

/** Which sector sits under the pointer for a given rotation. Inverse of solveWheel. */
export function sectorUnderPointer(
  sectors: readonly number[],
  rotation: number,
): number {
  const theta = sectorAngle(sectors.length)
  const normalised = ((-rotation % 360) + 360) % 360
  return Math.floor(normalised / theta) % sectors.length
}

// ---------------------------------------------------------------------------
// Dice
// ---------------------------------------------------------------------------

export const DIE_MIN = 1
export const DIE_MAX = 6

/**
 * Face values where the winner holds the STRICT maximum — no ties.
 *
 * The winner's value is drawn high enough to leave room below it, and everyone
 * else is drawn strictly under it, so the visible outcome always agrees with
 * the already-decided winner while still looking like a plausible roll.
 */
export function rollDice(
  memberCount: number,
  winnerIndex: number,
  rng: Rng = defaultRng,
): number[] {
  if (memberCount <= 0) throw new RangeError('rollDice needs a member')
  if (winnerIndex < 0 || winnerIndex >= memberCount) {
    throw new RangeError('winnerIndex out of range')
  }
  if (memberCount === 1) return [DIE_MAX]

  // Winner needs at least one value below it, so the floor is 2. Biased high so
  // the roll reads as a win rather than a shrug.
  const winnerValue = 3 + randomIndex(DIE_MAX - 2, rng) // 3..6
  return Array.from({ length: memberCount }, (_, i) =>
    i === winnerIndex
      ? winnerValue
      : DIE_MIN + randomIndex(winnerValue - DIE_MIN, rng), // 1..winnerValue-1
  )
}

// ---------------------------------------------------------------------------
// Coin
// ---------------------------------------------------------------------------

/** Coin mode exists only for a household of exactly two. */
export const COIN_MEMBER_COUNT = 2

export function isCoinAvailable(memberCount: number): boolean {
  return memberCount === COIN_MEMBER_COUNT
}

/**
 * Half-flips to animate so the coin lands on the winner's face.
 *
 * Face 0 (member 1) is heads, face 1 (member 2) is tails. An even number of
 * half-flips returns to the starting face, an odd number shows the other, so
 * parity — not physics — decides where it stops.
 */
export function solveCoin(
  winnerIndex: number,
  options: { baseFlips?: number } = {},
): { flips: number; landsOn: number } {
  const { baseFlips = 6 } = options
  if (winnerIndex !== 0 && winnerIndex !== 1) {
    throw new RangeError('coin only supports two members')
  }
  const even = baseFlips % 2 === 0 ? baseFlips : baseFlips + 1
  const flips = winnerIndex === 0 ? even : even + 1
  return { flips, landsOn: flips % 2 === 0 ? 0 : 1 }
}
