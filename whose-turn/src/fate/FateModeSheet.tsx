import { BottomSheet, MemberAvatar, StaticRow } from '../ui'
import { colorForMemberIndex } from '../tokens'
import { isCoinAvailable, COIN_MEMBER_COUNT } from './engine'
import type { FateMode } from '../data'
import styles from './FateModeSheet.module.css'

type Props = {
  open: boolean
  onClose: () => void
  memberCount: number
  onPick: (mode: FateMode) => void
}

/**
 * Fate-mode picker — Figma 130:146 (2 members, coin enabled) and 104:578 (3+).
 *
 * The badge colours are the mode's own glyph colours from the frames, taken
 * from the palette helper rather than hardcoded hexes.
 *
 * NOTE: the frame's caption reads "membrs" — a typo in the design, corrected
 * to "members" here.
 */
export function FateModeSheet({ open, onClose, memberCount, onPick }: Props) {
  const coinEnabled = isCoinAvailable(memberCount)

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Select"
      accentTitle=" Fate-Mode"
    >
      <div className={styles.options}>
        <button
          type="button"
          className={styles.option}
          onClick={() => onPick('wheel')}
        >
          <StaticRow
            className={styles.optionRow}
            label="Spin the wheel"
            leading={<MemberAvatar color={colorForMemberIndex(0)} name="W" />}
          />
        </button>

        <button
          type="button"
          className={styles.option}
          onClick={() => onPick('dice')}
        >
          <StaticRow
            className={styles.optionRow}
            label="Roll the dice"
            leading={<MemberAvatar color={colorForMemberIndex(2)} name="D" />}
          />
        </button>

        {/* At 3 or more members the coin row is not rendered AT ALL — no
            disabled row, no greying, no explanation. The design defines no
            disabled state for this row, and 104:578 (the 3+ frame) simply has
            no such treatment, so inventing one is out. At exactly two members
            all three options appear, with the note from 130:146. */}
        {coinEnabled ? (
          <div className={styles.coinBlock}>
            <button
              type="button"
              className={styles.option}
              onClick={() => onPick('coin')}
            >
              <StaticRow
                className={styles.optionRow}
                label="Flip the coin"
                leading={
                  <MemberAvatar color={colorForMemberIndex(1)} name="C" />
                }
              />
            </button>
            <p className={styles.note}>
              This mode is available for {COIN_MEMBER_COUNT} members only.
            </p>
          </div>
        ) : null}
      </div>
    </BottomSheet>
  )
}
