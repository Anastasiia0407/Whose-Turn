import { BottomSheet } from '@ds/ui'
import { Wheel } from '@ds/fate/Wheel'
import { figma } from './code-connect'

const FILE = 'https://www.figma.com/design/ow8Eo53KIe4QrORvA7TQ2E'

/* -------------------------------------------------------------------------- *
 * Connected, no variant axes
 * -------------------------------------------------------------------------- */

figma.connect(BottomSheet, `${FILE}/?node-id=340-72`, {
  figmaName: 'BottomSheet',
  codeName: 'BottomSheet',
  codeSource: 'whose-turn/src/ui/BottomSheet.tsx',
  note:
    'Figma defines the shape only. Every behaviour is added in code — Escape ' +
    'closes, scrim click closes, focus moves in and returns, Tab is trapped, the ' +
    'page behind is scroll-locked — plus a `framed` variant and a `headerAction` ' +
    'slot that have no counterpart in the file.',
})

figma.connect(Wheel, `${FILE}/?node-id=345-69`, {
  figmaName: 'FateWheel',
  codeName: 'Wheel',
  codeSource: 'whose-turn/src/fate/Wheel.tsx',
  note:
    'Product component. Figma draws 12 sectors for two members with the member ' +
    'colours MIRRORED — accepted in the file on 2026-08-10. The code reads ' +
    'members[i].color straight and is not mirrored, so the live component will not ' +
    'match the frame. No example here: the component needs real Member rows, and a ' +
    'fixture would be a second source of member data.',
})

/* -------------------------------------------------------------------------- *
 * Design only — in the file, deliberately not in the code
 * -------------------------------------------------------------------------- */

figma.designOnly(`${FILE}/?node-id=340-35`, {
  figmaName: 'HomeIndicator',
  reason:
    'Fake device chrome. Removed from the code: a real browser already sits inside ' +
    'real device chrome, and the space it occupied is now env(safe-area-inset-bottom).',
})

figma.designOnly(null, {
  figmaName: 'StatusBar',
  reason:
    'Never published as a component — it survives as 17 zero-opacity layers on the ' +
    'screen frames (decision D-09). Removed from the code for the same reason as ' +
    'HomeIndicator. Listed because color/text/primary is documented as existing for ' +
    'these two, and in the code that token has no such consumer.',
})

figma.designOnly(`${FILE}/?node-id=340-32`, {
  figmaName: 'Scrim',
  reason:
    'Not a component in code. It is BottomSheet’s own backdrop element plus the ' +
    '--color-scrim token; nothing else can be scrimmed, so nothing needs to reuse it.',
})

figma.designOnly(`${FILE}/?node-id=340-41`, {
  figmaName: 'SheetHeader',
  reason:
    'Internal to BottomSheet and not exported. Extracting it would let a caller ' +
    'render a sheet header outside a sheet, which the design has no state for.',
})

figma.designOnly(`${FILE}/?node-id=340-62`, {
  figmaName: 'ScreenHeader',
  reason:
    'Composed inline per screen from Heading, Subtitle and an icon Button. Its ' +
    'Figma instance also contradicts IconButton’s own tone semantics: it uses the ' +
    'Accent tone (documented as "open the members sheet") around a chevron-left.',
})

figma.designOnly(`${FILE}/?node-id=345-99`, {
  figmaName: 'CoinFace',
  reason:
    'Realised inline inside CoinScreen and never extracted into a component. It is ' +
    'the one product component with a frame and no module behind it.',
})

/* -------------------------------------------------------------------------- *
 * Code only — shipping, with no Figma component
 * -------------------------------------------------------------------------- */

const CODE_ONLY: { codeName: string; codeSource: string; reason: string }[] = [
  {
    codeName: 'AppShell',
    codeSource: 'whose-turn/src/ui/AppShell.tsx',
    reason: 'The phone-width column every screen renders inside. Figma has the frame itself instead.',
  },
  {
    codeName: 'Card',
    codeSource: 'whose-turn/src/ui/Card.tsx',
    reason: 'The plain outlined surface every other row is cut from. Figma only publishes the cut shapes.',
  },
  {
    codeName: 'ProgressBar',
    codeSource: 'whose-turn/src/ui/ProgressBar.tsx',
    reason:
      'Onboarding progress. Figma has the track tokens (color/track/default, color/track/fill) but no component.',
  },
  {
    codeName: 'SectionLabel',
    codeSource: 'whose-turn/src/ui/SectionLabel.tsx',
    reason: 'Figma has the Label/Section text style but no component wrapping it.',
  },
  {
    codeName: 'Subtitle',
    codeSource: 'whose-turn/src/ui/Heading.tsx',
    reason: 'Half of Figma’s Titles component; separated in code so a screen can set its own gap.',
  },
  {
    codeName: 'SwipeRow',
    codeSource: 'whose-turn/src/features/SwipeRow.tsx',
    reason: 'Swipe-to-reveal-delete. No frame — the interaction was never drawn.',
  },
  {
    codeName: 'FateLayout',
    codeSource: 'whose-turn/src/fate/FateLayout.tsx',
    reason: 'The chrome shared by all three fate screens. Figma draws each screen whole instead.',
  },
  {
    codeName: 'FateModeSheet',
    codeSource: 'whose-turn/src/fate/FateModeSheet.tsx',
    reason: 'Mode picker. Figma has the screen frames (130:146, 104:578) but no component.',
  },
  {
    codeName: 'MembersSheet',
    codeSource: 'whose-turn/src/features/MembersSheet.tsx',
    reason: 'Product sheet composed from BottomSheet. Figma has the screen frame only.',
  },
  {
    codeName: 'NewChoreSheet',
    codeSource: 'whose-turn/src/features/NewChoreSheet.tsx',
    reason: 'Product sheet composed from BottomSheet. Figma has the screen frame only.',
  },
]

for (const entry of CODE_ONLY) figma.codeOnly(entry)
