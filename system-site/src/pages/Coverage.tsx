import { allEntries, type Connection } from '../mappings'
import { Callout, DocTable, Mono, Page, Prose, Section } from '../docs'
import { figmaUrl } from '../figma'
import styles from './Coverage.module.css'

/**
 * The Figma ↔ code inventory, rendered from the mapping files.
 *
 * Nothing on this page is typed out. Importing `../mappings` runs every
 * `.figma.tsx` file, each of which registers itself through the Code Connect
 * shim; this page reads that registry. CI reads the same files through the
 * TypeScript compiler API and fails if a mapping has gone stale.
 *
 * It is an inventory, not a scoreboard. "14 of 18 connected" is not a number to
 * push towards 18 — six of the gaps are deliberate, and closing them would mean
 * building components the product does not want.
 */
export function Coverage() {
  const entries = allEntries()
  const connected = entries.filter((e): e is Connection => e.kind === 'connected')
  const designOnly = entries.filter((e) => e.kind === 'design-only')
  const codeOnly = entries.filter((e) => e.kind === 'code-only')

  return (
    <Page
      title="Figma ↔ code"
      lede="What is connected, what exists only in the design file, and what exists only in the code. Generated from the mapping files in system-site/src/mappings — if a component is missing here, it is missing there."
    >
      <Section title="How this is kept true">
        <Prose>
          Each row below comes from a <Mono>.figma.tsx</Mono> mapping file
          written in Code Connect’s own shape. They are not published to Figma —
          that needs a Dev or Full seat on an Organization or Enterprise plan,
          and this file is on a pro plan — so the files are the repo’s source of
          truth instead, and a check in CI fails when one of them stops matching
          reality.
        </Prose>

        <Callout tone="note" title="What CI enforces on these mappings">
          <p>
            A mapping pointing at a Figma node that no longer exists, at a module
            that no longer exists, or at an export that has been renamed, fails
            the build. So does a Figma component with no mapping at all, and a
            variant axis that gains a value nothing maps.
          </p>
        </Callout>
      </Section>

      <Section title={`Connected — ${connected.length}`}>
        <DocTable
          caption="Figma component to React component"
          columns={['Figma', 'Node', 'Code', 'Variant axes']}
          rows={connected.map((entry) => [
            <span key="f" className={styles.name}>
              {entry.figmaName}
              {entry.note ? <span className={styles.note}>{entry.note}</span> : null}
            </span>,
            <a
              key="n"
              href={figmaUrl(entry.nodeId)}
              target="_blank"
              rel="noreferrer noopener"
              className={styles.node}
            >
              {entry.nodeId}
            </a>,
            <span key="c">
              <Mono>{entry.codeName}</Mono>
              <span className={styles.source}>{entry.codeSource}</span>
            </span>,
            <span key="a" className={styles.axes}>
              {Object.values(entry.props).filter((p) => p.options.length > 0).length === 0 ? (
                <span className={styles.none}>none</span>
              ) : (
                Object.values(entry.props)
                  .filter((p) => p.options.length > 0)
                  .map((p) => (
                    <span key={p.figmaProp} className={styles.axis}>
                      <strong>{p.figmaProp}</strong> {p.options.join(' · ')}
                    </span>
                  ))
              )}
            </span>,
          ])}
        />
      </Section>

      <Section title={`In Figma only — ${designOnly.length}`}>
        <Prose>
          Published in the design file and deliberately not built. Each has a
          reason, and the reason is the point — without it, the next person to
          read the file will assume something is missing.
        </Prose>

        <DocTable
          caption="Design-only components"
          columns={['Figma', 'Node', 'Why there is no code']}
          rows={designOnly.map((entry) => [
            <span key="f" className={styles.name}>
              {entry.kind === 'design-only' ? entry.figmaName : ''}
            </span>,
            entry.kind === 'design-only' && entry.nodeId ? (
              <a
                key="n"
                href={figmaUrl(entry.nodeId)}
                target="_blank"
                rel="noreferrer noopener"
                className={styles.node}
              >
                {entry.nodeId}
              </a>
            ) : (
              <span key="n" className={styles.none}>
                not published
              </span>
            ),
            <span key="r">{entry.kind === 'design-only' ? entry.reason : ''}</span>,
          ])}
        />
      </Section>

      <Section title={`In code only — ${codeOnly.length}`}>
        <Prose>
          Shipping components with no Figma node behind them. Mostly structural —
          the shell, the base surface, the sheets composed from other parts.
        </Prose>

        <DocTable
          caption="Code-only components"
          columns={['Code', 'Source', 'Why there is no Figma component']}
          rows={codeOnly.map((entry) => [
            <Mono key="c">{entry.kind === 'code-only' ? entry.codeName : ''}</Mono>,
            <span key="s" className={styles.source}>
              {entry.kind === 'code-only' ? entry.codeSource : ''}
            </span>,
            <span key="r">{entry.kind === 'code-only' ? entry.reason : ''}</span>,
          ])}
        />
      </Section>
    </Page>
  )
}
