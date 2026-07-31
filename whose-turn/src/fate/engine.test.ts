import { describe, expect, it } from 'vitest'
import {
  buildSectors,
  drawWinner,
  isCoinAvailable,
  rollDice,
  sectorsPerMember,
  sectorUnderPointer,
  seededRng,
  solveCoin,
  solveWheel,
} from './engine'
import { sideValues } from './dieFaces'
import { resultPillCopy } from './choreCopy'

const MEMBERS = ['a', 'b', 'c', 'd', 'e', 'f'] as const

describe('drawWinner', () => {
  it('is deterministic for a given seed', () => {
    const a = drawWinner(MEMBERS, seededRng(42))
    const b = drawWinner(MEMBERS, seededRng(42))
    expect(a).toBe(b)
  })

  it('only ever returns a member of the list', () => {
    for (let s = 0; s < 200; s += 1) {
      expect(MEMBERS).toContain(drawWinner(MEMBERS, seededRng(s)))
    }
  })

  it('is uniform across members within tolerance', () => {
    const rng = seededRng(7)
    const counts = new Map<string, number>()
    const runs = 60_000
    for (let i = 0; i < runs; i += 1) {
      const w = drawWinner(MEMBERS, rng)
      counts.set(w, (counts.get(w) ?? 0) + 1)
    }
    const expected = runs / MEMBERS.length
    for (const m of MEMBERS) {
      // Within 5% of an even split — tight enough to catch a biased pick.
      expect(Math.abs((counts.get(m) ?? 0) - expected)).toBeLessThan(
        expected * 0.05,
      )
    }
  })

  it('throws on an empty household rather than returning undefined', () => {
    expect(() => drawWinner([], seededRng(1))).toThrow(RangeError)
  })
})

describe('sector algorithm, n = 2..6', () => {
  for (let n = 2; n <= 6; n += 1) {
    it(`n=${n}: every member gets an equal share`, () => {
      const sectors = buildSectors(n)
      expect(sectors.length).toBe(sectorsPerMember(n) * n)
      const counts = Array.from({ length: n }, (_, i) =>
        sectors.filter((s) => s === i).length,
      )
      expect(new Set(counts).size).toBe(1)
      expect(counts[0]).toBe(sectorsPerMember(n))
    })

    it(`n=${n}: no member sits in two adjacent sectors, including the wrap`, () => {
      const sectors = buildSectors(n)
      for (let i = 0; i < sectors.length; i += 1) {
        const next = sectors[(i + 1) % sectors.length]
        expect(sectors[i]).not.toBe(next)
      }
    })

    it(`n=${n}: the ring stays close to 12 sectors so the wheel looks full`, () => {
      const total = buildSectors(n).length
      expect(total).toBeGreaterThanOrEqual(n)
      expect(total).toBeLessThanOrEqual(TARGET_UPPER)
    })
  }

  const TARGET_UPPER = 14

  it('gives a 2-member household a full 12-sector wheel', () => {
    expect(buildSectors(2).length).toBe(12)
  })
})

describe('solveWheel', () => {
  it('always parks a sector belonging to the winner under the pointer', () => {
    for (let n = 2; n <= 6; n += 1) {
      const sectors = buildSectors(n)
      for (let winner = 0; winner < n; winner += 1) {
        for (let seed = 0; seed < 40; seed += 1) {
          const { rotation, targetSector } = solveWheel(sectors, winner, {
            rng: seededRng(seed),
          })
          expect(sectors[targetSector]).toBe(winner)
          // The inverse mapping must agree: the animation's end state resolves
          // back to a sector the winner owns.
          expect(sectors[sectorUnderPointer(sectors, rotation)]).toBe(winner)
        }
      }
    }
  })

  it('never stops dead centre on a sector', () => {
    const sectors = buildSectors(3)
    const centres = new Set<number>()
    for (let seed = 0; seed < 50; seed += 1) {
      const { rotation, targetSector } = solveWheel(sectors, 1, {
        rng: seededRng(seed),
      })
      const theta = 360 / sectors.length
      const centre = (targetSector + 0.5) * theta
      const offset = Math.abs(((rotation + centre) % 360) % 360)
      centres.add(Math.round(offset * 1000))
    }
    // Varying offsets, and never exactly zero.
    expect(centres.has(0)).toBe(false)
    expect(centres.size).toBeGreaterThan(1)
  })

  it('throws if the winner owns no sector', () => {
    expect(() => solveWheel([0, 1, 0, 1], 5, { rng: seededRng(1) })).toThrow(
      RangeError,
    )
  })
})

