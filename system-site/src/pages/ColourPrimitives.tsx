import {
  Callout,
  DriftNote,
  Page,
  Prose,
  Section,
  TokenSwatch,
} from '../docs'
import { PRIMITIVES, PRIMITIVES_LEDE } from '../content/colour'
import { FOUNDATION_NODES } from '../figma'
import styles from './Colour.module.css'

/**
 * Frame 364:372.
 *
 * The awkward page. The code layer has no primitive shelf — `--color-brown-800`
 * is the only primitive it names — so there is nothing to read fourteen values
 * out of. Rather than reprint the hexes from the design file, which would put a
 * hand-maintained copy of the palette into this repo, each primitive is shown
 * THROUGH the semantic token or member-palette entry that carries the same
 * value. That is a live read, and it makes the structural point at the same
 * time: in code, a primitive only exists inside its consumer.
 */
export function ColourPrimitives() {
  return (
    <Page
      title="Colour — Primitives"
      figmaNode={FOUNDATION_NODES['colour-primitives']}
      lede={PRIMITIVES_LEDE}
    >
      <Section title="The palette">
        <Prose>
          Each swatch below is painted and measured from the code that carries
          the value — the token name under the chip is the thing you can copy and
          use. The Figma primitive it corresponds to is named beside it.
        </Prose>

        <div className={styles.grid}>
          {PRIMITIVES.map((entry) => (
            <TokenSwatch
              key={entry.token}
              color={entry.carrier}
              alias={entry.token}
              description={entry.what}
            />
          ))}
        </div>
      </Section>

      <Section title="What disagrees">
        <DriftNote
          figmaNode={FOUNDATION_NODES['colour-primitives']}
          rows={[
            {
              subject: 'The primitive shelf itself',
              figma: '14 primitives in their own collection, each independently nameable.',
              code: (
                <>
                  One primitive is named: <code>--color-brown-800</code>. The
                  other thirteen values exist only inside the semantic token or
                  the member-palette entry that uses them.
                </>
              ),
              note: 'This is why every swatch above is labelled with a semantic name.',
            },
            {
              subject: 'color/black',
              figma: 'A primitive, described as “True black”.',
              code: 'Nothing. No token, no usage. Icon strokes use currentColor and inherit the brand ink.',
            },
            {
              subject: 'Member slot 3',
              figma: (
                <>
                  <code>color/green/500</code> serves as both the success accent
                  and member slot 3.
                </>
              ),
              code: (
                <>
                  Member 3 is a separate olive that has no Figma primitive at
                  all. See the member identity page.
                </>
              ),
            },
          ]}
        />

        <Callout tone="rule" label="The one rule" title="Never reference a primitive from a component">
          <p>
            The code layer breaks this once:{' '}
            <code>ProgressBar.module.css</code> fills the bar with{' '}
            <code>--color-brown-800</code>, the raw primitive, because the
            semantic token the design file defines for it —{' '}
            <code>color/track/fill</code> — was never added to the CSS. It is the
            only primitive reference in any component.
          </p>
        </Callout>
      </Section>
    </Page>
  )
}
