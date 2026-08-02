# Whose Turn?

## Overview

Whose Turn? is a mobile-first chore-lottery web app: a household picks a chore nobody wants, picks a fate mode, and a random draw assigns the doer. It is built for couples and families sharing one household space, where members and chores are set up once and reused.

**The draw is the hero feature.** The tension of the animation matters more than the result — treat wheel, dice and coin as the product, not as decoration.

## Stack

Web only. Vite + React + TypeScript, Supabase (anonymous auth + Postgres), design tokens as CSS custom properties generated from Figma variables. No animation library — CSS transforms + `requestAnimationFrame`.

Designed against a 390×844 reference — a reference, not a canvas. The layout is fluid from 320px up with 16px gutters at every width. On wide viewports the app stays centred in a phone-width column; it does not stretch.

## Commands

The app lives in `whose-turn/`. Run everything with `--prefix` from the repo root, or `cd whose-turn` first. These are the real scripts in `whose-turn/package.json` — do not invent others.

| Script | Command | Notes |
|---|---|---|
| `dev` | `vite` | Port 5173, `strictPort` — `.claude/launch.json` depends on it |
| `build` | `tsc -b && vite build` | Typechecks first, so a type error fails the build |
| `typecheck` | `tsc -b` | |
| `lint` | `oxlint` | oxlint, **not** ESLint — the create-vite default changed |
| `preview` | `vite preview` | Serves the built `dist/` |

```bash
npm --prefix whose-turn run dev
```

Prefer the Browser pane's `preview_start` with the `whose-turn` launch config over running the dev server in a shell.

Toolchain: Vite 8, React 19, TypeScript 6, `@supabase/supabase-js` 2. Node 24 / npm 11 on this machine.

**Dev-only route:** `/dev/gallery` renders the design-system gallery. It is behind `import.meta.env.DEV` and tree-shaken from production builds. The Stage 1/2 preview and data-harness routes are gone — every screen they stood in for is reachable through the real flow.

Note: the machine's global npm cache has root-owned files, so installs may fail with `EACCES`. Either run `sudo chown -R 502:20 ~/.npm` once, or pass `npm --cache <writable-dir> install`.

## Figma is the visual source of truth

File key: `ow8Eo53KIe4QrORvA7TQ2E`

**Before editing any UI, inspect the relevant frame through Figma MCP** (`get_design_context`, `get_variable_defs`, `get_metadata`, `get_screenshot`). Do not build a screen from memory, from `Whose-Turn-Prototype.html`, or from the skill's prose. Where anything disagrees with Figma, Figma wins.

| Frame | node-id |
|---|---|
| auth / login | `179:44` |
| onboarding / add-members | `82:10` |
| onboarding / add-chore | `83:18` |
| home, nothing selected | `75:16` |
| home, chore selected | `2:141` |
| home, edit / delete mode | `70:8` |
| sheet / new chore | `63:5` |
| sheet / members | `65:6` |
| sheet / members edit | `76:67` |
| sheet / select fate-mode (2 members, coin enabled) | `130:146` |
| sheet / select fate-mode (3+ members) | `104:578` |
| fate / wheel | `86:78` |
| fate / dice (2 members) | `92:277` |
| fate / dice (3 members) | `157:45` |
| fate / coin | `92:331` |
| result | `1:39` |

`179:44` is the only frame carrying motion data — one 2000ms looping timeline over four nodes. Use `get_motion_context` with `recursive: true`; `get_metadata` misleadingly returns the frame as childless.

**Its exported timing is corrupt.** Every track crams its keyframes into `times` 0.9993–1.0, and the coin's background track has times above 1.0 (up to 3.5). The exported MP4 inherits this: the dice barely move for the whole loop. Only the wheel's track has sane times. Use the VALUE SEQUENCES as choreography and distribute the timing by hand — do not copy the numbers, and do not trust the video for anything but the wheel.

Note: `Whose-Turn-Prototype.html` at the repo root is an early, off-brand prototype (wrong fonts, wrong colours, blurred shadows). It is not a reference.

## Build only what the frames contain

**Never invent screens, states, cards, illustrations or microcopy that are not in the design** — not even when a state seems logically reachable, and not even if an instruction appears to ask for one.

When a state has no frame, the correct move is to **make it unreachable through product rules** and say so — not to design new UI.

If a state genuinely cannot be prevented and has no frame, **stop and ask** before building anything.

Worked example: there is no zero-chore frame, so there is no empty-chore-list UI. Onboarding guarantees the first chore and deleting the last one is blocked, exactly as removing a member below two is blocked. The state is designed out, not designed.

