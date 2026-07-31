# Skill: Whose Turn? — Neo-Brutalist Retro UI

## Purpose

This skill helps AI tools generate and implement new UI in the same visual style as the **Whose Turn?** app — a playful chore-lottery product for couples and families.

Use this skill when working in:

- Figma Make
- Claude Code
- Codex
- Cursor
- VS Code AI tools
- Lovable
- Replit
- other AI builders

The goal is to create new screens, components, and flows that look like they belong to this exact product, without drifting into generic SaaS or Material styling.

## Source & Confidence

### Source

Three production Figma frames (390×844, iOS) from file `HtY8Fnx1RwZsSZ4EHslFe6`, extracted via Figma MCP `get_design_context` (reference code + rendered screenshots):

- `206:165` — Home
- `206:201` — Spin (hero wheel)
- `206:141` — Result

Plus the product concept document (`Whose-Turn-Concept.md`).

### Confidence

**High** for colors, typography families, radii, borders, shadows, spacing, and component anatomy — these come from inspectable Figma node code, not screenshots.

**Medium** for icon library, participant color palette beyond the two used, and motion.

### Limitations

- Figma **Variables are not used** for style values (only the status-bar text color is tokenized as `Labels - Vibrant - Controls/Primary #1a1a1a`). Every other value is a raw hex / raw number in the design, so there is no token system to inherit — tokens below are **Suggested**.
- Only a **2-participant** wheel exists in the source, so only 2 of the 6 concept participant colors are confirmed from pixels.
- No hover / pressed / disabled / loading states exist in the frames.
- Icon library is not identified.

## Style DNA Summary

A **neo-brutalist retro** mobile look built on four non-negotiable moves:

1. Warm cream canvas (`#fff9ee`) instead of white.
2. Thick dark-brown outlines (`#332014`, 2–3px) on every card, button, and chip.
3. A **hard offset shadow with zero blur** (`Npx Npx 0 #332014`) that gives every surface a printed "sticker" depth.
4. A massive **slab-serif** headline face (Corben Bold) paired with a humanist sans (DM Sans) for support.

It reads as characterful, bold, and hand-made — closer to a board-game box or a retro arcade card than a clean productivity app. Color is used sparingly and with intent: terracotta for the single primary action, yellow for the "chosen/active" state.

## Design Principles

- **Outline everything, fill selectively.** Every interactive surface carries a 2–3px `#332014` border. Fills stay quiet — white by default; color only marks primary action (terracotta) or the selected item (yellow).
- **Depth comes from hard shadows, never blur.** Elevation is a solid `#332014` block offset down-right (`4px 4px 0` for large surfaces, `2px 2px 0` for small controls). Never use soft/gaussian shadows — they break the style instantly.
- **Two shapes only: soft-rounded cards and full pills.** Content cards use a 24px radius; all real buttons are 100px pills; small square icon buttons use a 10px radius. There is no third radius language.
- **Slab-serif carries personality.** Headlines and even body-in-buttons are set in a heavy slab serif (Corben), not a neutral sans. The slab is the brand voice — keep it on titles, chore names, labels, and button text.
- **Warm, muted palette with one bright accent per screen.** Backgrounds, text, and borders are warm browns and cream; terracotta is the one loud voice. Avoid cool grays, pure black, or bright blue.
- **Physical iOS chrome.** Screens are framed as a real iOS app (44px status-bar slot, 5px home indicator) — keep that framing for fidelity.

## Signature Style Elements

These must survive for the style to stay recognizable:

1. **Hard offset shadow** `4px 4px 0px #332014` (no blur) on cards and CTAs.
2. **Thick `#332014` outline** — 3px on cards/primary buttons, 2px on small controls.
3. **Cream background** `#fff9ee` (never white page background).
4. **Corben Bold slab-serif** headlines with a two-tone title (dark word + terracotta word, e.g. "Whose **Turn?**").
5. **Terracotta pill CTA** `#d85a38` with white Corben text, full 100px radius.
6. **Yellow "chosen" state** `#e8a838` fill + thin check on the selected list item.
7. **The fortune wheel** — ~12 alternating colored segments, white center hub, dark pointer at top, tiny rotated participant labels.
8. **Hand-drawn confetti** illustration on Result — squiggle ribbons + stars + dots in the warm palette plus one teal.
9. **Every button is a full pill**; every content card is a 24px-radius rounded rectangle. No sharp corners anywhere.

