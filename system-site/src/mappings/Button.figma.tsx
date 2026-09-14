import { Button } from '@ds/ui'
import { figma } from './code-connect'

const FILE = 'https://www.figma.com/design/ow8Eo53KIe4QrORvA7TQ2E'

/**
 * Button — 325:42. Appearance {Primary, Secondary} × State {Default, Disabled}.
 */
figma.connect(Button, `${FILE}/?node-id=325-42`, {
  figmaName: 'Button',
  codeName: 'Button',
  codeSource: 'whose-turn/src/ui/Button.tsx',
  covers: ['325:26', '325:31', '325:36', '325:41'],
  note:
    'Figma models the axis as `Appearance`; the code calls it `variant` and adds a ' +
    'third value, `icon`, which has no Figma counterpart on this component. ' +
    'Disabled is a Figma variant but a native attribute in code, so it is a boolean ' +
    'rather than a value of the variant axis.',
  props: {
    variant: figma.enum('Appearance', {
      Primary: 'primary' as const,
      Secondary: 'secondary' as const,
    }),
    disabled: figma.enum('State', { Default: false, Disabled: true }),
    children: figma.string('Label'),
  },
  example: (props) => (
    <Button variant={props.variant} disabled={props.disabled}>
      {props.children}
    </Button>
  ),
})

/**
 * IconButton — 326:49. Tone {Neutral, Accent, Danger}.
 *
 * Not a separate component in code: it is `Button` with `variant="icon"`.
 */
figma.connect(Button, `${FILE}/?node-id=326-49`, {
  figmaName: 'IconButton',
  codeName: 'Button',
  codeSource: 'whose-turn/src/ui/Button.tsx',
  covers: ['326:40', '326:44', '326:48'],
  note:
    'No separate IconButton in code — Button variant="icon". Figma defines three ' +
    'tones; the code has four. `canvas` has no Figma counterpart. The icon slot is ' +
    'an INSTANCE_SWAP in Figma against a string union (IconName) in code, so it is ' +
    'not a one-to-one prop and is left unmapped.',
  props: {
    tone: figma.enum('Tone', {
      Neutral: 'surface' as const,
      Accent: 'accent' as const,
      Danger: 'danger' as const,
    }),
  },
  example: (props) => (
    <Button variant="icon" tone={props.tone} leadingIcon="chevron-left" aria-label="Back" />
  ),
})
