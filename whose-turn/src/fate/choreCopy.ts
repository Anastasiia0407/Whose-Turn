/**
 * Copy for the result pill — Figma node 38:27.
 *
 * The chore name is used VERBATIM. It is never parsed, stemmed, re-phrased or
 * grammatically transformed in any way.
 *
 * The frame's own example ("does the dishes today") is a sentence built around
 * one specific chore, and no transformation generalises safely: chore names are
 * free text. "Scrub the bathroom tiles" breaks on the plural, and a bare noun
 * like "Laundry" breaks any verb-based construction outright. So the pill is a
 * LABEL rather than a sentence — the winner's name above it carries the
 * emotion, and the pill only has to be correct:
 *
 *   "Wash the dishes"          -> "TODAY: WASH THE DISHES"
 *   "Scrub the bathroom tiles" -> "TODAY: SCRUB THE BATHROOM TILES"
 *   "Laundry"                  -> "TODAY: LAUNDRY"
 *
 * Uppercasing is presentational (CSS `text-transform`), so the stored name is
 * never mutated. Long names truncate with an ellipsis per the truncation rule.
 */
export function resultPillCopy(choreName: string): string {
  return `Today: ${choreName.trim()}`
}