describe('rollDice strict maximum', () => {
  it('gives the winner the unique highest value, n = 2..6', () => {
    for (let n = 2; n <= 6; n += 1) {
      for (let winner = 0; winner < n; winner += 1) {
        for (let seed = 0; seed < 200; seed += 1) {
          const values = rollDice(n, winner, seededRng(seed))
          expect(values).toHaveLength(n)
          const max = Math.max(...values)
          expect(values[winner]).toBe(max)
          // Strict: exactly one member holds the maximum.
          expect(values.filter((v) => v === max)).toHaveLength(1)
          for (const v of values) {
            expect(v).toBeGreaterThanOrEqual(1)
            expect(v).toBeLessThanOrEqual(6)
            expect(Number.isInteger(v)).toBe(true)
          }
        }
      }
    }
  })

  it('rejects a winner index outside the household', () => {
    expect(() => rollDice(3, 3, seededRng(1))).toThrow(RangeError)
  })
})

describe('coin', () => {
  it('is available only for exactly two members', () => {
    expect(isCoinAvailable(2)).toBe(true)
    for (const n of [1, 3, 4, 5, 6]) expect(isCoinAvailable(n)).toBe(false)
  })

  it('flip parity lands on the winner face', () => {
    expect(solveCoin(0).landsOn).toBe(0)
    expect(solveCoin(1).landsOn).toBe(1)
    expect(solveCoin(0).flips % 2).toBe(0)
    expect(solveCoin(1).flips % 2).toBe(1)
  })

  it('rejects a third member', () => {
    expect(() => solveCoin(2)).toThrow(RangeError)
  })
})

describe('die side faces — the invariant, not Figma\'s exact trio', () => {
  // Figma's render reads 5/3/6 and geometric extraction reads 4/2/6. Both are
  // real corner triples (opposite faces sum to 7), so the exact trio is not the
  // requirement. THIS is:
  it('for every top value: no side shows the top or its opposite, and the two sides differ', () => {
    for (let top = 1; top <= 6; top += 1) {
      const [left, right] = sideValues(top)
      for (const side of [left, right]) {
        expect(side).not.toBe(top)
        expect(side).not.toBe(7 - top)
        expect(Number.isInteger(side)).toBe(true)
        expect(side).toBeGreaterThanOrEqual(1)
        expect(side).toBeLessThanOrEqual(6)
      }
      expect(left).not.toBe(right)
      // The two sides are adjacent to each other as well, never opposite.
      expect(left).not.toBe(7 - right)
    }
  })

  it('produces a physically real corner: three mutually adjacent faces', () => {
    for (let top = 1; top <= 6; top += 1) {
      const trio = [top, ...sideValues(top)]
      const pairs = [
        [trio[0], trio[1]],
        [trio[0], trio[2]],
        [trio[1], trio[2]],
      ]
      for (const [a, b] of pairs) expect(a + b).not.toBe(7)
      expect(new Set(trio).size).toBe(3)
    }
  })

  it('is deterministic for a given top value', () => {
    for (let top = 1; top <= 6; top += 1) {
      expect(sideValues(top)).toEqual(sideValues(top))
    }
  })
})

describe('result pill copy — verbatim, never transformed', () => {
  it('uses the chore name exactly as entered', () => {
    expect(resultPillCopy('Wash the dishes')).toBe('Today: Wash the dishes')
    expect(resultPillCopy('Scrub the bathroom tiles')).toBe(
      'Today: Scrub the bathroom tiles',
    )
    expect(resultPillCopy('Laundry')).toBe('Today: Laundry')
  })

  it('never drops, reorders or rewrites any word of the chore', () => {
    const names = [
      'Wash the dishes',
      'Take out the trash',
      'Laundry',
      'Hoover',
      'Water the plants on the balcony',
      'Do the school run',
    ]
    for (const n of names) {
      const out = resultPillCopy(n)
      expect(out).toBe(`Today: ${n}`)
      // Every original word survives, in order.
      expect(out.endsWith(n)).toBe(true)
    }
  })

  it('trims surrounding whitespace but leaves the text itself alone', () => {
    expect(resultPillCopy('  Laundry  ')).toBe('Today: Laundry')
  })
})
