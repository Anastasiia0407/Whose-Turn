import { useState } from 'react'
import {
  AppShell,
  Button,
  ChoreRow,
  Heading,
  SectionLabel,
  Subtitle,
} from '../ui'
import { useHousehold } from '../state'
import { useHouseholdData } from '../features/useHouseholdData'
import { SwipeRow } from '../features/SwipeRow'
import { NewChoreSheet } from '../features/NewChoreSheet'
import { MembersSheet } from '../features/MembersSheet'
import { FateModeSheet } from '../fate/FateModeSheet'
import { useNavigate } from 'react-router-dom'
import { useBlockInsets } from '../ui/useBlockInsets'
import type { FateMode } from '../data'
import styles from './HomeScreen.module.css'

/** Node 2:141 leaves 10px between the section label and the first chore row. */
const FIRST_ROW_GAP = 10

/**
 * Home — Figma 75:16 (nothing selected), 2:141 (chore selected), 70:8 (delete).
 *
 * All three are the same screen. What differs:
 *  - selected chore   -> green fill + check, and "Let fate decide" enabled
 *  - nothing selected -> CTA at 50% opacity (nodes 75:48, 70:40)
 *  - edit mode        -> a row reveals its red destructive control
 *
 * Deleting happens straight from edit mode with no confirmation dialog: edit
 * mode is itself the deliberate two-step, since the delete control does not
 * exist until the user enters it.
 *
 * Chore selection is local UI state, not a database column: it is a per-device
 * intent that only matters until a draw runs.
 */
export function HomeScreen() {
  const navigate = useNavigate()
  const { householdId } = useHousehold()
  const data = useHouseholdData(householdId)

  const [selectedChoreId, setSelectedChoreId] = useState<string | null>(null)
  const [choreSheetOpen, setChoreSheetOpen] = useState(false)
  const [membersSheetOpen, setMembersSheetOpen] = useState(false)
  const [fateSheetOpen, setFateSheetOpen] = useState(false)
  // Only one row is revealed at a time; opening another closes the previous.
  const [openRowId, setOpenRowId] = useState<string | null>(null)
  const { insets, topRef, bottomRef } = useBlockInsets()

  const canDraw = selectedChoreId !== null && data.state === 'ready'

  async function deleteChore(choreId: string) {
    const chore = data.chores.find((c) => c.id === choreId)
    if (!chore) return
    const removed = await data.removeChore(chore)
    if (removed && selectedChoreId === chore.id) setSelectedChoreId(null)
  }

  return (
    <AppShell>
      {/* A fixed frame with one scrolling list between two opaque blocks.
          The scroller is a SIBLING of the blocks, not a child, and spans the
          whole frame — so rows slide behind the header and the buttons rather
          than stopping at their edge. Its top and bottom padding are the two
          block heights, so the first and last chore can each clear them. */}
      <div className={styles.body}>
        <div
          className={styles.scroller}
          style={{
            paddingTop: `${insets.top + FIRST_ROW_GAP}px`,
            paddingBottom: `${insets.bottom}px`,
          }}
        >
          <div className={styles.list}>
            {/* While loading, the list area renders nothing at all — no copy,
                no spinner, no skeleton. None of those exist in the frames. */}

            {data.state === 'error' ? (
              <>
                <p className={[styles.status, styles.error].join(' ')} role="alert">
                  {data.loadError}
                </p>
                <Button variant="secondary" onClick={() => void data.reload()}>
                  Try again
                </Button>
              </>
            ) : null}

            {/* No zero-chore branch exists. Onboarding guarantees the first
                chore and deleting the last is blocked, so the list always has
                at least one row. */}
            {data.state === 'ready' &&
              data.chores.map((chore) => (
                <SwipeRow
                  key={chore.id}
                  deleteLabel={`Delete ${chore.name}`}
                  onRequestDelete={() => void deleteChore(chore.id)}
                  open={openRowId === chore.id}
                  onOpenChange={(next) => setOpenRowId(next ? chore.id : null)}
                >
                  <ChoreRow
                    label={chore.name}
                    selected={selectedChoreId === chore.id}
                    onClick={() =>
                      setSelectedChoreId((prev) =>
                        prev === chore.id ? null : chore.id,
                      )
                    }
                  />
                </SwipeRow>
              ))}

            {/* Only the blocked/failed DELETE message belongs here — that is
                the action that happens on this screen. Add-chore and member
                messages live in their own sheets. */}
            {data.actionError?.scope === 'chore-delete' ? (
              <p className={[styles.status, styles.error].join(' ')} role="alert">
                {data.actionError.message}
              </p>
            ) : null}
          </div>
        </div>

        {/* Opaque, and stacked above the scroller — this is what rows disappear
            behind. Header 86 + 24 gap + label 22, from node 2:141. */}
        <div className={styles.topBlock} ref={topRef}>
          <header className={styles.header}>
            <div className={styles.titles}>
              <Heading
                accent="Turn?"
                rest="Whose "
                accentPosition="trailing"
                size="h1"
              />
              <Subtitle>Settle chore disputes fairly!</Subtitle>
            </div>
            <Button
              variant="icon"
              tone="accent"
              leadingIcon="members"
              aria-label="Members"
              onClick={() => {
                data.clearActionError()
                setMembersSheetOpen(true)
              }}
            />
          </header>
          <SectionLabel>Who&apos;s doing it today?</SectionLabel>
        </div>

        {/* Also opaque across its full height, so nothing shows through the
            16px gap between the two buttons. Node 1:159: 132 tall. */}
        <div className={styles.bottomBlock} ref={bottomRef}>
          <Button
            variant="secondary"
            leadingIcon="plus"
            className={styles.addChore}
            onClick={() => {
              data.clearActionError()
              setChoreSheetOpen(true)
            }}
          >
            Add a new chore
          </Button>
          <Button
            variant="primary"
            disabled={!canDraw}
            onClick={() => {
              data.clearActionError()
              setFateSheetOpen(true)
            }}
          >
            Let fate decide
          </Button>
        </div>
      </div>

      <NewChoreSheet
        open={choreSheetOpen}
        onClose={() => {
          data.clearActionError()
          setChoreSheetOpen(false)
        }}
        onAdd={data.addChore}
        busy={data.busy}
        error={
          data.actionError?.scope === 'chore-add'
            ? data.actionError.message
            : null
        }
        onClearError={data.clearActionError}
      />

      <MembersSheet
        open={membersSheetOpen}
        onClose={() => {
          data.clearActionError()
          setMembersSheetOpen(false)
        }}
        members={data.members}
        onAdd={data.addMember}
        onRemove={data.removeMember}
        busy={data.busy}
        error={
          data.actionError?.scope === 'member-add' ||
          data.actionError?.scope === 'member-delete'
            ? data.actionError.message
            : null
        }
        onClearError={data.clearActionError}
      />

      <FateModeSheet
        open={fateSheetOpen}
        onClose={() => setFateSheetOpen(false)}
        memberCount={data.members.length}
        onPick={(mode: FateMode) => {
          setFateSheetOpen(false)
          void navigate(`/fate/${mode}?chore=${selectedChoreId ?? ''}`)
        }}
      />
    </AppShell>
  )
}
