import { Heading, Subtitle } from '@ds/ui'
import {
  Callout,
  CodeBlock,
  DocTable,
  DriftNote,
  Mono,
  Page,
  Prose,
  Section,
  TypeSpecimen,
} from '../docs'
import { TYPE_FINDINGS, TYPE_STYLES, TYPOGRAPHY_LEDE } from '../content/typography'
import { FOUNDATION_NODES } from '../figma'
import styles from './Typography.module.css'

/**
 * Frame 367:271.
 *
 * Nine styles in the file, four complete token groups in the code. Rather than
 * flatten that to whichever number reads better, every style is listed and the
 * five that have no tokens say so where their specimen would be.
 */
export function Typography() {
  return (
    <Page
      title="Typography"
      figmaNode={FOUNDATION_NODES.typography}
      lede={TYPOGRAPHY_LEDE}
    >
      <Section title="The nine styles">
        <Prose>
          Every specimen below is live text styled by the token, not an image and
          not a screenshot. The values beside it are read back from the browser,
          so they report what actually rendered — including the font that
          actually loaded.
        </Prose>

        <div className={styles.specimens}>
          {TYPE_STYLES.map((entry) => (
            <section key={entry.style} className={styles.styleBlock}>
              <header className={styles.styleHeader}>
                <h3 className={styles.styleName}>{entry.style}</h3>
                <p className={styles.styleSpec}>{entry.spec}</p>
              </header>

              {entry.group ? (
                <>
                  <TypeSpecimen group={entry.group} sample={entry.sample} />
                  {entry.partial ? (
                    <p className={styles.partial}>{entry.partial}</p>
                  ) : null}
                </>
              ) : (
                <div className={styles.absent}>
                  <p className={styles.absentBadge}>No tokens</p>
                  <p className={styles.absentBody}>
                    This style exists in the design file and has no{' '}
                    <Mono>--type-*</Mono> group in the token layer. Anything
                    setting it is writing raw values.
                  </p>
                </div>
              )}
            </section>
          ))}
        </div>
      </Section>

      <Section title="The two-tone headline">
        <Prose>
          The wordmark treatment is a pattern rather than a token: one heading
          split into a dark phrase and a terracotta one. It is a single element,
          so a screen reader announces one heading rather than two fragments, and
          the accent can lead or trail.
        </Prose>

        {/* The real component. It renders an <h1>, which is right in a product
            screen — one heading per screen — but would put three more h1s into
            this page's outline. Hidden from assistive tech because it is a
            purely visual specimen whose text is written out below it. */}
        <div className={styles.headlineDemo} aria-hidden="true">
          <Heading accent="Turn?" rest="Whose " accentPosition="trailing" size="h1" />
          <Subtitle>Settle chore disputes fairly!</Subtitle>
        </div>

        <CodeBlock label="The specimen above, verbatim">
          {`import { Heading, Subtitle } from '../ui'

<Heading accent="Turn?" rest="Whose " accentPosition="trailing" size="h1" />
<Subtitle>Settle chore disputes fairly!</Subtitle>`}
        </CodeBlock>

        <Callout tone="note" title="Heading always renders an h1, and cannot be told not to">
          <p>
            That is right in the product — one heading per screen — but it means
            a documentation page cannot show the component without putting a
            second <Mono>h1</Mono> into its own markup. The specimen above is
            therefore marked <Mono>aria-hidden</Mono>: assistive technology sees
            one heading on this page, the correct one, and the specimen’s words
            are written out beside it instead.
          </p>
          <p>
            The element is still in the DOM, so an automated checker counting{' '}
            <Mono>h1</Mono> tags will report two. Fixing it properly means giving{' '}
            <Mono>Heading</Mono> an <Mono>as</Mono> prop — a change to the app,
            not to this site, and not one to make for the documentation’s
            convenience.
          </p>
        </Callout>

        <Callout tone="note" title="size is required, deliberately">
          <p>
            <Mono>Heading</Mono> has no default size. Each frame specifies its
            own wordmark size, and a default is exactly how one screen’s size
            leaks into another. The login screen does not use this component at
            all — its wordmark scales with viewport width on its own reference
            canvas, so the two can never affect each other.
          </p>
        </Callout>
      </Section>

      <Section title="The two faces">
        <Prose>
          Corben Bold is the voice — every heading, button and row label. DM Sans
          Medium carries the quiet text. Both are self-hosted, so the brand face
          never falls back mid-load and no third-party request is made.
        </Prose>

        <Prose>
          The resolved stack for each style is printed under its specimen above,
          read back from the browser — <Mono>--font-display</Mono> and{' '}
          <Mono>--font-body</Mono> are what those Family rows are reporting.
        </Prose>

        <Callout tone="note" title="Podkova is in both stacks, and is not in Figma">
          <p>
            Corben has no Cyrillic glyphs, so a chore named “Помити посуд” fell
            through to Georgia. Podkova sits directly after the brand face in
            both stacks and is loaded with a Cyrillic-only{' '}
            <Mono>unicode-range</Mono>, so the browser swaps per character: Latin
            keeps rendering in Corben exactly as designed, and the Cyrillic files
            are only fetched when Cyrillic actually renders.
          </p>
          <p>
            It is cap-height and line-box matched to Corben Bold by measurement,
            not by eye. Even so its stem is about 22% of cap height against
            Corben’s 42%, so Cyrillic still reads a little lighter. Closing that
            needs a heavier Cyrillic face, not a CSS value.
          </p>
        </Callout>
      </Section>

      <Section title="Three things the scale admits">
        <DocTable
          caption="Three things the scale admits"
          columns={['Finding', 'Detail']}
          rows={TYPE_FINDINGS.map((row) => [row.finding, row.detail])}
        />
      </Section>

      <Section title="What disagrees">
        <DriftNote
          figmaNode={FOUNDATION_NODES.typography}
          rows={[
            {
              subject: 'Five of nine styles have no tokens',
              figma: (
                <>
                  Nine text styles, including <code>Display/Coin</code> (72/80),{' '}
                  <code>Heading/Hero</code> (40/46) and <code>Label/Wheel</code>{' '}
                  (DM Sans SemiBold 12/16).
                </>
              ),
              code: (
                <>
                  Four complete <code>--type-*</code> groups plus a bare{' '}
                  <code>--type-sheet-title-size</code>. The coin face, the login
                  hero and the wheel labels all set raw values —{' '}
                  <code>Wheel.module.css</code> writes{' '}
                  <code>font-weight: 600; font-size: 12px</code> and drops the
                  16px line entirely.
                </>
              ),
            },
            {
              subject: 'Label/Section line height',
              figma: 'lineHeight 100 — read as 100%, giving a 12px line box.',
              code: (
                <>
                  <code>--type-label-line</code> is 22px. The text nodes measure
                  354×22 for a single line at 12px, so the token follows the
                  measured node rather than the recorded style.
                </>
              ),
              note: 'A deliberate override with a written reason — but the two numbers are far enough apart that a reader comparing them will assume one is a typo.',
            },
            {
              subject: 'Label/Section and Label/Pill',
              figma: 'Two styles, byte-identical: Corben Bold 12, lineHeight 100. Only the caps differ, and the caps come from text-transform rather than the style.',
              code: (
                <>
                  One group, <code>--type-label-*</code>, used for both.
                </>
              ),
            },
            {
              subject: 'Podkova',
              figma: 'Not present. The file knows two families, Corben and DM Sans.',
              code: 'Third in both stacks, with metric overrides measured against Corben Bold.',
            },
          ]}
        />
      </Section>
    </Page>
  )
}