## Evidence Map

### Extracted (confirmed from Figma node code)

- Background `#fff9ee` (Home, Spin). Result background `#fdf3e3` (see Style Loss Risks — treat `#fff9ee` as canonical).
- Outline & primary text `#332014`; muted text `#7a685c`; white surfaces `#ffffff`.
- Terracotta `#d85a38`; yellow `#e8a838`.
- Green chip `#02ab0d` (selected-chore nav chip on Spin/Result).
- Home-indicator bar `#1a1818`; status-bar text `#1a1a1a`.
- Fonts: **Corben Bold** (headings/labels/buttons **and the Result winner name**, 48px/56lh `#2c1810`), **DM Sans Medium** (subtitles, `opsz 14`), Inter (status bar 15px + wheel labels 10px `#331f14`). *(The winner name was previously Zilla Slab 52px; it has been switched to Corben — the app now uses a single slab-serif brand face.)*
- Title 30px / 40px line-height; body 16px / 24px; label 12px; winner 48px / 56px line-height.
- Borders: 3px on chore cards / primary CTAs / secondary CTA; 2px on 44px icon buttons, nav chips, back button, Result chip.
- Shadows: `4px 4px 0px #332014` (cards, CTAs); `2px 2px 0px #332014` (small controls).
- Radii: cards 24px; buttons/pills 100px; square icon button 10px; nav chip 24px; home indicator 10px.
- Spacing: screen `px-16 pb-40`, section gap 24px, list gap 16px, title gap 4px, label→list gap 8px. Chore card h-56, `pl-24 pr-20 py-14`, inner gap 14. CTA `py-16`. Members button 44×44. Wheel 350px, hub 58px, pointer 40px.
- Frame 390×844; status bar rendered but `opacity-0`.
- Two-tone titles (dark + terracotta span).

### Inferred (from repeated visual patterns / screenshots)

- Icons are **thin-stroke line icons** (check, plus, chevron, profiles) — outline, not filled.
- Wheel uses two alternating segment colors (terracotta + yellow) for the 2-person prototype.
- Labels like "WHO'S DOING IT TODAY?" render **uppercase** (Corben Bold 12px, muted).
- The list uses a single "one selected, rest default" selection model.

### Suggested (recommended for reuse, not confirmed in these 3 screens)

- Full 6-participant palette from the concept doc: `#d85a38` terracotta, `#e8a838` yellow, `#6b8e5a` olive, `#3d8a8a` teal, `#c96b86` powder-pink, `#9b6a3f` caramel — each with the `#332014` outline. Assign in order as members are added.
- Token naming (`--color-bg`, `--border-ink`, `--accent-primary`, `--accent-chosen`, `--shadow-hard`) — none exist in the file yet.
- Missing states (hover/pressed/disabled/loading) — see Component rules.

### Unresolved

- Exact icon library / icon set name.
- Motion timing for the wheel spin (concept calls for physics-based rotation; no keyframes in file).
- Why Result uses `#fdf3e3` vs `#fff9ee` elsewhere, and why the "chosen chore" chip is green `#02ab0d` on Spin/Result but the chosen chore is yellow on Home.
- Responsive behavior beyond the single 390px iPhone width.

## Visual Foundations

### Color System

