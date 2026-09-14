import { CANVAS } from '@ds/tokens'
import {
  Callout,
  CodeBlock,
  DocTable,
  DriftNote,
  Mono,
  Page,
  Prose,
  ResolvedValue,
  ScaleRow,
  Section,
} from '../docs'
import { LAYOUT, LAYOUT_LEDE, LAYOUT_MISMATCH } from '../content/scale'
import { FOUNDATION_NODES } from '../figma'
import styles from './Scale.module.css'

/**
 * Frame 366:555.
 *
 * The reference frame is drawn from the tokens themselves — the demo below is
 * `max-width: var(--layout-canvas-width)` with `padding-inline:
 * var(--layout-gutter)`, and the hatched bands ARE the gutter. Resize the
 * window and it behaves exactly as the app does, because it is the same values.
 */
export function Layout() {
  return (
    <Page title="Layout" figmaNode={FOUNDATION_NODES.layout} lede={LAYOUT_LEDE}>
      <Section title="Layout tokens">
        <div className={styles.scale}>
          {LAYOUT.map((entry) =>
            entry.codeToken ? (
              <ScaleRow
                key={entry.figmaToken}
                name={entry.codeToken}
                description={entry.usedFor}
              />
            ) : null,
          )}
        </div>
      </Section>

      <Section title="The reference frame">
        <Prose>
          The app renders in a column capped at{' '}
          <ResolvedValue name="--layout-canvas-width" /> with{' '}
          <ResolvedValue name="--layout-gutter" /> gutters at every width. Above
          that cap the column stays centred rather than stretching; below it the
          layout is fluid down to a{' '}
          <ResolvedValue name="--layout-min-width" /> floor. The 390 is a{' '}
          <strong>reference, not a canvas</strong>.
        </Prose>

        <div className={styles.canvas}>
          <span className={[styles.gutter, styles.gutterStart].join(' ')} aria-hidden="true" />
          <span className={[styles.gutter, styles.gutterEnd].join(' ')} aria-hidden="true" />
          <div className={styles.canvasContent}>
            <p className={styles.canvasBlock}>
              Fixed block — a screen header. Stays put.
            </p>
            <div className={styles.canvasScroller}>
              {['Wash the dishes', 'Cook dinner', 'Take out the trash', 'Fold laundry', 'Hoover the hall'].map(
                (row) => (
                  <p key={row} className={styles.canvasBlock}>
                    {row}
                  </p>
                ),
              )}
            </div>
            <p className={styles.canvasBlock}>
              Fixed block — the draw trigger. Never scrolls away.
            </p>
          </div>
        </div>

        <Callout tone="note" title="Fixed frame, scrolling list">
          <p>
            Every screen is a fixed top block, a flexible middle that scrolls on
            its own, and a fixed bottom action. The shell caps its height as well
            as flooring it —{' '}
            <Mono>min-height</Mono> alone is only a floor, so the page would grow
            past the viewport, no descendant would ever be over-constrained, and
            the inner scrollport would never engage. The list would not scroll;
            the whole page would, taking the call-to-action with it.
          </p>
        </Callout>
      </Section>

      <Section title="Safe-area insets">
        <Prose>
          There is no fake status bar and no home indicator. The vertical space
          they occupied in the design file is the real safe-area inset — zero on
          a desktop browser, non-zero on a notched device. Figma’s y coordinates
          were measured from the top of a frame that <em>included</em> a 44px
          status bar, so screen offsets are rebased against the inset rather than
          copied across.
        </Prose>

        <CodeBlock label="AppShell.module.css">
          {`padding-block-start: env(safe-area-inset-top, 0px);
padding-block-end: calc(
  var(--spacing-4xl) + env(safe-area-inset-bottom, 0px)
);`}
        </CodeBlock>

        <Prose>
          Height is <Mono>100dvh</Mono>, never <Mono>100vh</Mono>: vh is the{' '}
          <em>largest</em> viewport, so while the iOS chrome is visible a 100vh
          box is taller than the screen and pushes its bottom content under the
          toolbar. The shell also subtracts <Mono>--keyboard-inset</Mono>, which
          is 0 unless an iOS keyboard is overlaying the viewport — the one thing
          CSS units cannot see.
        </Prose>
      </Section>

      <Section title="One mismatch worth knowing">
        <DocTable
          caption="One mismatch worth knowing"
          columns={['Where', 'What']}
          rows={[[LAYOUT_MISMATCH.where, LAYOUT_MISMATCH.what]]}
        />
      </Section>

      <Section title="What disagrees">
        <DriftNote
          figmaNode={FOUNDATION_NODES.layout}
          rows={[
            {
              subject: 'Canvas height',
              figma: 'Frames are 700px tall. The frame itself flags the mismatch.',
              code: (
                <>
                  <Mono>CANVAS.height</Mono> is {CANVAS.height}. Width agrees at{' '}
                  {CANVAS.width}.
                </>
              ),
              note: 'Three sources, two answers: the design file says 700, CANVAS says 844, and CLAUDE.md also says 390×844 — while the git history records the frames being recomposed at 390×700. Nothing here can settle it; a human has to.',
            },
            {
              subject: 'layout/min-width',
              figma: '360px — the fluid floor.',
              code: (
                <>
                  <code>--layout-min-width</code> is declared and referenced by
                  nothing. The floor is honoured by fluid layout rather than
                  enforced by the token.
                </>
              ),
            },
            {
              subject: 'layout/gutter',
              figma: 'No such variable. The 16px inset is spacing/xl applied at the screen edge.',
              code: (
                <>
                  <code>--layout-gutter</code> exists as an alias of{' '}
                  <code>--spacing-xl</code>, so the gutter can be reasoned about
                  as one thing.
                </>
              ),
              note: 'Code-only, and harmless — but it means the two systems count their layout tokens differently.',
            },
          ]}
        />
      </Section>
    </Page>
  )
}
