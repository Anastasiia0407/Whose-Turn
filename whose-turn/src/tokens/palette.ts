/**
 * Member colour palette — the identity system of the whole app.
 *
 * A member is assigned the next colour in this array when they join, and that
 * colour is then *their* colour everywhere: wheel sectors, their die, their
 * coin face, their avatar dot, their chip, and their name on the result screen.
 *
 * Nothing downstream may hardcode a member colour. Always go through
 * `colorForMemberIndex`, keyed off the member's persisted colour index — never
 * off array position at render time, so colours survive a member being deleted.
 *
 * PROVENANCE: this palette is a product decision, not a Figma read. Figma
 * currently defines only members 1-2 (#d85a38, #e8a838). The 3-member dice
 * frame (157:45) reuses the success green #02ab0d for member 3; that is
 * deliberately NOT used here, because green is the selected-chore state and
 * reusing it makes green mean two different things on the same screen.
 * Members 3-6 are ahead of the design file and still need adding to Figma.
 */
export const MEMBER_PALETTE = [
  '#d85a38', // 1 terracotta  (Figma: color/orange/600)
  '#e8a838', // 2 yellow      (Figma: color/amber/500)
  '#6b8e5a', // 3 olive       (not yet in Figma)
  '#3d8a8a', // 4 teal        (not yet in Figma)
  '#c96b86', // 5 dusty pink  (not yet in Figma)
  '#9b6a3f', // 6 caramel     (not yet in Figma)
] as const

export type MemberColor = (typeof MEMBER_PALETTE)[number]

/**
 * Hard cap on household size. Equal to the palette length by definition: one
 * member, one colour, no sharing. If this grows, the palette grows first.
 */
export const MAX_HOUSEHOLD_MEMBERS = MEMBER_PALETTE.length

/**
 * Resolve a member's colour from their persisted colour index (0-based).
 *
 * Throws rather than wrapping or returning undefined. Wrapping would silently
 * give two members the same colour and quietly break the wheel, the dice and
 * the result screen; returning undefined would paint a transparent sector.
 * A loud failure here is correct — the cap belongs at member creation, which
 * is enforced by `canAddMember` and by the data layer in a later stage.
 */
export function colorForMemberIndex(index: number): MemberColor {
  if (!Number.isInteger(index) || index < 0 || index >= MAX_HOUSEHOLD_MEMBERS) {
    throw new RangeError(
      `colorForMemberIndex: index must be an integer in 0..${
        MAX_HOUSEHOLD_MEMBERS - 1
      }, received ${index}. Household size is capped at ${MAX_HOUSEHOLD_MEMBERS}.`,
    )
  }
  return MEMBER_PALETTE[index]
}

/** Guard for the "add member" boundary, so the cap is enforced before insert. */
export function canAddMember(currentMemberCount: number): boolean {
  return currentMemberCount < MAX_HOUSEHOLD_MEMBERS
}

/** The colour index a newly joining member should be given. */
export function nextMemberColorIndex(currentMemberCount: number): number {
  if (!canAddMember(currentMemberCount)) {
    throw new RangeError(
      `Household is full: ${MAX_HOUSEHOLD_MEMBERS} members maximum.`,
    )
  }
  return currentMemberCount
}
