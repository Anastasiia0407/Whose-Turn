/**
 * AUTHORED CONTENT — frame 370:303, transcribed verbatim.
 *
 * This page is the honest one. Nothing here is softened, shortened or
 * rephrased; a measurement is reproduced with its number and a decision with
 * its date. If a row reads uncomfortably, that is the row doing its job.
 */

export const DECISIONS_LEDE =
  'What this system knows about itself. Every row below was measured, raised, and decided on — none of it is an oversight. A defect that is written down behaves differently from one that is forgotten.'

/** THE DECISION LOG, verbatim. */
export const DECISION_LOG: { id: string; decision: string; consequence: string }[] = [
  {
    id: 'D-01',
    decision: 'Rebuild the token layer as local',
    consequence:
      'Three collections had been deleted while 2 046 bindings still pointed at them. All recreated and repointed.',
  },
  {
    id: 'D-02',
    decision: 'Normalise the spacing scale',
    consequence: '10→8, 36→40, and 96 promoted to a named step instead of an off-scale one-off.',
  },
  { id: 'D-03', decision: 'Unify icon ink', consequence: '17 icons moved from pure black to the brand’s #332014.' },
  {
    id: 'D-04',
    decision: 'Leave the accessibility findings',
    consequence: 'Ten WCAG failures stay. The audit becomes a register of known risk rather than a to-do list.',
  },
  { id: 'D-05', decision: 'TextField is 56px', consequence: 'The 62px login field is the outlier, not the rule.' },
  {
    id: 'D-06',
    decision: 'Local icons',
    consequence: 'Eight components replace a library that could not even be imported by key.',
  },
  {
    id: 'D-07',
    decision: 'Everything else as the product has it',
    consequence: 'Asymmetric insets, no initial below 32px, full-width buttons only.',
  },
  { id: 'D-08', decision: 'Leave the wheel colours', consequence: 'Member identity stays mirrored on the fortune wheel.' },
  {
    id: 'D-09',
    decision: 'Leave the invisible status bars',
    consequence: 'All 17 sit at zero opacity and remain in the file.',
  },
  {
    id: 'D-10',
    decision: 'Replace copies with instances',
    consequence: '108 nodes migrated; the library and the product are now the same thing.',
  },
]

/** ACCEPTED DEBT — MEASURED, NOT ESTIMATED, verbatim. */
export const ACCEPTED_DEBT: { what: string; measurement: string; where: string }[] = [
  { what: 'Disabled button label', measurement: '1.42 : 1', where: 'Button description · Phase 3 §3.1' },
  { what: 'Member initial on amber', measurement: '2.08 : 1', where: 'Phase 3 §3.3' },
  { what: 'White on the primary CTA', measurement: '3.86 : 1 · 21 places', where: 'Button description · Phase 3 §3.2' },
  { what: 'Placeholders', measurement: '3.11 : 1 · 7 fields', where: 'TextField description · Phase 3 §3.4' },
  { what: 'Avatar Sm without an initial', measurement: 'colour only · WCAG 1.4.1', where: 'Avatar description · Phase 3 §4' },
  { what: 'Wheel member colours', measurement: '12 segments, mirrored', where: 'FateWheel description · Phase 5 §18' },
  { what: 'member/3 = accent/success', measurement: 'green means two things', where: 'token description' },
  { what: 'focus-visible', measurement: 'never designed', where: 'defined in code instead' },
]

/** WHY THE DEBT LIVES IN COMPONENT DESCRIPTIONS, verbatim. */
export const DEBT_NOTE =
  'Each item above is written into the description of the component it affects, inside Figma, with the date it was decided. Debt recorded only in a report survives exactly as long as someone remembers the report. Debt attached to the component travels with it — into a handoff, into a new designer’s first week, into the code that reads it.'

/** FOUR RULES THAT CAME OUT OF GETTING IT WRONG, verbatim. */
export const FOUR_RULES: { rule: string; prompted: string }[] = [
  {
    rule: 'Write and verify in separate calls',
    prompted:
      'A batch reported “18 of 18 applied”. Nothing had been saved — the check was reading state inside the same transaction as the write.',
  },
  {
    rule: 'Measure every instance, not the first',
    prompted: 'TextField padding was “measured” on one field. The other four disagreed with it.',
  },
  {
    rule: 'When collapsing duplicates, print the count',
    prompted:
      'Deduplication turned 17 invisible status bars into one, and the report said the problem was on a single screen.',
  },
  {
    rule: 'Check both binding levels',
    prompted:
      'Figma holds bindings on the node and on the paint. They disagree in both directions, and reading one alone is wrong either way.',
  },
]

/* -------------------------------------------------------------------------- *
 * Conventions the app breaks on purpose
 *
 * NOT from frame 370:303. These are code-side decisions recorded in the repo,
 * gathered here because the alternative is that they live only in a file nobody
 * outside the codebase reads. Each one looks like a bug until you know it isn't.
 * -------------------------------------------------------------------------- */

export type Convention = {
  title: string
  /** What a reader would otherwise assume is broken. */
  looksLike: string
  /** Why it is the way it is. */
  why: string
  /** What it costs, stated plainly. */
  cost: string
}

export const CONVENTIONS: Convention[] = [
  {
    title: 'Focus indicators are intentionally absent',
    looksLike:
      'No control anywhere in the product changes appearance on :focus, :focus-visible or :focus-within. A keyboard or switch user cannot see where they are.',
    why: 'The design defines no focus state on any of the seventeen screens, and rather than let each component invent one, the decision was to remove every visual focus change. The suppression is deliberate and pinned in base.css — width and colour as well as style — so computed styles are identical focused and unfocused.',
    cost: 'This fails WCAG 2.4.7 Focus Visible (AA). Focusability itself is untouched: every control stays keyboard-reachable and operable, only the indicator is missing. Resolving it needs a focus treatment in the design, not a value in the code. The ring you can see on THIS site is the documentation site’s own chrome and is not part of the product.',
  },
  {
    title: 'User-entered text is never grammatically transformed',
    looksLike:
      'The result screen shows a label — “Today: {chore}” — rather than a sentence built around the chore name, which reads stiffer than the design’s example copy.',
    why: 'Chore and member names are free text and cannot be transformed safely. “Scrub the bathroom tiles” breaks on the plural; a bare noun like “Laundry” breaks any verb-based construction outright. Where the design shows a sentence built around one specific example, the code builds a label instead.',
    cost: 'Copy reads more mechanically than the frames suggest. Presentational changes are still fine — uppercasing via text-transform, truncation with an ellipsis — because neither mutates the stored value.',
  },
  {
    title: 'Fake device chrome was removed',
    looksLike:
      'The status bar and home indicator drawn on every Figma frame do not exist in the code. AppShell renders neither.',
    why: 'They were mockup decoration standing in for the phone itself, and a real browser already sits inside real device chrome. The vertical space they occupied is now the actual safe-area inset, so Figma’s y coordinates are rebased against env(safe-area-inset-top) rather than copied across.',
    cost: 'Figma keeps HomeIndicator as a published component and 17 zero-opacity status bars (decision D-09 above), so the file and the code disagree by design. color/text/primary is documented as being for “status bar and home indicator”; in the code its only consumer is ordinary body text.',
  },
]
