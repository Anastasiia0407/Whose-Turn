# Whose Turn?

A mobile-first chore-lottery web app for couples and families. Nobody wants to
do the dishes, so you stop arguing and let fate decide: pick the chore, pick a
fate mode — wheel, dice or coin — and a random draw assigns the doer.

The draw is the point. The tension of the animation matters more than the
result.

## Running it

The app lives in `whose-turn/`.

```bash
npm --prefix whose-turn install
```

```bash
npm --prefix whose-turn run dev
```

| Script | What it does |
|---|---|
| `dev` | Vite dev server on port 5173 (`strictPort`) |
| `build` | Typechecks, then builds to `dist/` |
| `typecheck` | `tsc -b` |
| `lint` | `oxlint` — note: oxlint, not ESLint |
| `test` | `vitest run` — unit tests for the fate engine |
| `preview` | Serves the built `dist/` |

Stack: Vite + React + TypeScript, Supabase (anonymous auth + Postgres), design
tokens as CSS custom properties generated from Figma variables. No animation
library — CSS transforms and `requestAnimationFrame`.

Designed at a 390×844 reference and fluid from 320px up. On wide viewports the
app stays in a centred phone-width column rather than stretching.

## Environment

Copy `whose-turn/.env.example` to `whose-turn/.env.local` and fill both in:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

Both are safe in a browser bundle — the publishable key grants nothing on its
own, because row-level security denies everything without a session.
`.env.local` is gitignored and must never be committed.

## Deploying to Vercel

The app is a subdirectory of this repo, so the project's **Root Directory must be
`whose-turn`** — everything else is auto-detected from `whose-turn/vercel.json`
(Vite, `npm run build`, `dist`).

Two environment variables are required **at build time**. Vite inlines `VITE_*`
values into the bundle when it builds, so adding them after a deploy has no
effect — they must exist before the build, and changing them needs a redeploy.

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

`vercel.json` also rewrites all non-asset paths to `index.html`, which client-side
routing needs — without it a direct hit on `/login` or `/fate/wheel` 404s.

## The auth tradeoff — read this

**Email is an identifier, not a credential.** You type an email on the login
screen and you are in. Nothing is sent, nothing is verified, there is no
password.

Technically this is Supabase **anonymous auth**, so every request carries a JWT
and RLS policies apply. The email is written into the session's user metadata
and the policies scope every row to the matching household.

What that buys: data cannot leak between households, and the anon key alone —
with no session — reaches nothing.

What it does **not** buy: anyone who types a known email reaches that
household's data. `user_metadata` is writable by the session that owns it, so
the policies are **leak prevention, not a security boundary**.

This is a deliberate MVP decision, not an oversight. Making it real auth is a
product call — passwords, magic links or a household join code — and should not
be "fixed" in passing.

## How a draw works

The winner is picked **first**, by one uniform random draw over the household's
members. Every animation is then solved backwards so it lands on that
already-decided winner:

- **Wheel** — compute the rotation that parks one of the winner's sectors under
  the pointer.
- **Dice** — give the winner the strict maximum; everyone else rolls below it.
- **Coin** — choose the flip parity so the coin lands on the winner's face.

Animations never decide outcomes. A dropped frame, a backgrounded tab or a
reduced-motion skip cannot change who was drawn. The engine
(`src/fate/engine.ts`) is pure and unit-tested with an injectable RNG.

## Notes

- Focus indicators are intentionally absent by design decision. See the design
  gaps section in `CLAUDE.md`.
- `Whose-Turn-Prototype.html` at the repo root is an early, off-brand prototype.
  It is not a reference.
