import { MemberAvatar } from '@ds/ui'
import { MEMBER_PALETTE } from '@ds/tokens'
import { figma } from './code-connect'

const FILE = 'https://www.figma.com/design/ow8Eo53KIe4QrORvA7TQ2E'

/**
 * Avatar — 327:34. Size {Sm, Md, Lg}.
 */
figma.connect(MemberAvatar, `${FILE}/?node-id=327-34`, {
  figmaName: 'Avatar',
  codeName: 'MemberAvatar',
  codeSource: 'whose-turn/src/ui/MemberAvatar.tsx',
  covers: ['327:27', '327:30', '327:33'],
  note:
    'Named Avatar in Figma, MemberAvatar in code. Figma takes a member SLOT ' +
    '(member={2}); the code takes the member’s STORED colour, because identity is ' +
    'persisted per member and must survive a removal. That is a deliberate ' +
    'difference, not a naming slip. Only the Lg size carries an initial.',
  props: {
    size: figma.enum('Size', {
      Sm: 'sm' as const,
      Md: 'md' as const,
      Lg: 'lg' as const,
    }),
  },
  example: (props) => (
    <MemberAvatar size={props.size} color={MEMBER_PALETTE[0]} name="Anastasiia" />
  ),
})
