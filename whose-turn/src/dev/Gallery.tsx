import { useState } from 'react'
import {
  AppShell,
  BottomSheet,
  Button,
  Card,
  ChoreRow,
  Icon,
  MemberAvatar,
  PillChip,
  SectionLabel,
  StaticRow,
  TextField,
} from '../ui'
import { MAX_HOUSEHOLD_MEMBERS, MEMBER_PALETTE, colorForMemberIndex } from '../tokens'
import type { IconName } from '../ui'
import styles from './Gallery.module.css'

const ICONS: IconName[] = [
  'check',
  'chevron-left',
  'plus',
  'x',
  'trash',
  'members',
]

const PALETTE_LABELS = [
  'terracotta',
  'yellow',
  'olive',
  'teal',
  'dusty pink',
  'caramel',
]

function Section({
  title,
  caption,
  children,
}: {
  title: string
  caption?: string
  children: React.ReactNode
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{title}</h2>
      {caption ? <p className={styles.caption}>{caption}</p> : null}
      {children}
    </section>
  )
}

/**
 * Dev-only design-system gallery: every primitive in every state, in one place,
 * so the system can be reviewed against Figma without a product screen existing.
 */
export function Gallery() {
  const [selectedChore, setSelectedChore] = useState('Wash the dishes')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [choreDraft, setChoreDraft] = useState('')

  return (
    <AppShell>
      <div className={styles.page}>
        <header>
          <h1 className={styles.heading}>
            Whose <span className={styles.accent}>Turn?</span>
          </h1>
          <p className={styles.caption}>Design system — Stage 1 primitives</p>
        </header>

        <Section
          title="Typography"
          caption="Corben Bold for anything that speaks; DM Sans for quiet support text."
        >
          <div className={styles.typeSpecimen}>
            <p className={styles.h1}>Heading / H1 — Corben Bold 30/40</p>
            <p className={styles.bodyBold}>Body / Bold — Corben Bold 16/24</p>
            <p className={styles.body}>Body / Regular — DM Sans Medium 16/24</p>
            <SectionLabel>Label / Section — Corben Bold 12, uppercase</SectionLabel>
          </div>
        </Section>

        <Section
          title="Member palette"
          caption={`Assigned by join order. Household capped at ${MAX_HOUSEHOLD_MEMBERS}.`}
        >
          <div className={styles.swatches}>
            {MEMBER_PALETTE.map((hex, i) => (
              <div key={hex} className={styles.swatch}>
                <MemberAvatar color={colorForMemberIndex(i)} name={PALETTE_LABELS[i]} />
                <span>{i + 1}</span>
                <span>{hex}</span>
              </div>
            ))}
          </div>
          <div className={styles.row}>
            {MEMBER_PALETTE.map((hex, i) => (
              <MemberAvatar key={hex} color={colorForMemberIndex(i)} size="sm" />
            ))}
          </div>
        </Section>

        <Section title="Button — primary">
          <div className={styles.stack}>
            <Button variant="primary">Let fate decide</Button>
            <Button variant="primary" disabled>
              Let fate decide (disabled)
            </Button>
          </div>
        </Section>

        <Section title="Button — secondary">
          <div className={styles.stack}>
            <Button variant="secondary" leadingIcon="plus">
              Add a new chore
            </Button>
            <Button variant="secondary" leadingIcon="plus" disabled>
              Add a new chore (disabled)
            </Button>
          </div>
        </Section>

        <Section
          title="Button — icon"
          caption="Tones: surface, canvas, accent, danger."
        >
          <div className={styles.row}>
            <Button
              variant="icon"
              tone="surface"
              leadingIcon="chevron-left"
              aria-label="Back"
            />
            <Button variant="icon" tone="canvas" leadingIcon="x" aria-label="Close" />
            <Button
              variant="icon"
              tone="accent"
              leadingIcon="members"
              aria-label="Members"
            />
            <Button
              variant="icon"
              tone="danger"
              leadingIcon="trash"
              aria-label="Delete"
            />
            <Button
              variant="icon"
              tone="surface"
              leadingIcon="chevron-left"
              aria-label="Back (disabled)"
              disabled
            />
          </div>
        </Section>

        <Section
          title="ChoreRow"
          caption="Selected is GREEN plus a check — fill alone never carries state."
        >
          <div className={styles.stack}>
            {['Wash the dishes', 'Cook dinner', 'Take out the trash'].map(
              (chore) => (
                <ChoreRow
                  key={chore}
                  label={chore}
                  selected={selectedChore === chore}
                  onClick={() => setSelectedChore(chore)}
                />
              ),
            )}
            <ChoreRow label="Disabled chore" disabled />
          </div>
        </Section>

        <Section title="Rows with a member avatar">
          <div className={styles.stack}>
            <StaticRow
              label="Anastasiia"
              leading={<MemberAvatar color={colorForMemberIndex(0)} name="Anastasiia" />}
            />
            <StaticRow
              label="Maks"
              leading={<MemberAvatar color={colorForMemberIndex(1)} name="Maks" />}
            />
            <StaticRow
              label="Andrew"
              leading={<MemberAvatar color={colorForMemberIndex(2)} name="Andrew" />}
            />
          </div>
        </Section>

        <Section title="PillChip">
          <div className={styles.row}>
            <PillChip tone="success" trailingIcon="check">
              Wash the dishes
            </PillChip>
            <PillChip tone="surface" uppercase>
              does the dishes today
            </PillChip>
            <PillChip tone="canvas">Cook dinner</PillChip>
          </div>
        </Section>

        <Section title="TextField">
          <div className={styles.stack}>
            <TextField
              label="Email"
              type="email"
              placeholder="Enter email"
              autoComplete="email"
            />
            <TextField label="Chore" placeholder="Enter chore" />
            <TextField
              label="Member name"
              placeholder="Enter name"
              message="That name is already taken."
              invalid
            />
            <TextField label="Disabled" placeholder="Enter name" disabled />
          </div>
        </Section>

        <Section title="Card">
          <Card className={styles.cardDemo}>
            <p className={styles.bodyBold}>Plain outlined surface</p>
            <p className={styles.body}>
              The base shape every other component is cut from.
            </p>
          </Card>
        </Section>

        <Section title="Icons">
          <div className={styles.row}>
            {ICONS.map((name) => (
              <Icon key={name} name={name} size={24} />
            ))}
          </div>
        </Section>

        <Section
          title="BottomSheet"
          caption="Escape closes, scrim click closes, Tab is trapped, focus returns."
        >
          <Button variant="primary" onClick={() => setSheetOpen(true)}>
            Open sheet
          </Button>
          <BottomSheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            title="New"
            accentTitle=" Chore"
          >
            <TextField
              label="Chore"
              hideLabel
              placeholder="Enter chore"
              value={choreDraft}
              onChange={(e) => setChoreDraft(e.target.value)}
            />
            <Button
              variant="primary"
              disabled={choreDraft.trim().length === 0}
              onClick={() => setSheetOpen(false)}
            >
              Add chore
            </Button>
          </BottomSheet>
        </Section>

      </div>
    </AppShell>
  )
}
