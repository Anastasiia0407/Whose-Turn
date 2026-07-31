/**
 * Typed token exports for values that JavaScript genuinely needs — geometry the
 * fate engine computes with, and colours that get written into SVG attributes.
 *
 * This is deliberately thin. Anything that can be expressed in CSS stays in
 * tokens.css; duplicating tokens here would create two sources of truth.
 */

export {
  MEMBER_PALETTE,
  MAX_HOUSEHOLD_MEMBERS,
  colorForMemberIndex,
  canAddMember,
  nextMemberColorIndex,
} from './palette'
export type { MemberColor } from './palette'

/** Ink used for every outline and every hard shadow. Figma: color/border/default. */
export const INK = '#332014'

/** Design canvas from Figma. The app never renders wider than this. */
export const CANVAS = {
  width: 390,
  height: 844,
  gutter: 16,
  minWidth: 360,
} as const

/**
 * Wheel geometry, measured off Figma frame 86:78.
 * Consumed by the sector generator in a later stage — recorded now so the
 * numbers live with the other design constants rather than in a component.
 */
export const WHEEL = {
  /** Outer diameter of the wheel, px. */
  diameter: 350,
  /** White centre hub diameter, px. */
  hubDiameter: 58,
  /** Pointer bounding box at 12 o'clock, px. */
  pointerSize: 40,
  /** Sector separator stroke width, px. */
  separatorWidth: 1,
  /**
   * Figma draws 12 sectors for a 2-member household. The generator targets
   * roughly this many sectors and rounds to a multiple of the member count so
   * every member gets an equal number.
   */
  targetSectorCount: 12,
} as const
