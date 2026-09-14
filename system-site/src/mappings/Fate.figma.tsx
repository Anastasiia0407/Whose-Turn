import { StaticRow, MemberAvatar } from '@ds/ui'
import { MEMBER_PALETTE } from '@ds/tokens'
import { Die } from '@ds/fate/Die'
import { figma } from './code-connect'

const FILE = 'https://www.figma.com/design/ow8Eo53KIe4QrORvA7TQ2E'

/**
 * MemberChip — 337:38.
 *
 * Figma draws a pill: avatar plus name, 46 tall, hugging. The code builds the
 * same information as a StaticRow with a MemberAvatar in the leading slot, which
 * is a row rather than a pill. The correspondence is real; the shape is not.
 */
figma.connect(StaticRow, `${FILE}/?node-id=337-38`, {
  figmaName: 'MemberChip',
  codeName: 'StaticRow',
  codeSource: 'whose-turn/src/ui/Card.tsx',
  note:
    'Shape differs: Figma has a 46px hugging pill, the code has a full-width row ' +
    'with a leading avatar (DiceScreen). Same content, different container — the ' +
    'closest honest pairing, not an exact one.',
  props: {
    label: figma.string('Name'),
  },
  example: (props) => (
    <StaticRow
      label={props.label}
      leading={<MemberAvatar color={MEMBER_PALETTE[0]} size="sm" />}
    />
  ),
})

/**
 * Die — 345:72. The isometric die, in a member's colour.
 *
 * No variant axes in Figma. The code takes the member's stored colour, the
 * settled value, and the animation flags the fate engine drives.
 */
figma.connect(Die, `${FILE}/?node-id=345-72`, {
  figmaName: 'Die',
  codeName: 'Die',
  codeSource: 'whose-turn/src/fate/Die.tsx',
  note:
    'Product component. The Figma art is a single amber die; the code recolours the ' +
    'exported SVG per member and draws all three visible faces programmatically.',
  example: () => (
    <Die
      color={MEMBER_PALETTE[0]}
      value={5}
      tumbling={false}
      highlighted
      label="Anastasiia"
      settleAngle={4}
    />
  ),
})
