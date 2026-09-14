/**
 * The node map: every page in this site points at the frame it documents.
 *
 * Node ids are the ones on the "Foundations" (357:315) and "Components"
 * (323:23) pages of the design file. A page with no entry here has no frame
 * behind it and shows no link, which is the honest outcome — the alternative is
 * a link that lands on the wrong thing.
 */

export const FIGMA_FILE_KEY = 'ow8Eo53KIe4QrORvA7TQ2E'

/** Frames on the "Foundations" page — long-form documentation, 816px wide. */
export const FOUNDATION_NODES = {
  'design-tokens': '364:271',
  'colour-primitives': '364:372',
  'colour-semantic': '364:525',
  'colour-members': '364:708',
  spacing: '366:271',
  'radius-border-shadow': '366:443',
  layout: '366:555',
  typography: '367:271',
  'button-tokens': '368:271',
  'iconbutton-tokens': '368:463',
  'avatar-tokens': '369:284',
  'listrow-tokens': '369:361',
  'textfield-chips-tokens': '369:488',
  decisions: '370:303',
} as const

/** Published components on the "Components" page. */
export const COMPONENT_NODES = {
  button: '325:42',
  iconbutton: '326:49',
  avatar: '327:34',
  icons: '332:25',
  textfield: '332:32',
  listrow: '336:49',
  chorechip: '337:33',
  memberchip: '337:38',
  resultbadge: '337:41',
  scrim: '340:32',
  homeindicator: '340:35',
  sheetheader: '340:41',
  titles: '340:54',
  screenheader: '340:62',
  bottomsheet: '340:72',
  fatewheel: '345:69',
  die: '345:72',
  coinface: '345:99',
} as const

export type FigmaNodeId = string

/**
 * A deep link to one frame.
 *
 * Figma's URL form wants the node id dash-separated, while the API and every
 * table in this site use the colon form. Converting in one place keeps the
 * colon form as the value everything else quotes.
 */
export function figmaUrl(nodeId: FigmaNodeId): string {
  const url = new URL(`https://www.figma.com/design/${FIGMA_FILE_KEY}/`)
  url.searchParams.set('node-id', nodeId.replace(':', '-'))
  return url.toString()
}
