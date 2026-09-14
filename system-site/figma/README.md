# Figma sync

Keeps the design file and the code honest about each other. It **reports**; it
never edits either side.

## What is automated, and what is not

| Step | Automated? |
|---|---|
| Read Figma variables | **No.** Needs a human with Figma MCP. See below. |
| Turn a sweep into a snapshot | Yes — `figma:capture` |
| Diff snapshot against code | Yes — `figma:diff` |
| Fail a PR on drift | Yes — `figma:check`, wired to CI |
| Refresh the snapshot on a schedule | **No.** The weekly job opens an issue asking a human to do it. |
| Publish Code Connect to Dev Mode | **No.** Not entitled. |

### Why the capture is not automated

Two entitlement checks, both run against this account:

- **Variables REST API** — `GET /v1/files/:key/variables/local` is Enterprise-only.
  `whoami` reports this account on **pro** and **student** tiers. There is no
  token in this environment to make an authenticated call with, so the finding
  rests on the plan tier rather than on a 403 from that endpoint specifically.
- **Code Connect** — asked directly, and refused:
  *"You need a Dev or Full seat on an Organization or Enterprise plan to use
  Code Connect."*

Figma MCP is an **agent** tool. A Node script cannot call it. So the capture is a
human-run step, and `figma-capture.mjs` takes its output rather than fetching it.

## Refreshing the snapshot

1. With Figma MCP available, run `get_variable_defs` for each node in the sweep
   list below. Use the **remote** server (it takes a `fileKey`); the local one
   follows whichever file the desktop app has open.
2. Save the responses verbatim as `capture/<date>-mcp.json`, in the shape of
   `capture/2026-08-12-mcp.json`.
3. ```bash
   npm --prefix system-site run figma:capture -- --from-mcp <date>-mcp.json
   ```
4. ```bash
   npm --prefix system-site run figma:diff
   ```
5. Open a PR with the new snapshot. Decide what to do about anything under
   **DRIFTED** — the script will not decide for you.

### The sweep list

Coverage is **binding-driven**: `get_variable_defs` returns only variables bound
somewhere in the queried subtree. These nodes between them reach every variable
currently known. Sweeping fewer will silently shrink the snapshot.

| Node | Why it is in the list |
|---|---|
| `323:23` | Components page — the bulk of the set |
| `357:315` | Foundations page |
| `179:44` | login — the only source of `font/size/hero` and `spacing/5xl` |
| `157:45` | dice, 3 members — the only source of `color/member/3` |
| `92:331` | coin — the only source of `font/size/coin`, `font/line/coin` |
| `82:10` | onboarding — the only source of `color/track/*` |
| `1:39` | result — `color/brown/800` |
| `70:8` | home edit mode — `color/accent/destructive` |
| `86:78` | wheel — `Label/Wheel`, `font/style/body-strong` |
| `104:578` | fate-mode sheet — `Heading/Sheet`, `spacing/sheet-top` |
| `340:35` | HomeIndicator |
| `345:99` | CoinFace |

Nineteen variables that the Foundations frames document are bound to **nothing**,
so no sweep can read a value for them. They are listed under `documentedOnly` in
the snapshot and reported as `UNVERIFIABLE`. That is a limit of the method, not a
claim they do not exist.

## Files

| File | What it is |
|---|---|
| `capture/*.json` | Raw MCP responses, verbatim. Evidence. |
| `tokens.snapshot.json` | Generated. The Figma side of the token layer. |
| `components.snapshot.json` | The Figma component set and its variant axes. |
| `name-map.json` | Authored. Which code token a Figma variable corresponds to. |
| `accepted-drift.json` | Authored. Differences that have been decided, with reasons. |

`../src/mappings/*.figma.tsx` are the Figma↔code component mappings, written in
Code Connect's shape against a local shim. If the plan is ever upgraded, swap the
shim import for `@figma/code-connect` and run `figma connect publish`.

## Commands

```bash
npm --prefix system-site run figma:diff       # the readable token report
npm --prefix system-site run figma:coverage   # the component table
npm --prefix system-site run figma:check      # the CI gate; exits 1 on drift
```