| Role | HEX | Usage |
|---|---|---|
| Canvas / background | `#fff9ee` | Page background on every screen (canonical). |
| Ink — outline & primary text | `#332014` | All borders, all shadows, headings, body-on-light. |
| Muted text | `#7a685c` | Subtitles, small labels, helper copy. |
| Accent — primary | `#d85a38` | The one primary CTA per screen; title accent word. |
| Accent — chosen/active | `#e8a838` | Selected list item fill; members button fill (Home). |
| Surface — card/button | `#ffffff` | Default card + secondary button fill. |
| Success/active chip | `#02ab0d` | "Selected chore" nav chip (Spin/Result). Use sparingly. |
| Winner name | `#2c1810` | Result hero name (near-identical to ink). |
| Home indicator | `#1a1818` | iOS home bar. |

Contrast behavior: dark ink text sits on cream, white, or yellow — all high-contrast. White text is used **only** on the terracotta CTA. Do not put muted `#7a685c` on colored fills.

### Typography System

- **Corben Bold** — headings, chore names, all button text, labels, nav chips, **and the oversized Result winner name (48px)**. This is the single brand face; keep it heavy and slab. There is no separate display font.
- **DM Sans Medium** — subtitles and helper text only (`fontVariationSettings: "opsz" 14`).
- **Inter** — utility only (status bar 15px semibold; wheel segment labels 10px bold). Not a content face.

Scale (confirmed): 48px/56lh winner (Corben) · 30px/40lh title (Corben) · 16px/24lh body & buttons · 12px labels/chips · 10px wheel labels.

Titles are two-tone: main phrase in `#332014`, one emphasis word in `#d85a38`.

### Spacing & Layout Rhythm

Base rhythm is a 4px grid expressed mostly as **24 / 16 / 8 / 4**. Screen inset is 16px horizontal, 40px bottom. Vertical section gap 24px; list item gap 16px; title-block gap 4px. Cards are 56px tall with generous internal padding (`24 / 20 / 14`). Density is **comfortable, not compact** — big tap targets, roomy pills.

### Radius, Borders & Dividers

- Corners: cards 24px; pills/buttons 100px; square icon buttons 10px.
- Borders: solid `#332014`, 3px on large surfaces (cards, primary/secondary CTAs), 2px on small controls (chips, 44px icon buttons).
- No dividers/hairlines — separation comes from the card outlines + gaps, never from thin rules.

### Shadows & Elevation

One elevation language: a **hard, un-blurred** `#332014` block offset down-right.

- Large surfaces (cards, CTAs): `drop-shadow(4px 4px 0px #332014)`.
- Small controls (chips, 44px buttons, back button): `drop-shadow(2px 2px 0px #332014)`.

The UI is flat + sticker-layered, never glassy or softly floating.

### Iconography

Thin-stroke **line icons** (check, plus, chevron-left, profiles-check), sized 20–24px, `#332014`, paired to the left of or beside labels. *(Inferred — exact library Unresolved.)* Match this outline weight; do not introduce filled or duotone icons.

### Illustration / Imagery Style

Result screen uses a **hand-drawn celebration graphic**: wavy ribbon squiggles, five-point stars, and dots scattered in terracotta, yellow, teal, and dark brown. Loose, playful, marker-like line quality. Any new illustration should match this warm, hand-made, confetti energy — not flat vector gradients.

## Layout System

- Single-column, full-width mobile screens inside a 390px iPhone frame.
- Structure: (hidden) status bar → header/nav row → title block → main content (flex-grow, centered) → bottom CTA(s) → home indicator.
- Primary CTA is pinned toward the bottom, full-width pill.
- Header carries either a title + icon button (Home) or back button + context chip (Spin/Result).
- Content area centers its hero (wheel, winner name, confetti).

Do not invent breakpoints — only the 390px width is confirmed.

## Component Style Rules

### Primary CTA (e.g. "Let fate decide", "Spin the wheel", "I accept my fate")

- **Visual:** terracotta `#d85a38` fill, white Corben Bold 16px centered text, 3px `#332014` border, 100px radius, `4px 4px 0` shadow, `py-16`, full width.
- **States:** only default exists. *Suggested:* pressed → nudge translate `2px 2px` and shrink shadow to `2px 2px 0` (sticker "press"); disabled → muted fill + no shadow.
- **Behavior:** one primary per screen.