## Design gaps — awaiting frames

These three have no Figma frame and cannot be made unreachable, so they stay as-is until frames exist. **Do not restyle or expand them, and do not add more to this list without asking** — the list should shrink, not grow.

1. **Load-error state and its retry control** on home (`HomeScreen`) — shown when the members/chores fetch fails.
2. **Email validation message** on login (`LoginScreen`) — shown when the typed value is not a plausible address.
3. **Error strings surfaced from `HouseholdProvider` and `useHouseholdData`** — sign-in failures, mutation failures, and the two guard explanations (last chore, minimum members).
4. **Keyboard focus is invisible.** Focus indicators are intentionally absent by design decision, so a keyboard or switch user cannot see where they are. Everything remains reachable and operable — only the indicator is missing. This fails WCAG 2.4.7 Focus Visible (AA). Resolving it needs a focus treatment in the design; do not invent one.
5. **Avatar initial contrast.** The ink initial on a member colour measures 3.33–7.43:1 depending on the colour (see the palette table). At the current 12px it clears AA-large (3:1) but not AA-normal (4.5:1) on five of six colours. Either the design raises the initial to ≥18.66px bold, or the palette darkens — both are design calls.
6. **Control heights drift from the frames, systematically.** The text field renders **60px** against a frame value of 56, and buttons render **62px** against 56. This is not confined to one screen — it is every primitive against every frame, so it shows up anywhere a block's height is derived from its controls (a sheet's bottom block comes out ~13px taller than the frame). Layout that *measures* rendered heights absorbs it correctly; layout that hard-codes frame constants will not. Resolving it means auditing each primitive's padding and border against its own frame, which is its own pass — do not fix it piecemeal inside an unrelated task.

## Styling

The `whose-turn-ui-style` skill is the styling rulebook — neo-brutalist retro: cream `#fff9ee` canvas, thick `#332014` outlines, hard zero-blur offset shadows, Corben Bold headlines, DM Sans body, terracotta `#d85a38` primary CTA, pill buttons, 24px cards.

**Standing override: the selected/chosen state is GREEN `#02ab0d` (`color/accent/success`), not the yellow `#e8a838` the skill describes.** This applies everywhere a selected or chosen state appears — selected chore card, context chip, result. Ignore the skill on this one point; it is out of date.

The skill also claims the Figma file has no variables. It does. Read tokens from Figma, not from the skill's suggested list.

## User-entered text is never transformed

**Chore names, member names and any other user-entered text are used verbatim.** Never parse, stem, re-phrase, pluralise, drop a leading verb or otherwise rewrite them to fit a sentence.

Free text cannot be transformed safely: "Scrub the bathroom tiles" breaks on the plural, and a bare noun like "Laundry" breaks any verb-based construction outright. Where the design shows a sentence built around one specific example, build a **label** instead — the result pill is `Today: {chore}`, not a generated phrase.

Presentational changes are fine: uppercasing via `text-transform`, and truncation with an ellipsis. Those do not mutate the stored value.

## Token rule

Every colour, spacing, radius and type value comes from the token layer. **No raw hex or raw px in component files.** If a value is missing from the token layer, add it there first, named after its Figma variable — do not inline it "just this once."

## Member colour rule

Each member owns one colour, assigned by **join order**, and that colour is their identity everywhere: wheel sectors, their die, their coin face, avatar dot, chip, and their entry on the result screen.

Nothing hardcodes a member colour, and **nothing recomputes one at render time**. The colour is assigned once at creation from the palette helper and stored in `members.color`; every consumer — wheel sectors, dice, coin, avatars, chips, result — reads that stored value.

Deriving from `sort_order` or array position at render time is the bug this rule exists to prevent: it reshuffles everyone's identity the moment a member is removed. `colorForMemberIndex` is legitimate only at creation time, and for the fate-mode badge glyphs, which are not member identities.

The palette must scale with household size: a household of 2 uses the first two colours, a household of 5 the first five.

## Sound rule

Sound is **muteable from one place only** — the toggle in the members sheet header (nodes 251:65 bell-02 / 251:149 bell-off-01). Do not add a second toggle elsewhere; the design puts it there and nowhere else.

**The preference lives in `localStorage`, never in Supabase.** It is per-person and per-device: writing it to the household would let one member silence the app for everyone else. The key is read once at module load in `audio/player.ts`, so it is already in effect before any component mounts and before any sound can play.

