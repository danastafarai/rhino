# Sprint 03 — Debug: Android

**Status:** Done
**Branch:** `claude/claude-md-docs-uf68g6`
**Trigger:** Bug report — "game is not running on my android"

---

## Sprint Goal

> The game is playable on a phone, and a phone regression can never again ship unnoticed.

---

## Investigation

### The report vs. what was actually happening

"Not running" usually means a crash or a blank page. It was neither. Emulating a Pixel 5 and a
Galaxy S9+ against the production build showed the game **loading and running correctly** —
objects falling, HUD updating, **zero console errors**.

The game was simply **impossible to play**:

| Symptom                       | Measurement                                                                                    |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| Tapping did nothing           | Turtle position identical before and after tap — `MOVED: false` on both devices                |
| Controls were keyboard-only   | The on-screen hint read _"Use A and D or Arrow Keys"_ on a device with no keyboard             |
| Game was a small blurry strip | Canvas rendered at 353×266 CSS px from a fixed 800×600 backing store, on a **2.75 dpr** screen |
| Most of the screen was wasted | Canvas bottom sat 298px above the fold                                                         |

So the defect was not a crash. **The entire input layer had no touch path**, which from a
player's seat is indistinguishable from "not running".

### A second, independent blocker

`vite.config.ts` set no `host`, so both the dev and preview servers bind to localhost only. A
phone on the same Wi-Fi cannot reach them at all — that failure genuinely _is_ a page that never
loads, and is the most likely reason the report said "not running" rather than "unplayable".
Both causes are fixed here, so the report is addressed under either reading.

---

## Sprint Backlog

| ID       | Item                               | Est. | Status  |
| -------- | ---------------------------------- | ---- | ------- |
| RHINO-14 | Add touch controls                 | L    | ✅ Done |
| RHINO-15 | Responsive, DPR-correct canvas     | M    | ✅ Done |
| RHINO-16 | Serve dev and preview on the LAN   | S    | ✅ Done |
| RHINO-17 | Mobile layout and gesture handling | M    | ✅ Done |
| RHINO-18 | Automated Android regression check | M    | ✅ Done |

---

## What Was Built

### RHINO-14 — Touch controls

`InputHandler` gained a third input shape alongside held keys and discrete actions:
`getPointerFraction()` returns where the finger is across the play surface as **0–1**, or `null`
when nothing is pressed. Reporting a _fraction_ rather than a pixel keeps `InputHandler` free of
canvas geometry — the caller maps it into the logical space.

`Player.moveToward()` steers at the **same speed cap as the keyboard** instead of snapping the
turtle to the finger, so touch is not strictly easier than desktop. Pause and restart got
on-screen buttons, since a phone cannot press `P` or `R`.

The restart button is deliberately **unconditional**, while the `R` key stays gated to game over:
a stray keypress mid-run would wipe it, but tapping a labelled button is intentional.

### RHINO-15 — Responsive, DPR-correct canvas

The renderer now sizes its backing store to `CSS size × devicePixelRatio` and scales the fixed
800×600 logical space onto it, so every tuned constant stays valid on any screen while the
output is sharp. Backing store went from a flat 800×600 to **1015×761** on the Pixel 5 and
**1332×999** on the S9+.

`drawUI` now receives logical dimensions explicitly rather than reading `canvas.width`, which
after this change is device pixels and would have mispositioned the HUD.

### RHINO-16 — Reachable from a phone

`server.host` and `preview.host` set to `true`, binding `0.0.0.0`. Vite now prints a LAN address
that a phone can actually open.

### RHINO-17 — Mobile layout and gestures

`touch-action: none` on the canvas — without it the browser claims the drag as a scroll and the
turtle never moves. Plus `dvh` units so the mobile toolbar does not clip the board,
`overscroll-behavior: none` to stop rubber-banding mid-drag, safe-area padding, a landscape
layout, and 44px minimum tap targets. Instruction text is now chosen by
`@media (hover: none) and (pointer: coarse)`, so a phone is told to drag rather than to press `A`.

**A real bug surfaced here.** After the first fix the canvas measured 369×**347** — not 4:3 — so
the game was being vertically stretched. Cause: a canvas is a replaced element whose
`width`/`height` attributes give it an intrinsic aspect ratio, and the renderer sets those from
the element's measured size. In normal flow that closes a feedback loop — measure → set backing
store → intrinsic ratio changes → box changes — which settled at the wrong shape rather than
diverging, making it easy to miss. Fixed by taking the canvas out of flow
(`position: absolute; inset: 0`) so it cannot influence its parent's height. Now exactly
369×276.75.