### Secondary CTA (e.g. "＋ Add a new chore")

- White fill, `#332014` Corben text, left line-icon, 3px border, 100px radius, `4px 4px 0` shadow, `py-16`, full width.

### Chore Card

- **Default:** white fill, 2px border, `4px 4px 0` shadow, 24px radius, h-56, Corben 16px text, `pl-24 pr-20 py-14`.
- **Selected:** yellow `#e8a838` fill, **3px** border, trailing thin check icon.
- One selected at a time.

### Members / Icon Button (44×44)

- Square, 10px radius, 2px border, `2px 2px 0` shadow, centered 20–24px line icon. Fill: yellow on Home, white as back button.

### Context Chip ("Wash the dishes ✓")

- Pill (24px radius), 2px border, `2px 2px 0` shadow, Corben 12px + trailing check. Currently green `#02ab0d` on Spin/Result. *Suggested:* align this to yellow `#e8a838` for palette consistency (see risks).

### Fortune Wheel

- 350px circle, ~12 alternating colored segments (one color per participant, repeated around the ring), thin dark segment separators, white 58px center hub, dark triangular pointer at 12 o'clock, tiny Inter-bold participant labels rotated along each segment.
- Segment count stays ~12 regardless of member count (participants repeat around the ring).
- **Behavior:** tap Spin → physics-based deceleration to a random segment (motion Unresolved — implement easing that overshoots then settles).

### Result Winner Block

- Oversized **Corben Bold** name (48px / 56lh, `#2c1810`), a white pill chip below ("does the dishes today", 2px border, `2px 2px 0` shadow), confetti graphic above.

## Interaction & Behavior Patterns

- **Primary action:** single terracotta pill, bottom of screen.
- **Selection:** exactly one chore highlighted (yellow fill + check); tapping another moves the highlight.
- **Navigation:** back = white square icon button top-left; current context shown as a chip top-right.
- **The hero moment is the spin** — build tension via slow-down + settle; result reveal should feel earned. Concept forbids re-spin ("You can't re-spin fate").
- Empty/loading/error states are **not defined** — design them in-style (outlined card + Corben copy + hard shadow) rather than importing a generic pattern.

## Content & Microcopy Style

Voice = a cheerful lottery host: short, playful, a little dramatic. English, sentence case for copy, UPPERCASE for the small section label. Examples from the product: "Settle chore disputes fairly!", "WHO'S DOING IT TODAY?", "Let fate decide", "Wherever the wheel stops — that is fate!", "Fate Has Chosen → Maks", "I accept my fate", "You can't re-spin fate — that's fair". Keep CTAs verby and fate-themed.

## Accessibility Rules

- Dark ink `#332014` on cream/white/yellow is high-contrast — keep it. White text only on terracotta.
- Selection is signaled by **fill + check icon**, not color alone — preserve the icon so state isn't color-dependent.
- Keep tap targets ≥44px (matches the existing icon buttons and 56px cards).
- Add visible focus states for keyboard/switch use (missing in source) — reuse the hard-shadow-shift idea as a focus ring in `#332014`.
- Verify the green `#02ab0d` chip and its dark text meet contrast if kept.

## Design-to-Code Mapping

Suggested (nothing is tokenized in the file yet):

- **Tokens:** `--color-bg #fff9ee`, `--color-ink #332014`, `--color-muted #7a685c`, `--color-surface #ffffff`, `--accent-primary #d85a38`, `--accent-chosen #e8a838`, plus a `--participant-1..6` scale.
- **Shadow tokens:** `--shadow-hard-lg: 4px 4px 0 var(--color-ink)`, `--shadow-hard-sm: 2px 2px 0 var(--color-ink)`.
- **Radius tokens:** `--radius-card: 24px`, `--radius-pill: 100px`, `--radius-icon: 10px`.
- **Border tokens:** `--border-lg: 3px`, `--border-sm: 2px`, both `solid var(--color-ink)`.
- **Reusable components:** `Button` (variant: primary/secondary), `ChoreCard` (state: default/selected), `IconButton`, `Chip`, `Wheel`, `WinnerName`. Drive shadow/border/radius from tokens, never hard-code per instance.
- Do **not** hard-code shadow/border/color values inline once tokens exist; do not swap in a component-library default (shadcn/Material) that overrides these.

