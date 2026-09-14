import { Button, MemberAvatar } from '@ds/ui'
import { MEMBER_PALETTE } from '@ds/tokens'
import {
  Callout,
  CodeBlock,
  Do,
  DocTable,
  DoDont,
  Dont,
  Mono,
  Page,
  Prose,
  ResolvedValue,
  ScaleRow,
  Section,
  SubSection,
  TokenSwatch,
  TypeSpecimen,
} from '../docs'
import { fromToken } from '../tokens/color'
import { FOUNDATION_NODES } from '../figma'
import styles from './GettingStarted.module.css'

/**
 * Frame 364:271, "Design Tokens — Start here".
 *
 * The prose, the table captions, the column headers and every cell of the three
 * tables are the words on that frame, transcribed. The one departure is the
 * RESOLVES TO column: instead of reprinting the values written in the frame, it
 * resolves each token against the token layer the site is running on. That
 * makes the column a measurement rather than a claim — and it is why
 * `--color-orange-600` reports itself missing rather than quietly showing the
 * hex the frame expects.
 *
 * "Using the system in a screen" has no frame behind it and is not part of the
 * transcription.
 */
export function GettingStarted() {
  return (
    <Page
      title="Design Tokens — Start here"
      figmaNode={FOUNDATION_NODES['design-tokens']}
      lede="Every colour, space and radius in Whose Turn? comes from a token. The layer is three deep: primitives hold raw values, semantic tokens name a purpose, member tokens carry identity. You reach for the middle shelf almost always."
    >
      <Section title="The three shelves">
        <DocTable
          caption="The three shelves"
          columns={['Shelf', 'Example', 'Use it when', 'Count']}
          rows={[
            [
              'Primitives',
              <Mono key="e">color/orange/600</Mono>,
              'Never, from a component',
              '14',
            ],
            [
              'Semantic',
              <Mono key="e">color/accent/primary</Mono>,
              'Almost always — it names a purpose',
              '20',
            ],
            [
              'Member',
              <Mono key="e">color/member/1…6</Mono>,
              'Anything belonging to a person',
              '6',
            ],
          ]}
        />

        <SubSection title="The shelves, live">
          <div className={styles.swatches}>
            <TokenSwatch
              color={fromToken('--color-brown-800')}
              description="The one primitive the CSS layer names."
            />
            <TokenSwatch
              color={fromToken('--color-accent-primary')}
              alias="color/orange/600"
              description="Primary action fill."
            />
            <TokenSwatch
              color={fromToken('--color-accent-success')}
              alias="color/green/500"
              description="Selected-chore state."
            />
          </div>
        </SubSection>
      </Section>

      <Section title="How a value flows">
        <DocTable
          caption="How a value flows"
          columns={['Figma', 'CSS', 'TypeScript', 'Resolves to']}
          rows={[
            [
              <Mono key="f">color/orange/600</Mono>,
              <Mono key="c">--color-orange-600</Mono>,
              <Mono key="t">color.primitive.orange600</Mono>,
              <span key="r" className={styles.resolves}>
                <ResolvedValue name="--color-orange-600" />
                <span className={styles.qualifier}>primitive</span>
              </span>,
            ],
            [
              <Mono key="f">color/accent/primary</Mono>,
              <Mono key="c">--color-accent-primary</Mono>,
              <Mono key="t">color.accent.primary</Mono>,
              <span key="r" className={styles.resolves}>
                <ResolvedValue name="--color-accent-primary" />
                <span className={styles.qualifier}>→ orange/600</span>
              </span>,
            ],
            [
              <Mono key="f">spacing/xl</Mono>,
              <Mono key="c">--spacing-xl</Mono>,
              <Mono key="t">spacing.xl</Mono>,
              <ResolvedValue key="r" name="--spacing-xl" />,
            ],
          ]}
        />

        <SubSection title="A step and a style, at real size">
          <ScaleRow name="--spacing-xl" description="Screen gutter." />
          <TypeSpecimen group="h1" sample="Whose Turn?" />
        </SubSection>
      </Section>

      <Section title="The one rule">
        <DocTable
          caption="The one rule"
          columns={['Rule', 'Why']}
          rows={[
            [
              'Never reference a primitive from a component',
              'If no semantic token fits, the system is missing one. Add it in Figma first, then in code — never the other way round.',
            ],
          ]}
        />

        <Callout tone="rule" title="No raw hex, no raw px, in any component file">
          <p>
            Every colour, spacing, radius and type value comes from the token
            layer. If a value is missing from it, add it there first, named after
            its Figma variable — do not inline it “just this once”.
          </p>
        </Callout>

        <DoDont>
          <Do caption="A semantic token names the purpose, so the value can change once and move everywhere.">
            <CodeBlock>
              {`.cta {
  background: var(--color-accent-primary);
  padding: var(--spacing-xl);
}`}
            </CodeBlock>
          </Do>
          <Dont caption="A primitive names a hue, and a raw value names nothing. Both pin the component to a number the system cannot revise.">
            <CodeBlock>
              {`.cta {
  background: var(--color-orange-600);
  padding: 16px;
}`}
            </CodeBlock>
          </Dont>
        </DoDont>
      </Section>

      <Section title="Using the system in a screen">
        <Prose>
          The app and this site are two workspaces in one repository, sharing one
          dependency tree. The site imports the app’s modules through the{' '}
          <Mono>@ds</Mono> alias; there is no published package and no build step
          in between, so a component documented here is the same file the product
          ships.
        </Prose>

        <Prose>
          Inside the app, import from the barrel rather than from a component’s
          own file. It is the seam the system is allowed to change behind.
        </Prose>

        <CodeBlock label="In a screen, inside whose-turn/src">
          {`import { Button, MemberAvatar, TextField } from '../ui'
import { MEMBER_PALETTE, colorForMemberIndex } from '../tokens'

<Button variant="primary">Let fate decide</Button>`}
        </CodeBlock>

        <Prose>
          Styling comes from <Mono>tokens.css</Mono>, which is imported once at
          the app’s entry point. Nothing else needs importing to make a component
          look right, and nothing may set a value it does not get from there.
        </Prose>

        <SubSection title="Check your wiring">
          <Prose>
            The controls below are rendered by the app’s own modules, resolved
            through the alias — not by copies kept in this folder. If they lose
            their outlines or their hard shadow, the token layer is not loading;
            if they fail to render at all, the workspace is resolving two copies
            of React.
          </Prose>

          <div className={styles.probe}>
            <Button variant="primary">Let fate decide</Button>
            <div className={styles.avatars}>
              {MEMBER_PALETTE.map((colour, index) => (
                <MemberAvatar
                  key={colour}
                  color={colour}
                  name={`Member ${index + 1}`}
                  size="lg"
                />
              ))}
            </div>
          </div>

          <Callout
            tone="note"
            title="Member colours come from MEMBER_PALETTE, not from CSS"
          >
            <p>
              The six avatars above read <Mono>MEMBER_PALETTE</Mono> from{' '}
              <Mono>@ds/tokens</Mono>. Member identity is the one part of the
              system that lives in TypeScript rather than in{' '}
              <Mono>tokens.css</Mono>, because a member’s colour is stored per
              member and passed in — never recomputed from a position at render
              time.
            </p>
          </Callout>
        </SubSection>
      </Section>
    </Page>
  )
}
