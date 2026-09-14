import { Callout, DriftNote, Page, Prose, Section, TokenSwatch } from '../docs'
import { SEMANTIC, SEMANTIC_LEDE } from '../content/colour'
import { fromToken } from '../tokens/color'
import { FOUNDATION_NODES } from '../figma'
import styles from './Colour.module.css'

/**
 * Frame 364:525.
 *
 * Every swatch is a live read of the CSS custom property. The ALIASES column is
 * the one authored field: the code layer stores literals, not references, so
 * nothing in the running system knows that `--color-accent-primary` is meant to
 * point at `color/orange/600`. That fact exists only in the design file, and it
 * is labelled as coming from there.
 */
export function ColourSemantic() {
  return (
    <Page
      title="Colour — Semantic"
      figmaNode={FOUNDATION_NODES['colour-semantic']}
      lede={SEMANTIC_LEDE}
    >
      <Section title="Purpose tokens">
        <Prose>
          Fourteen tokens, each measured against both surfaces it can appear on.
        </Prose>

        <Callout tone="note" title="What the pass mark does and does not mean">
          <p>
            Every ratio is <em>this colour as text or as an outline</em> on that
            background, against WCAG AA for normal text at 4.5:1. That reading is
            decisive for the text tokens and for{' '}
            <code>--color-border-default</code>. For a fill like{' '}
            <code>--color-accent-primary</code> it is advisory: it tells you what
            happens if you put a label <em>in</em> that colour on the canvas, not
            whether the fill itself is legible — the label on the terracotta CTA
            is white, and that pairing is measured on the decisions page instead.
          </p>
        </Callout>

        <div className={styles.grid}>
          {SEMANTIC.map((entry) => (
            <TokenSwatch
              key={entry.figmaToken}
              color={entry.codeToken ? fromToken(entry.codeToken) : null}
              alias={entry.aliases === 'literal' ? undefined : entry.aliases}
              absentName={entry.figmaToken}
              description={entry.usedFor}
            />
          ))}
        </div>
      </Section>

      <Section title="What disagrees">
        <DriftNote
          figmaNode={FOUNDATION_NODES['colour-semantic']}
          rows={[
            {
              subject: 'Three tokens are renamed',
              figma: (
                <>
                  <code>color/accent/destructive</code>,{' '}
                  <code>color/track/default</code>,{' '}
                  <code>color/background/scrim</code>
                </>
              ),
              code: (
                <>
                  <code>--color-accent-danger</code>,{' '}
                  <code>--color-progress-track</code>, <code>--color-scrim</code>
                </>
              ),
              note: 'Same values, different names. A search for the Figma name finds nothing in the code.',
            },
            {
              subject: 'color/track/fill',
              figma: (
                <>
                  A semantic token aliasing <code>color/brown/800</code>, for the
                  filled portion of a progress bar.
                </>
              ),
              code: (
                <>
                  No token. <code>ProgressBar.module.css</code> uses the
                  primitive <code>--color-brown-800</code> directly — the only
                  primitive reference in any component, and the one place the
                  system’s own rule is broken.
                </>
              ),
            },
            {
              subject: 'The alias chain',
              figma: 'Each semantic token references a primitive, so changing the primitive moves everything downstream.',
              code: 'Each custom property holds a literal value. The alias exists only as documentation; changing a “primitive” would move nothing.',
              note: 'This is why the ALIASES column here is authored rather than read.',
            },
            {
              subject: 'color/text/primary',
              figma: 'Documented as being for “status bar and home indicator”.',
              code: 'Neither exists — both were removed as fake device chrome. The token is used for ordinary body text.',
            },
          ]}
        />
      </Section>
    </Page>
  )
}
