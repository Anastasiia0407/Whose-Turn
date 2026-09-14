import { TextField } from '@ds/ui'
import { figma } from './code-connect'

const FILE = 'https://www.figma.com/design/ow8Eo53KIe4QrORvA7TQ2E'

/**
 * TextField — 332:32. State {Placeholder, Filled}.
 */
figma.connect(TextField, `${FILE}/?node-id=332-32`, {
  figmaName: 'TextField',
  codeName: 'TextField',
  codeSource: 'whose-turn/src/ui/TextField.tsx',
  covers: ['332:28', '332:31'],
  note:
    'Figma’s State axis is CONTENT in code, not a prop: a field is "Filled" because ' +
    'it has a value. It is mapped to `value` so the correspondence is recorded, but ' +
    'nothing in the code branches on it. The code also adds label, hideLabel, ' +
    'message and invalid — none of which exist in the Figma component, which is why ' +
    'the error state has no frame.',
  props: {
    value: figma.enum('State', { Placeholder: '', Filled: 'Wash the dishes' }),
    placeholder: figma.string('Placeholder'),
  },
  example: (props) => (
    <TextField label="Chore" hideLabel placeholder={props.placeholder} value={props.value} readOnly />
  ),
})
