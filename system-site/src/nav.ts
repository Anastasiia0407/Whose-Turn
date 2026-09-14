import { COMPONENT_NODES, FOUNDATION_NODES } from './figma'

/**
 * The site map.
 *
 * Every page this system will have is listed, including the ones not written
 * yet. An item without a `to` renders as pending rather than being hidden: the
 * shape of the system is itself information, and a sidebar that grows silently
 * makes it impossible to see what is missing.
 *
 * There is one live version of this documentation. No version switcher, no
 * versioned routes, no archive.
 */

export type NavItem = {
  label: string
  /** Absent until the page exists. */
  to?: string
  /** The frame this page documents, for the "Open in Figma" link. */
  figmaNode?: string
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const NAV: NavGroup[] = [
  {
    label: 'Getting started',
    items: [
      {
        label: 'Design tokens — start here',
        to: '/',
        figmaNode: FOUNDATION_NODES['design-tokens'],
      },
    ],
  },
  {
    label: 'Foundations',
    items: [
      {
        label: 'Colour — primitives',
        to: '/foundations/colour-primitives',
        figmaNode: FOUNDATION_NODES['colour-primitives'],
      },
      {
        label: 'Colour — semantic',
        to: '/foundations/colour-semantic',
        figmaNode: FOUNDATION_NODES['colour-semantic'],
      },
      {
        label: 'Colour — member identity',
        to: '/foundations/colour-members',
        figmaNode: FOUNDATION_NODES['colour-members'],
      },
      { label: 'Spacing', to: '/foundations/spacing', figmaNode: FOUNDATION_NODES.spacing },
      {
        label: 'Radius, border & shadow',
        to: '/foundations/radius-border-shadow',
        figmaNode: FOUNDATION_NODES['radius-border-shadow'],
      },
      { label: 'Layout', to: '/foundations/layout', figmaNode: FOUNDATION_NODES.layout },
      { label: 'Typography', to: '/foundations/typography', figmaNode: FOUNDATION_NODES.typography },
    ],
  },
  {
    label: 'Components',
    items: [
      { label: 'Button', figmaNode: COMPONENT_NODES.button },
      { label: 'IconButton', figmaNode: COMPONENT_NODES.iconbutton },
      { label: 'Avatar', figmaNode: COMPONENT_NODES.avatar },
      { label: 'Icons', figmaNode: COMPONENT_NODES.icons },
      { label: 'TextField', figmaNode: COMPONENT_NODES.textfield },
      { label: 'ListRow', figmaNode: COMPONENT_NODES.listrow },
      { label: 'SheetHeader', figmaNode: COMPONENT_NODES.sheetheader },
      { label: 'ScreenHeader', figmaNode: COMPONENT_NODES.screenheader },
      { label: 'Titles', figmaNode: COMPONENT_NODES.titles },
      { label: 'BottomSheet', figmaNode: COMPONENT_NODES.bottomsheet },
      { label: 'Scrim', figmaNode: COMPONENT_NODES.scrim },
    ],
  },
  {
    label: 'Product components',
    items: [
      { label: 'FateWheel', figmaNode: COMPONENT_NODES.fatewheel },
      { label: 'Die', figmaNode: COMPONENT_NODES.die },
      { label: 'CoinFace', figmaNode: COMPONENT_NODES.coinface },
    ],
  },
  {
    // No frames exist for patterns yet, so there is nothing to list. The group
    // is here because the slot is real, not because content is coming.
    label: 'Patterns',
    items: [],
  },
  {
    label: 'Decisions',
    items: [
      { label: 'Figma ↔ code', to: '/figma-code' },
      {
        label: 'Decisions & accepted debt',
        to: '/decisions',
        figmaNode: FOUNDATION_NODES.decisions,
      },
    ],
  },
]
