/**
 * AUTHORED CONTENT — frame 367:271.
 *
 * The nine styles as the frame lists them, with the sample text the frame sets
 * each one in. Where the code layer has a matching `--type-*` group its name is
 * recorded here; three of the nine have none, and that is the page's main
 * finding rather than something to paper over.
 */

export const TYPOGRAPHY_LEDE =
  'Two faces doing two jobs. Corben is the voice of the product — every heading, every button, every row label. DM Sans carries the quiet text: subtitles, captions, and the wheel’s sector names.'

export type TypeStyleEntry = {
  /** The Figma text style name. */
  style: string
  /** SPECIMEN, verbatim from the frame — the words it is set in. */
  sample: string
  /** SPEC, verbatim from the frame. */
  spec: string
  /**
   * The `--type-{group}-*` family in the code layer, or null when the style has
   * no tokens at all.
   */
  group: string | null
  /** Set when the code layer has only some axes for this style. */
  partial?: string
}

export const TYPE_STYLES: TypeStyleEntry[] = [
  {
    style: 'Display/Coin',
    sample: 'Aa',
    spec: 'Corben Bold · 72/80',
    group: null,
  },
  {
    style: 'Heading/Hero',
    sample: 'Whose Turn?',
    spec: 'Corben Bold · 40/46',
    group: null,
  },
  {
    style: 'Heading/H1',
    sample: 'Whose Turn?',
    spec: 'Corben Bold · 30/40',
    group: 'h1',
  },
  {
    style: 'Heading/Sheet',
    sample: 'Members',
    spec: 'Corben Bold · 20/auto',
    group: 'sheet-title',
    partial: 'Only a size token exists. No family, weight or line-height.',
  },
  {
    style: 'Body/Bold',
    sample: 'Wash the dishes',
    spec: 'Corben Bold · 16/24',
    group: 'body-bold',
  },
  {
    style: 'Body/Regular',
    sample: 'Settle chore disputes fairly!',
    spec: 'DM Sans Medium · 16/24',
    group: 'body',
  },
  {
    style: 'Label/Pill',
    sample: 'Wash the dishes',
    spec: 'Corben Bold · 12/auto',
    group: 'label',
    partial: 'Shares the one --type-label-* group with Label/Section.',
  },
  {
    style: 'Label/Section',
    sample: 'WHO’S DOING IT TODAY?',
    spec: 'Corben Bold · 12/auto · caps',
    group: 'label',
    partial: 'Shares the one --type-label-* group with Label/Pill.',
  },
  {
    style: 'Label/Wheel',
    sample: 'Anastasiia',
    spec: 'DM Sans SemiBold · 12/16',
    group: null,
  },
]

/** THREE THINGS THE SCALE ADMITS, verbatim from frame 367:271. */
export const TYPE_FINDINGS: { finding: string; detail: string }[] = [
  {
    finding: 'Eight texts have no style',
    detail:
      'Inter Semi Bold 15 in status bars, Corben 16 with auto line-height on placeholders, DM Sans 18 once on login. Each is a defect, and a defect does not get a style of its own.',
  },
  {
    finding: 'font/size/hero is used once',
    detail:
      '40px appears on the login headline and nowhere else. Kept because that screen is the only hero in the product.',
  },
  {
    finding: 'One weight of Corben',
    detail:
      'Bold is the only Corben weight in use anywhere. There is no regular, no medium — the slab face is always loud.',
  },
]
