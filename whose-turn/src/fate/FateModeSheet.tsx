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
            label="Roll the dice"
            leading={<MemberAvatar color={colorForMemberIndex(2)} name="D" />}
          />
        </button>

        <div className={styles.coinBlock}>
          <button
            type="button"
            className={styles.option}
            onClick={() => onPick('coin')}
            disabled={!coinEnabled}
            aria-describedby={coinEnabled ? undefined : 'coin-note'}
          >
            <StaticRow
              label="Flip the coin"
              leading={<MemberAvatar color={colorForMemberIndex(1)} name="C" />}
            />
          </button>
          {/* 130:146 carries this note; 104:578 is the 3+ variant where the
              option is unavailable, so the note explains why. */}
          <p id="coin-note" className={styles.note}>
            This mode is available for {COIN_MEMBER_COUNT} members only.
          </p>
        </div>
      </div>
    </BottomSheet>
  )
}