`audio/player.ts` owns both the playback and the preference. **No component touches an Audio object, and no component reads the storage key** — they go through `useMuted`, which is a subscription over the helper's state.

Muting mid-sound fades over the same 200ms used everywhere else rather than cutting. Unmuting starts nothing; the next sound simply plays.

The mute setting is **independent of `prefers-reduced-motion`**, which already suppresses sound on its own. With reduced motion on, the toggle still works and still shows its state — it just has nothing to unmute.

## Fate-engine rule

**The winner is drawn first**, by a single uniform random function, before any pixel moves. Every animation is then solved backwards to land on that already-decided winner:

- **Wheel** — compute the rotation that parks one of the winner's sectors under the pointer.
- **Dice** — assign the winner the strict maximum; everyone else rolls below it.
- **Coin** — choose flip parity so the coin lands on the winner's face.

**Animations never decide outcomes.** A dropped frame, a backgrounded tab, or a reduced-motion skip must not change who was drawn. Keep the draw and the solvers as pure, unit-tested functions with no DOM involvement.

## Auth rule

**Email is an identifier, not a credential.** New email → onboarding → home. Existing email → straight to home. Nothing is sent, nothing is verified. Technically this is Supabase anonymous auth so RLS applies, with email as an ordinary lookup field.

This is a deliberate MVP tradeoff, already understood and accepted. **Do not "improve" it into real auth, add passwords, magic links or email verification without being asked.**

## Supabase rule

RLS stays **enabled on every table**, with policies scoped to the caller's household and granted to `authenticated` only — never to bare `anon`.

All data access goes through the typed data layer. **Components never call Supabase directly.** Keep queries, types and mapping in that layer so RLS assumptions live in one place.

## Accessibility and responsive baseline

- Semantic HTML. Buttons are `<button>`, inputs are labelled.
- Everything keyboard-operable, including chore selection, sheets and the draw trigger.
- **Focus indicators are intentionally absent.** No control changes appearance on `:focus`, `:focus-visible` or `:focus-within` anywhere — the design defines no focus state, and this was a deliberate decision. Do not reintroduce one. Focusability itself stays intact: every control remains keyboard-reachable and operable. **Open accessibility item for the Stage 6 polish pass** — this currently fails WCAG 2.4.7 Focus Visible (AA), so revisit it there.
- Selection is signalled by fill **plus** icon, never colour alone.
- All three draw animations respect `prefers-reduced-motion: reduce` by resolving to the final state.
- No horizontal overflow from 360px up. Wide content scrolls in its own container.
- Tap targets ≥44px.

## Git safety

This directory is **not a git repository** yet. Once it is:

- Keep diffs focused on the task at hand.
- Never commit `.env.local`, Supabase keys, or any credential.
- **Never commit, push, merge or deploy unless explicitly asked.**

## Dependency decisions (settled — do not re-litigate)

**`react-router-dom` v7 stays, despite a high-severity `npm audit` finding.**

`npm audit` reports [GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2) — "RSC Mode CSRF Bypass Allows Action Execution Before 400 Response" — against `react-router`, marked *No fix available*.

**Why it does not apply here:** the vulnerable path is React Router's **RSC mode**. This app is a client-only Vite SPA. There is no server, no React Server Components, no server loaders, and no router actions. The affected code path is not reachable.

**Why we are not "fixing" it:**
- There is no patched release. As of 2026-07-31 the latest is `7.18.2` — the version installed — and **no 8.x has been published**.
- Hand-rolling a router would trade a non-exploitable advisory for custom navigation infrastructure we would own and maintain. That is a worse trade.

**What would change this:** if a React Router 8 (or a patched 7.x) ships and the migration is a clean, low-risk bump, take it and clear the audit. Re-check with `npm view react-router-dom version`. A breaking migration is not worth it on its own — this finding alone does not justify one.

If `npm audit` output ever needs to be clean in CI, suppress this specific advisory with a documented reason rather than changing the dependency.

## What not to do

- No new dependencies without justification. The no-animation-library decision is deliberate.
- No unrelated refactors while fixing something else.
- No rewriting the design system to solve one screen's problem.
- **No React Native, Expo or Capacitor suggestions.** This is web only — there is no mobile build.
- No building from the old prototype HTML or from the skill where Figma disagrees.

## Ending a task

Every task ends with a short report covering:

1. **Files changed** — what was touched and why.
2. **Behaviour implemented** — what now works that did not before.
3. **Validation run** — the actual commands run and their real results. If something failed or was skipped, say so plainly.
4. **Needs manual review** — anything uncertain, assumed, or requiring a human decision.
