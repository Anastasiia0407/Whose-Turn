import { Callout, DocTable, Mono, Page, Prose, Section } from '../docs'
import {
  ACCEPTED_DEBT,
  CONVENTIONS,
  DEBT_NOTE,
  DECISIONS_LEDE,
  DECISION_LOG,
  FOUR_RULES,
} from '../content/decisions'
import { FOUNDATION_NODES } from '../figma'
import styles from './Decisions.module.css'

/**
 * Frame 370:303, transcribed verbatim, plus one section that is not from the
 * frame at all.
 *
 * Nothing on this page is softened. The measurements keep their numbers, the
 * decisions keep their dates, and the failures are described as failures. A
 * page that reads comfortably about ten known WCAG failures would be lying
 * about what it is.
 */
export function Decisions() {
  return (
    <Page
      title="Decisions & Accepted Debt"
      figmaNode={FOUNDATION_NODES.decisions}
      lede={DECISIONS_LEDE}
    >
      <Section title="The decision log">
        <DocTable
          caption="The decision log"
          columns={['#', 'Decision', 'Consequence']}
          rows={DECISION_LOG.map((row) => [
            <Mono key="id">{row.id}</Mono>,
            row.decision,
            row.consequence,
          ])}
        />
      </Section>

      <Section title="Accepted debt — measured, not estimated">
        <Prose>
          Each figure below was measured rather than guessed. Where a page in
          this site can compute the same number, it does — the colour and member
          pages recompute their ratios at runtime, so these can be checked rather
          than trusted.
        </Prose>

        <DocTable
          caption="Accepted debt — measured, not estimated"
          columns={['What', 'Measurement', 'Where it is written']}
          rows={ACCEPTED_DEBT.map((row) => [
            row.what,
            <span key="m" className={styles.measurement}>
              {row.measurement}
            </span>,
            row.where,
          ])}
        />

        <Callout tone="debt" label="Why the debt lives in component descriptions">
          <p>{DEBT_NOTE}</p>
        </Callout>
      </Section>

      <Section title="Conventions the app breaks on purpose">
        <Prose>
          These three are not on the Figma frame. They are decisions recorded in
          the codebase, and each one looks like a defect until you know why it is
          there. Documenting them here is the point: a deliberate break that is
          not written down is indistinguishable from a bug, and the next person
          to find it will “fix” it.
        </Prose>

        {CONVENTIONS.map((convention) => (
          <article key={convention.title} className={styles.convention}>
            <h3 className={styles.conventionTitle}>{convention.title}</h3>

            <dl className={styles.conventionBody}>
              <dt className={styles.term}>What you will notice</dt>
              <dd className={styles.detail}>{convention.looksLike}</dd>

              <dt className={styles.term}>Why</dt>
              <dd className={styles.detail}>{convention.why}</dd>

              <dt className={styles.term}>What it costs</dt>
              <dd className={styles.detail}>{convention.cost}</dd>
            </dl>
          </article>
        ))}

        <Callout tone="debt" title="The focus failure is not theoretical">
          <p>
            <Mono>base.css</Mono> pins <Mono>outline</Mono> to{' '}
            <Mono>0 none transparent</Mono> on every element, and again on{' '}
            <Mono>:focus</Mono>, <Mono>:focus-visible</Mono> and{' '}
            <Mono>:focus-within</Mono> — width and colour as well as style, so
            computed values are byte-identical focused and unfocused. Firefox’s
            inner ring is removed separately. This is thorough on purpose, and
            the thoroughness is what makes it a WCAG 2.4.7 failure rather than an
            oversight.
          </p>
          <p>
            The design file records this as{' '}
            <Mono>focus-visible · never designed · defined in code instead</Mono>
            . That row is wrong in one respect: nothing is defined in code
            either. The Storybook prototype defined a 3px amber ring; the
            shipping app defines nothing.
          </p>
        </Callout>
      </Section>

      <Section title="Four rules that came out of getting it wrong">
        <DocTable
          caption="Four rules that came out of getting it wrong"
          columns={['Rule', 'What prompted it']}
          rows={FOUR_RULES.map((row) => [row.rule, row.prompted])}
        />
      </Section>
    </Page>
  )
}
