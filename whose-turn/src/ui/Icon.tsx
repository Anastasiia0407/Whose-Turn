/**
 * Icons exported from Figma via MCP. The path data below is verbatim from the
 * exported SVGs, which are kept alongside in ../assets/icons/ as provenance.
 *
 * Two changes are made to the exports, both deliberate:
 *  - `stroke` becomes `currentColor` so colour comes from the token layer
 *    instead of being baked in (the exports variously hardcode #332014,
 *    black and white).
 *  - Icons that Figma positions inside a 24x24 box via percentage insets are
 *    pre-composed onto a 0 0 24 24 viewBox with the equivalent transform, so
 *    every icon is interchangeable at a single size.
 */

export type IconName =
  | 'check'
  | 'chevron-left'
  | 'plus'
  | 'x'
  | 'trash'
  | 'members'

type IconProps = {
  name: IconName
  /** Rendered size in px. Icons are square. */
  size?: number
  className?: string
}

// viewBox differs per icon because `members` is natively 20x20 in Figma.
const VIEW_BOX: Record<IconName, string> = {
  check: '0 0 24 24',
  'chevron-left': '0 0 24 24',
  plus: '0 0 24 24',
  x: '0 0 24 24',
  trash: '0 0 24 24',
  members: '0 0 20 20',
}

const PATHS: Record<IconName, React.ReactNode> = {
  // check-02. Natural art 11.5x10.73, placed at (6,6) inside the 24 box.
  check: (
    <g transform="translate(6 6)">
      <path
        d="M1.00007 5.87842C1.94151 6.5631 3.82439 8.44598 4.59467 9.72977C5.53611 7.67571 7.9325 3.05409 10.5001 1.00004"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  ),
  // chevron-left. Base art is a 12x7 chevron pointing up, rotated -90deg.
  'chevron-left': (
    <g transform="translate(12 12) rotate(-90) translate(-6 -3.5)">
      <path
        d="M1 6L6 1L11 6"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  ),
  // plus-03. Natively 24x24.
  plus: (
    <path
      d="M12 7.2L12 16.8M16.8 12L7.2 12"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    />
  ),
  // x-01. Natively 24x24.
  x: (
    <path
      d="M18 6L6 18M18 18L6 6"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    />
  ),
  // trash-04. Natural art 18x20, placed at (3,2) inside the 24 box.
  trash: (
    <g transform="translate(3 2)">
      <path
        d="M1 4.17647L17 4.17647M13 19H5C3.89543 19 3 18.0519 3 16.8824V5.23529C3 4.65052 3.44772 4.17647 4 4.17647H14C14.5523 4.17647 15 4.65052 15 5.23529V16.8824C15 18.0519 14.1046 19 13 19ZM7 4.17647H11C11.5523 4.17647 12 3.70242 12 3.11765V2.05882C12 1.47405 11.5523 1 11 1H7C6.44772 1 6 1.47405 6 2.05882V3.11765C6 3.70242 6.44772 4.17647 7 4.17647Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </g>
  ),
  // users-profiles-check. Natively 20x20.
  members: (
    <path
      d="M2 18L2.00034 14.9997C2.00052 13.3429 3.34361 12 5.00034 12H10.9999M13.5 14.5L14.5 15.5L18 12M14.5 2C15.7135 2.68023 16.5 3.77073 16.5 5C16.5 6.22927 15.7135 7.31977 14.5 8M12 5C12 6.65685 10.6569 8 9 8C7.34314 8 6 6.65685 6 5C6 3.34315 7.34314 2 9 2C10.6569 2 12 3.34315 12 5Z"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
}

export function Icon({ name, size = 24, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={VIEW_BOX[name]}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  )
}
