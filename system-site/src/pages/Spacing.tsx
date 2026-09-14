import { DocTable, DriftNote, Mono, Page, Prose, ScaleRow, Section } from '../docs'
import { SPACING, SPACING_EXCEPTIONS, SPACING_LEDE } from '../content/scale'
import { FOUNDATION_NODES } from '../figma'
import styles from './Scale.module.css'

/**
 * Frame 366:271.
 *
 * Every bar is `width: min(var(--spacing-x), 100%)` and every px figure is read
 * back off the same declaration. A reader can put a ruler on the screen and get
 * the token — which is the only test of this page that matters.
 */
export function Spacing() {
  return (
    <Page title="Spacing" figmaNode={FOUNDATION_NODES.spacing} lede={SPACING_LEDE}>
      <Section title="The scale">
        <Prose>
          Drawn at true size. The bar is the token, not a picture of it.
        </Prose>

        <div className={styles.scale}>
          {SPACING.map((entry) =>
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

      <Section title="The two exceptions">
        <DocTable
          caption="The two exceptions"
          columns={['Token', 'Value', 'Why it stays']}
          rows={SPACING_EXCEPTIONS.map((row) => [
            <Mono key="t">{row.token}</Mono>,
            row.value,
            row.why,
          ])}
        />
      </Section>

      <Section title="What disagrees">
        <DriftNote
          figmaNode={FOUNDATION_NODES.spacing}
          rows={[
            {
              subject: 'spacing/5xl',
              figma: '96px — hero top spacing on login, promoted to a named step by decision D-02.',
              code: 'No token. The login hero spaces itself without one.',
              note: 'Eleven of the twelve steps exist in code; this is the twelfth.',
            },
            {
              subject: 'The scale is twelve steps',
              figma: 'Twelve, counting spacing/5xl.',
              code: 'Eleven. And --spacing-sm (6px) is declared but referenced by nothing, so ten are actually load-bearing.',
            },
            {
              subject: 'Provenance comments',
              figma: (
                <>
                  <code>spacing/inline</code> and <code>spacing/sheet-top</code>{' '}
                  are ordinary variables in the file.
                </>
              ),
              code: (
                <>
                  <code>tokens.css</code> still files both under “NOT-IN-FIGMA”.
                  The comment is stale — both were read back from the file.
                </>
              ),
            },
          ]}
        />
      </Section>
    </Page>
  )
}