## Figma Make Usage Rules

Do:

- Keep the cream `#fff9ee` canvas, thick `#332014` outlines, and hard offset shadows on every new surface.
- Reuse the pill-and-card shape language and the 24/16/8 spacing rhythm.
- Set headings and buttons in Corben Bold; subtitles in DM Sans.
- Use terracotta for the single primary action and yellow for chosen/active.
- Include realistic states and the iOS status-bar/home-indicator framing.

Do not:

- Switch to soft/blurred shadows, gradients, or glassmorphism.
- Introduce blue/cool-gray/pure-black or a neutral sans for headings.
- Use filled icons or a new icon language.
- Make it "cleaner" by removing borders or shadows — those *are* the style.
- Compress the comfortable density into a tight dashboard layout.

## Codex / Claude Code / Cursor Usage Rules

Do:

- Inspect the target project first; reuse its stack and styling system.
- Introduce the tokens above and bind border/shadow/radius/color through them.
- Build reusable `Button`, `ChoreCard`, `IconButton`, `Chip`, `Wheel` components with explicit variants and states.
- Implement pressed/disabled/focus/loading in-style (hard-shadow shift, muted fill).
- Keep the wheel logic data-driven (participant count → repeated ~12 segments, per-participant color).

Do not:

- Replace the look with a default UI library theme.
- Hard-code one-off hex/shadow values where a token pattern exists.
- Invent APIs, routes, or data models beyond the concept's `households / members / chores / spins`.
- Drop focus/empty/error/disabled states.

## Style Loss Risks

New UI stops feeling like Whose Turn? if you:

- Use **soft/blurred** shadows instead of the hard `Npx Npx 0 #332014` offset.
- Drop the thick `#332014` outlines, or thin them below 2px.
- Use a **white** page background instead of cream `#fff9ee`.
- Set headings in a neutral sans instead of the Corben slab serif.
- Add blue or bright/cool accents; the accent must be warm terracotta.
- Replace outline icons with filled ones.
- Make corners sharp or use a single medium radius everywhere instead of the card-24 / pill-100 split.

### Known source inconsistencies to normalize

- **Background:** Result uses `#fdf3e3`, other screens `#fff9ee` — standardize on `#fff9ee`.
- **Chosen indicator:** yellow fill on Home vs green `#02ab0d` chip on Spin/Result — pick one language (recommend yellow) for the "selected chore" across screens.

## Do / Don't Style Rules

### Do

- Outline every surface in `#332014`, add the matching hard offset shadow.
- Keep one terracotta primary action per screen.
- Mark selection with yellow fill **plus** a check icon.
- Use Corben for anything that speaks; DM Sans only for quiet support text.
- Frame screens as a real iOS app.

### Don't

- Don't blur shadows, don't gradient-fill buttons, don't glassmorph.
- Don't use pure black, cool grays, or blue.
- Don't remove borders to look "minimal."
- Don't mix in filled/duotone icons.
- Don't tighten density into a compact data UI.

## Missing / Unresolved System Areas

- Icon library name.
- Wheel spin motion spec (duration, easing, overshoot).
- Hover/pressed/disabled/focus/loading/empty/error states.
- Participant colors 3–6 confirmed in-canvas (only from concept doc so far).
- Responsive rules beyond 390px.
- A real token layer (none in the Figma file).

## Recommended Next Source

To raise fidelity, provide any of: a Figma **Variables**/local-styles set (to lock tokens), frames for the **Members** and **New chore** sheets, screenshots of button **states**, a 3–6 person wheel, and the **spin animation** (video or prototype) for motion timing.
