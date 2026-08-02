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
  | 'bell'
  | 'bell-off'

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
  bell: '0 0 24 24',
  'bell-off': '0 0 24 24',
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
  // bell-02 (node 251:65). Natural art 18x20, centred in the 24 box.
  bell: (
    <g transform="translate(3 2)">
      <path
        d="M6.33302 18.0909C7.0407 18.6562 7.97522 19 8.99969 19C10.0242 19 10.9587 18.6562 11.6664 18.0909M1.50732 15.1818C1.08571 15.1818 0.850229 14.5194 1.10526 14.1514C1.69705 13.2975 2.26824 12.0451 2.26824 10.537L2.29265 8.35166C2.29265 4.29145 5.2955 1 8.99969 1C12.7584 1 15.8055 4.33993 15.8055 8.45995L15.7811 10.537C15.7811 12.0555 16.3326 13.3147 16.9003 14.169C17.1455 14.5379 16.9094 15.1818 16.493 15.1818H1.50732Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  ),
  // bell-off-01 (node 251:149). Same 18x20 art plus the strike-through.
  'bell-off': (
    <g transform="translate(3 2)">
      <path
        d="M16.9997 14.3112C16.4284 13.482 15.8734 12.2598 15.8734 10.786L15.898 8.77002C15.898 4.77119 12.8319 1.52949 9.04964 1.52949C8.64275 1.52949 8.24427 1.56755 7.85722 1.64051M6.36631 18.1177C7.07841 18.6664 8.01877 19.0001 9.04964 19.0001C10.0805 19.0001 11.0209 18.6664 11.733 18.1177M12.8063 15.2942H1.51046C1.08621 15.2942 0.84926 14.6513 1.10589 14.2941C1.70137 13.4653 2.27613 12.2498 2.27613 10.786L2.30069 8.66492C2.30069 6.96423 2.86345 5.40252 3.80282 4.17656M14.953 17.9414L2.60965 1.00007"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </g>
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
