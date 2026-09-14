import { ChoreRow, MemberAvatar, StaticRow } from '@ds/ui'
import { MEMBER_PALETTE } from '@ds/tokens'
import { figma } from './code-connect'

const FILE = 'https://www.figma.com/design/ow8Eo53KIe4QrORvA7TQ2E'

/**
 * ListRow — 336:49. Leading {None, Avatar} × State {Default, Selected}.
 *
 * One Figma component, two code components. The split is behavioural, not
 * cosmetic: a chore row is a real <button> with aria-pressed, and a member row
 * is not interactive at all. Figma's own description says the three product rows
 * are compositions over ListRow, which matches the intent — but a single
 * component cannot be both focusable and not.
 *
 * The mapping points at ChoreRow because the `State` axis only means anything
 * on the selectable one. StaticRow is recorded beneath it.
 */
figma.connect(ChoreRow, `${FILE}/?node-id=336-49`, {
  figmaName: 'ListRow',
  codeName: 'ChoreRow',
  codeSource: 'whose-turn/src/ui/Card.tsx',
  covers: ['336:29', '336:34', '336:41', '336:48'],
  note:
    'Split in code: ChoreRow (interactive, aria-pressed) and StaticRow (read-only). ' +
    'Leading=Avatar is a `leading` slot on both rather than a variant axis.',
  props: {
    selected: figma.enum('State', { Default: false, Selected: true }),
    leading: figma.enum('Leading', { None: false, Avatar: true }),
    label: figma.string('Label'),
  },
  example: (props) => (
    <ChoreRow
      label={props.label}
      selected={props.selected}
      leading={
        props.leading ? <MemberAvatar color={MEMBER_PALETTE[0]} name="Anastasiia" /> : undefined
      }
    />
  ),
})

figma.connect(StaticRow, `${FILE}/?node-id=336-41`, {
  figmaName: 'ListRow / Leading=Avatar, State=Default',
  codeName: 'StaticRow',
  codeSource: 'whose-turn/src/ui/Card.tsx',
  note:
    'The non-interactive half of the ListRow split — the dice roster and the member ' +
    'list. Carries identity; never focusable, so it has no Selected state.',
  props: {
    label: figma.string('Label'),
  },
  example: (props) => (
    <StaticRow
      label={props.label}
      leading={<MemberAvatar color={MEMBER_PALETTE[0]} name="Anastasiia" />}
    />
  ),
})
