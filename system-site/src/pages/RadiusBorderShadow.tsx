import {
  Callout,
  DriftNote,
  Page,
  Prose,
  ResolvedValue,
  ScaleRow,
  Section,
  SubSection,
} from '../docs'
import {
  BORDERS,
  RADIUS,
  RADIUS_LEDE,
  SHADOW_NOTE,
  SHADOW_OFFSETS,
} from '../content/scale'
import { FOUNDATION_NODES } from '../figma'
import styles from './Scale.module.css'

/**
 * Frame 366:443.
 *
 * The radius rows render a real corner at the real value; the border rows
 * render a real edge. The shadow section draws both offsets on real boxes, so
 * "zero blur" is something the reader sees rather than reads.
 */
export function RadiusBorderShadow() {
  return (
    <Page
      title="Radius, Border & Shadow"
      figmaNode={FOUNDATION_NODES['radius-border-shadow']}
      lede={RADIUS_LEDE}
    >
      <Section title="Radius">
        <div className={styles.scale}>
          {RADIUS.map((entry) =>
            entry.codeToken ? (
              <ScaleRow
                key={entry.figmaToken}
                name={entry.codeToken}
                render="box"
                description={entry.usedFor}
              />
            ) : null,
          )}
        </div>
      </Section>

      <Section title="Border width">
        <div className={styles.scale}>
          {BORDERS.map((entry) =>
            entry.codeToken ? (
              <ScaleRow
                key={entry.figmaToken}
                name={entry.codeToken}
                description={entry.usedFor}
              />
            ) : (
              <div key={entry.figmaToken} className={styles.absentRow}>
                <span className={styles.absentName}>{entry.figmaToken}</span>
                <span className={styles.absentBadge}>Not in the token layer</span>
                <span className={styles.absentUse}>{entry.usedFor}</span>
              </div>
            ),
          )}
        </div>
      </Section>

      <Section title="Hard shadow">
        <div className={styles.scale}>
          {SHADOW_OFFSETS.map((entry) =>
            entry.codeToken ? (
              <ScaleRow
                key={entry.figmaToken}
                name={entry.codeToken}
                description={entry.usedFor}
              />
            ) : null,
          )}
        </div>

        <SubSection title="Down and to the right, zero blur, zero spread">
          <Prose>
            Both boxes below carry the real composed token. The offset is
            positive on both axes — the shadow always falls down and to the
            right — and the blur and spread radii are both zero, so the edge is
            as hard as the outline it sits under. The colour is the brand ink,{' '}
            <ResolvedValue name="--color-border-default" />, never a
            transparent black.
          </Prose>

          <div className={styles.shadowRow}>
            <div className={styles.shadowCell}>
              <div
                className={[styles.shadowBox, styles.shadowSm].join(' ')}
                aria-hidden="true"
              />
              <p className={styles.shadowCaption}>
                --shadow-hard-sm
                <br />
                <ResolvedValue name="--shadow-offset-sm" /> offset
              </p>
            </div>
            <div className={styles.shadowCell}>
              <div
                className={[styles.shadowBox, styles.shadowLg].join(' ')}
                aria-hidden="true"
              />
              <p className={styles.shadowCaption}>
                --shadow-hard-lg
                <br />
                <ResolvedValue name="--shadow-offset-lg" /> offset
              </p>
            </div>
          </div>

          <Callout tone="note" label="The shadow is not a mistake">
            <p>{SHADOW_NOTE}</p>
          </Callout>
        </SubSection>
      </Section>

      <Section title="What disagrees">
        <DriftNote
          figmaNode={FOUNDATION_NODES['radius-border-shadow']}
          rows={[
            {
              subject: 'border/xs',
              figma: '1px — “Hairline outline used only on the 20px avatar”, and the reason the token exists at all.',
              code: (
                <>
                  No token. <code>MemberAvatar.module.css</code> writes{' '}
                  <code>border-width: 1px</code> directly on the small size — a
                  raw value in the exact place the token was created for.
                </>
              ),
            },
            {
              subject: 'shadow/hard-sm',
              figma: (
                <>
                  The file defines <code>shadow/hard-lg</code> as an effect
                  variable. No <code>hard-sm</code> effect was found bound
                  anywhere; the frame documents the 2px offset only.
                </>
              ),
              code: (
                <>
                  Both <code>--shadow-hard-sm</code> and{' '}
                  <code>--shadow-hard-lg</code> are composed from the offsets and
                  the border colour.
                </>
              ),
            },
            {
              subject: 'Provenance comments',
              figma: (
                <>
                  <code>border/sm</code>, <code>border/lg</code>,{' '}
                  <code>radius/avatar</code> and <code>shadow/hard-lg</code> are
                  all variables in the file.
                </>
              ),
              code: (
                <>
                  <code>tokens.css</code> files all four under “NOT-IN-FIGMA”.
                  Stale on every count.
                </>
              ),
            },
          ]}
        />
      </Section>
    </Page>
  )
}
