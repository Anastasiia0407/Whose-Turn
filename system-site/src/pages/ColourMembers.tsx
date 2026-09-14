import { MemberAvatar } from '@ds/ui'
import { MAX_HOUSEHOLD_MEMBERS } from '@ds/tokens'
import {
  Callout,
  CodeBlock,
  ContrastReadout,
  DocTable,
  DriftNote,
  Mono,
  Page,
  Prose,
  Section,
  SubSection,
  TokenSwatch,
} from '../docs'
import { MEMBERS, MEMBERS_LEDE, MEMBER_FINDINGS } from '../content/colour'
import { fromToken, refCss } from '../tokens/color'
import { FOUNDATION_NODES } from '../figma'
import styles from './Colour.module.css'

/** The ink the initial is drawn in, and the white it is deliberately not. */
const INK = fromToken('--color-text-heading')
const WHITE = fromToken('--color-text-on-accent')

/**
 * Frame 364:708.
 *
 * The six colours are read from `MEMBER_PALETTE`, imported from the app — this
 * is the one part of the system that lives in TypeScript rather than in
 * `tokens.css`, because a member's colour is stored on their row and passed in.
 *
 * The avatars are real `MemberAvatar` instances, so the ink-initial rule is
 * demonstrated by the component that implements it rather than re-described.
 */
export function ColourMembers() {
  return (
    <Page
      title="Colour — Member identity"
      figmaNode={FOUNDATION_NODES['colour-members']}
      lede={MEMBERS_LEDE}
    >
      <Section title="The six slots">
        <Prose>
          Colour is assigned by <strong>join order</strong> and stored on the
          member row. Nothing recomputes it at render time: deriving from{' '}
          <Mono>sort_order</Mono> or from array position would reshuffle
          everyone’s identity the moment a member is removed. A household of two
          uses the first two colours, a household of five the first five, and the
          household is capped at {MAX_HOUSEHOLD_MEMBERS} because that is how many
          colours there are.
        </Prose>

        <CodeBlock label="Assigned once, at creation">
          {`import { colorForMemberIndex, nextMemberColorIndex } from '../tokens'

const colorIndex = nextMemberColorIndex(members.length)
await createMember({ name, color: colorForMemberIndex(colorIndex) })

// Everywhere after: read the stored value, never recompute it.
<MemberAvatar color={member.color} name={member.name} size="lg" />`}
        </CodeBlock>

        <div className={styles.grid}>
          {MEMBERS.map((entry) => (
            <TokenSwatch
              key={entry.slot}
              color={entry.color}
              alias={entry.figmaAlias}
              description={`Member ${entry.slot}`}
            />
          ))}
        </div>
      </Section>

      <Section title="The initial is ink, never white">
        <Prose>
          Every avatar initial is drawn in <Mono>--color-text-heading</Mono> —
          the same ink as the outline — on all six colours. The reason is
          measurable rather than aesthetic, and both readings are below.
        </Prose>

        <div className={styles.avatars}>
          {MEMBERS.map((entry) => (
            <div key={entry.slot} className={styles.avatarCell}>
              {/* The real component, handed the real stored value — exactly the
                  call a screen makes. */}
              <MemberAvatar
                color={refCss(entry.color)}
                name={`Member ${entry.slot}`}
                size="lg"
              />
              <span className={styles.avatarSlot}>{entry.slot}</span>
            </div>
          ))}
        </div>

        <SubSection title="Ink against white, measured on every slot">
          <Prose>
            The left chip is the ink initial as the product draws it. The right
            chip is the same initial in white — the obvious alternative, and the
            one the palette cannot carry.
          </Prose>

          <div>
            {MEMBERS.map((entry) => (
              <div key={entry.slot} className={styles.pairRow}>
                <span className={styles.pairLabel}>Member {entry.slot}</span>

                <span
                  className={[styles.inkDemo, styles.inkOn].join(' ')}
                  style={{ background: refCss(entry.color) }}
                  aria-hidden="true"
                >
                  M
                </span>
                <span
                  className={[styles.inkDemo, styles.whiteOn].join(' ')}
                  style={{ background: refCss(entry.color) }}
                  aria-hidden="true"
                >
                  M
                </span>

                <span className={styles.pairReadouts}>
                  <ContrastReadout
                    foreground={INK}
                    background={entry.color}
                    label="ink initial"
                  />
                  <ContrastReadout
                    foreground={WHITE}
                    background={entry.color}
                    label="white initial"
                  />
                </span>
              </div>
            ))}
          </div>

          <Callout tone="rule" title="Why the initial is never white">
            <p>
              White measures <strong>2.08:1</strong> on the amber of slot 2 — the
              figure the design file records as accepted debt — which is
              unreadable at any size. The ink measures 7.43:1 on that same amber
              and is never worse than 3.33:1 on any entry in the palette. One
              rule, applied to all six, beats a per-colour judgement that has to
              be re-made every time the palette grows.
            </p>
            <p>
              The ink still does not clear 4.5:1 on every slot, and the readouts
              above say so — it passes on slot 2 alone. At the rendered 12px that
              is a real AA failure for normal-size text on the other five; it
              clears AA-large (3:1) everywhere. Fixing it needs either a larger
              initial or a darker palette — both design calls, neither a value
              this site can change.
            </p>
            <p>
              The readouts also show white scoring higher than ink on slots 4 and
              6. Per-colour switching would win those two and lose the rest, and
              would have to be re-decided every time the palette grows — which is
              the trade the one rule is making. It is a consistency argument, not
              a contrast one, and the numbers above are what it costs.
            </p>
          </Callout>
        </SubSection>
      </Section>

      <Section title="Two things to know">
        <DocTable
          caption="Two things to know"
          columns={['Finding', 'Detail']}
          rows={MEMBER_FINDINGS.map((row) => [row.finding, row.detail])}
        />
      </Section>

      <Section title="What disagrees">
        <DriftNote
          figmaNode={FOUNDATION_NODES['colour-members']}
          rows={[
            {
              subject: 'Member slot 3',
              figma: (
                <>
                  <code>color/green/500</code> — the same green as{' '}
                  <code>color/accent/success</code>.
                </>
              ),
              code: (
                <>
                  An olive that appears nowhere in the design file. The swatch
                  above is the live value.
                </>
              ),
              note: 'The largest single disagreement in the system, and a deliberate one: green already means “selected chore”, so reusing it for a member makes green mean two things on the dice screen. The design file records the clash as a known finding; the code diverged instead.',
            },
            {
              subject: 'Where member colours live',
              figma: (
                <>
                  Six variables, <code>color/member/1…6</code>.
                </>
              ),
              code: (
                <>
                  No <code>--color-member-*</code> custom properties exist. The
                  palette is a TypeScript array, <Mono>MEMBER_PALETTE</Mono>,
                  because the value is stored per member and passed in as a prop.
                </>
              ),
            },
            {
              subject: 'The fortune wheel',
              figma: 'Wheel segments give each member the other one’s colour — all 12, consistently. Left as-is on 2026-08-10.',
              code: (
                <>
                  <code>Wheel.tsx</code> reads{' '}
                  <code>members[memberIndex].color</code> directly and is not
                  mirrored.
                </>
              ),
              note: 'Accepted in the file, silently correct in the code — so the live component will not match the frame.',
            },
          ]}
        />
      </Section>
    </Page>
  )
}
