import { Heading, Icon, PillChip, Subtitle } from '@ds/ui'
import { figma } from './code-connect'

const FILE = 'https://www.figma.com/design/ow8Eo53KIe4QrORvA7TQ2E'

/**
 * Titles — 340:54. Gap {Tight, Medium, Loose}.
 *
 * Two components in code, and the gap is not a prop on either: it is set by the
 * screen that composes them. Figma encodes it as a variant because it was
 * measured across 13 instances — 4px on home and result, 8px in onboarding,
 * 16px on login — and each screen type is consistent with itself.
 */
figma.connect(Heading, `${FILE}/?node-id=340-54`, {
  figmaName: 'Titles',
  codeName: 'Heading + Subtitle',
  codeSource: 'whose-turn/src/ui/Heading.tsx',
  covers: ['340:45', '340:49', '340:53'],
  note:
    'The Gap axis has no prop behind it — the composing screen sets the gap. ' +
    'Mapped as a value so the axis is recorded and CI notices if a fourth gap ' +
    'appears. Heading always renders an <h1> and cannot be told otherwise.',
  props: {
    gap: figma.enum('Gap', {
      Tight: '4px' as const,
      Medium: '8px' as const,
      Loose: '16px' as const,
    }),
  },
  example: () => (
    <>
      <Heading accent="Turn?" rest="Whose " accentPosition="trailing" size="h1" />
      <Subtitle>Settle chore disputes fairly!</Subtitle>
    </>
  ),
})

/**
 * Icons — 332:25. Eight local glyphs, each its own component rather than a
 * variant set. One code component takes the name as a prop.
 */
figma.connect(Icon, `${FILE}/?node-id=332-25`, {
  figmaName: 'Icons',
  codeName: 'Icon',
  codeSource: 'whose-turn/src/ui/Icon.tsx',
  covers: ['330:29', '330:34', '330:37', '330:42', '330:45', '330:48', '330:53', '330:58'],
  note:
    'Figma publishes eight separate components; the code has one with an IconName ' +
    'union. Figma’s `close` is `x` in code — the only name that differs. A ninth ' +
    'icon added in Figma will fail the drift check until it is added here.',
  props: {
    name: figma.enum('Icon', {
      'Icon / check': 'check' as const,
      'Icon / chevron-left': 'chevron-left' as const,
      'Icon / plus': 'plus' as const,
      'Icon / trash': 'trash' as const,
      'Icon / members': 'members' as const,
      'Icon / close': 'x' as const,
      'Icon / bell-off': 'bell-off' as const,
      'Icon / bell': 'bell' as const,
    }),
  },
  example: (props) => <Icon name={props.name} size={24} />,
})

/**
 * ChoreChip — 337:33. The selected-chore pill carried through the fate screens.
 */
figma.connect(PillChip, `${FILE}/?node-id=337-33`, {
  figmaName: 'ChoreChip',
  codeName: 'PillChip',
  codeSource: 'whose-turn/src/ui/PillChip.tsx',
  note: 'PillChip tone="success" with a trailing check, as used by FateLayout.',
  example: () => (
    <PillChip tone="success" trailingIcon="check">
      Wash the dishes
    </PillChip>
  ),
})

/**
 * ResultBadge — 337:41. The "Today: {chore}" label on the result screen.
 */
figma.connect(PillChip, `${FILE}/?node-id=337-41`, {
  figmaName: 'ResultBadge',
  codeName: 'PillChip',
  codeSource: 'whose-turn/src/ui/PillChip.tsx',
  note:
    'PillChip tone="surface" uppercase. Figma keeps ChoreChip, MemberChip and ' +
    'ResultBadge as three components because their heights and padding models ' +
    'differ (44 fixed / 46 hug / 44 fixed); the code has one component and a tone. ' +
    'The label is never a generated sentence — user text is used verbatim.',
  example: () => (
    <PillChip tone="surface" uppercase>
      Today: Wash the dishes
    </PillChip>
  ),
})
