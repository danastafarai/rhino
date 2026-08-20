# Sprint 04 — Interaction: tap-side steering

**Status:** Done
**Branch:** `develop`

---

## Sprint Goal

> Touch steering names a direction, not a destination: hold the left side to go left, the right
> side to go right.

---

## Why this replaces the old model

Sprint 03 gave touch an **absolute** model — the turtle steered toward wherever the finger was.
It worked, but it has two problems on a phone:

1. **Your thumb covers the turtle.** To move the turtle to a spot you must put your finger on
   that spot, which is exactly where you need to see.
2. **You cannot make a small correction.** Nudging left means placing your finger slightly left
   of the turtle, not simply pressing "left".

The two models cannot coexist: a press at 90% of the width is either "go to 90%" or "move
right", never both. This is a **replacement**, not an addition.

---

## Sprint Backlog

| ID       | Item                                               | Est. | Status  |
| -------- | -------------------------------------------------- | ---- | ------- |
| RHINO-19 | Replace drag-to-position with tap-side steering    | M    | ✅ Done |
| RHINO-20 | Visual feedback for the active side                | S    | ✅ Done |
| RHINO-21 | Remove now-dead `Player.moveToward`                | S    | ✅ Done |
| RHINO-22 | Update hints, docs and the mobile regression check | S    | ✅ Done |

---

## What Was Built

### RHINO-19 — Tap-side steering

The decision lives in a new pure function rather than inside `Game`:

```typescript
steerDirectionFromFraction(fraction: number | null): -1 | 0 | 1
```

**Why a separate module:** `Game` is still at 0% coverage. Putting the control policy there
would have shipped the sprint's entire behaviour untested. As a pure function it gets 100%
coverage and five tests, including one asserting the exact centre resolves deterministically.

`InputHandler` was not touched — it already reported a 0–1 fraction, which is a fact about the
input rather than a policy. `Game` now converts fraction → direction once per frame and feeds
the existing `moveLeft`/`moveRight`, so touch inherits delta-scaling and the keyboard speed cap
for free.

**Touch outranks the keyboard.** A press names a direction outright, so a stale held key must
not fight the finger.

**No dead zone at the centre.** A neutral band would create an invisible region where pressing
does nothing — that reads as an unresponsive game, not a designed gap. The split is exactly at
0.5 and every press produces movement.

### RHINO-20 — Feedback for the active side

Tap zones are invisible by nature, so nothing would tell a player the halves exist. While a side
is held it now shows a translucent wash fading inward plus a chevron, drawn **behind** the
entities so it never hides a falling object.

### RHINO-21 — Dead code removed

`Player.moveToward()` existed solely for absolute steering. With that gone it had no callers, so
it and its four tests were removed rather than left as a second unused movement path.

### RHINO-22 — Hints, docs, and the check that would have lied

The on-screen hint read _"Drag anywhere on the board to move the turtle"_ and
`check-mobile.mjs` asserted drag-to-position. Both described the old model and **would have
passed while the new one was broken**, so both were rewritten.

The mobile check now presses and holds a side, and includes a test that discriminates between
the two models:

> `direction follows the side pressed, not the finger position`

With the turtle at 0.25, it presses the left half at x≈0.20. Under the old absolute model the
turtle would have stopped _at_ the finger (~0.20). Under the new one it kept travelling to
**0.02**. A weaker test would pass under both models and prove nothing.

---

## Sprint Review

| Gate      | Command                         | Exit | Result                         |
| --------- | ------------------------------- | ---- | ------------------------------ |
| Typecheck | `npm run typecheck`             | 0    | ✅ clean (src + config)        |
| Lint      | `npm run lint`                  | 0    | ✅ clean, 0 warnings           |
| Format    | `npm run format:check`          | 0    | ✅ all files match             |
| Tests     | `npm run test`                  | 0    | ✅ 62 passed / 62, 6 files     |
| Coverage  | `npm run test:coverage`         | 0    | ✅ `steering.ts` 100%          |
| Build     | `vite build`                    | 0    | ✅ 13.16 kB js                 |
| Mobile    | `npm run test:mobile`           | 0    | ✅ **24/24 checks, 2 devices** |
| Desktop   | Playwright keyboard playthrough | —    | ✅ 260 points, 0 errors        |

Measured on both emulated devices:

| Action          | Turtle position |
| --------------- | --------------- |
| Hold RIGHT side | 0.50 → 0.97     |
| Hold LEFT side  | 0.97 → 0.25     |
| Hold LEFT again | 0.25 → 0.02     |
| Release         | stationary      |

---

## Retrospective

**A bug the tests could not catch.** The first build shipped the left-side chevron pointing
**right** — the arrow told players the opposite of what the control did. All 24 mobile checks
passed, because they assert the turtle's _position_, never what the icon looks like. Only
opening the screenshot caught it.

That is the same lesson as Sprint 03 in a new costume: automated checks verify the properties
you thought to encode. Anything you did not think to encode still needs eyes. Coverage of
behaviour is not coverage of appearance.

**Rule adopted:** any on-canvas affordance that indicates direction must be visually confirmed,
not merely unit-tested. Added to CLAUDE.md.

---

## Product Backlog (carried forward)

| Priority | Item                                                 | Rationale                                                                                                        |
| -------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| High     | Test `Game` and `Renderer`/drawers                   | Still the only 0% modules. Sprint 04 dodged it by extracting `steering.ts`, but the loop itself remains untested |
| High     | Promote the desktop playthrough to a committed check | Mobile has one; desktop's is still a scratch script, so re-verifying the keyboard path stays a manual step       |
| Medium   | Catch-chain bonus scoring                            | Specified in CLAUDE.md, never implemented                                                                        |
| Medium   | Difficulty ramps on time, not skill                  | Ignores how well the player is doing                                                                             |
| Medium   | `FallingObject.velocity.x` is always 0               | Implement horizontal drift or drop the field                                                                     |
| Medium   | Tap zones are undiscoverable until pressed           | Feedback only appears while held; a first-time player may not know to try                                        |
| Low      | Particle effects and catch feedback                  | Nothing signals a successful catch                                                                               |
| Low      | Sound effects, muted by default                      | —                                                                                                                |
| Low      | Accessibility pass                                   | High-contrast mode, audio cues, difficulty selection                                                             |
| Low      | Bump CI actions off Node 20                          | Carried from Sprint 01; verify current major tags first                                                          |
| Low      | Dependency vulnerabilities                           | `npm audit` reports issues in the dev toolchain; needs ESLint 9 flat config                                      |