### RHINO-18 — Committed regression check

`npm run test:mobile` (`scripts/check-mobile.mjs`) starts the preview server, drives emulated
Pixel 5 and Galaxy S9+ with real `PointerEvent` touch input, and asserts **10 properties per
device**: no horizontal overflow, 4:3 preserved, backing store matches DPR, `touch-action` set,
keyboard hints hidden, drag right, drag left, pause toggles, restart resets lives, no errors.

It runs as a **separate CI job** so browser downloads never slow the main gate.

`playwright` is pinned to `1.56.1` rather than `^1.56.0` — the caret resolved to 1.62, which
expects a Chromium build this environment does not have.

---

## Sprint Review

| Gate               | Command                         | Exit | Result                         |
| ------------------ | ------------------------------- | ---- | ------------------------------ |
| Typecheck          | `npm run typecheck`             | 0    | ✅ clean                       |
| Lint               | `npm run lint`                  | 0    | ✅ clean, 0 warnings           |
| Format             | `npm run format:check`          | 0    | ✅ all files match             |
| Tests              | `npm run test`                  | 0    | ✅ 61 passed / 61              |
| Coverage           | `npm run test:coverage`         | 0    | ✅ 50.32%, up from 47.2%       |
| Build              | `vite build`                    | 0    | ✅ 12.73 kB js                 |
| Mobile             | `npm run test:mobile`           | 0    | ✅ **20/20 checks, 2 devices** |
| Desktop regression | Playwright keyboard playthrough | —    | ✅ 140 points, 0 errors        |

### Before and after

|                          | Before              | After                        |
| ------------------------ | ------------------- | ---------------------------- |
| Touch moves the turtle   | ❌ no               | ✅ yes, both directions      |
| Pause / restart on touch | ❌ impossible       | ✅ on-screen buttons         |
| Canvas aspect            | 353×266 (stretched) | 369×277 (exact 4:3)          |
| Backing store            | 800×600 fixed       | 1015×761 (DPR-correct)       |
| Reachable from phone     | ❌ localhost only   | ✅ binds 0.0.0.0             |
| Instructions on phone    | "Use A and D"       | "Drag anywhere on the board" |

Desktop keyboard play was re-verified after the rewrite and scored **140** (up from 90 — the
larger backing store gives the pixel-reading bot better precision).

---

## Retrospective

**Why this reached a user**
Sprint 02's definition of done said "verified in a real browser" — and it was, at a desktop
viewport with a keyboard. The verification matched the developer's device, not the user's. Every
unit test passed, CI was green, and the game was unusable on the most common way people open a
web page.

**On reading bug reports**
"Not running" turned out to mean "runs perfectly and cannot be played." Reproducing on the
reported platform before theorising was the whole sprint — the actual defect (no touch path) was
not on any backlog, while the fixed-canvas issue that _was_ on the backlog turned out to be the
lesser problem.

**Rule adopted**
Verification has to cover the form factors the game claims to support. A browser check on one
viewport is not a browser check. `npm run test:mobile` now encodes that, and CI runs it.

---

## Product Backlog (carried forward)

| Priority | Item                                                 | Rationale                                                                           |
| -------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------- |
| High     | Test `Game` and `Renderer`/drawers                   | Still the only 0% modules; `Game` needs fake timers, `Renderer` a mocked 2D context |
| High     | Promote the desktop playthrough to a committed check | Mobile now has one; desktop's still a scratch script                                |
| Medium   | Catch-chain bonus scoring                            | Specified in CLAUDE.md, never implemented                                           |
| Medium   | Difficulty ramps on time, not skill                  | Ignores how well the player is doing                                                |
| Medium   | `FallingObject.velocity.x` is always 0               | Implement horizontal drift or drop the field                                        |
| Medium   | Landscape phone play is cramped                      | Board caps at 70dvh; a dedicated landscape layout would help                        |
| Low      | Particle effects and catch feedback                  | Nothing signals a successful catch                                                  |
| Low      | Sound effects, muted by default                      | —                                                                                   |
| Low      | Accessibility pass                                   | High-contrast mode, audio cues, difficulty selection                                |
| Low      | Bump CI actions off Node 20                          | Carried from Sprint 01; verify current major tags first                             |
| Low      | Dependency vulnerabilities                           | `npm audit` reports issues in the dev toolchain; needs ESLint 9 flat config         |
