# Sprint 02 — Playable MVP

**Status:** Done
**Branch:** `claude/claude-md-docs-uf68g6`

---

## Sprint Goal

> A player can open the game and it plays correctly — proven in a real browser, not just in tests.

Sprint 01 made the toolchain honest: the project built, tested, and linted. But the game itself
had still never been opened in a browser. "CI is green" and "the game works" are different
claims, and only the first had evidence behind it.

---

## Sprint Planning

### Starting condition

Reading the source before running it turned up two defects that would have made the first
public build look broken:

| #   | Defect                             | Impact                                                                                                                                                                                                                                  |
| --- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Nothing was frame-rate independent | `deltaTime` was computed and passed into `update()` but only fed the elapsed-time counter. Movement, falling, and spawning each added a fixed amount **per frame**, so the game ran 2.4× faster on a 144 Hz monitor than on a 60 Hz one |
| 2   | `clearCanvas()` never cleared      | It painted `rgba(0,0,0,0.1)` over the previous frame. Sprites smeared and the HUD text accumulated into an unreadable blob                                                                                                              |

Both were already on the product backlog. Neither was cosmetic.

### Sprint backlog (committed)

| ID       | Item                                               | Est. | Status  |
| -------- | -------------------------------------------------- | ---- | ------- |
| RHINO-8  | Make all motion frame-rate independent             | L    | ✅ Done |
| RHINO-9  | Fix the canvas clear so nothing smears             | S    | ✅ Done |
| RHINO-10 | Cover `FallingObject` and `InputHandler` (both 0%) | M    | ✅ Done |
| RHINO-11 | Make the player read as a turtle                   | S    | ✅ Done |
| RHINO-12 | Verify the game in a real browser                  | M    | ✅ Done |
| RHINO-13 | Tune the opening difficulty to be survivable       | S    | ✅ Done |

---

## What Was Built

### RHINO-8 — Frame-rate independence

Every rate is now **per second**, and every consumer multiplies by `deltaTime`:

| Constant           | Was (per frame) | Now (per second) |
| ------------------ | --------------- | ---------------- |
| `playerSpeed`      | 6               | 360 px/s         |
| `gravity`          | 4               | 240 px/s         |
| `initialSpawnRate` | 0.02            | 0.7 objects/s    |

Two robustness details fell out of this:

- **`MAX_FRAME_DELTA` (0.1s).** A backgrounded tab hands back a multi-second delta on its first
  frame. Unclamped, every in-flight object would teleport past the player and drain all three
  lives at once — a player could lose the game by switching tabs.
- **The spawn accumulator drains in a `while` loop, not an `if`.** A long frame owes more than
  one object; an `if` would silently swallow the remainder.

`InputHandler` had to change shape for this. Movement was previously delivered as a
`'moveLeft'` callback, but a callback fires once per keypress, not once per frame, so it can
never be delta-scaled. Continuous movement is now **polled** (`isMovingLeft()` /
`isMovingRight()`), while discrete actions (`togglePause`, `restart`) stay **pushed**. That
split is now documented in CLAUDE.md as a rule.

### RHINO-9 — The canvas actually clears

`clearRect` replaces the 10%-black fill. The canvas keeps its CSS background, so the fix
removed code rather than adding any.

### RHINO-10 — The two 0% modules

`FallingObject` and `InputHandler` both went from 0% to **100%**. Making `InputHandler` accept
an injected `EventTarget` (defaulting to `window`) let tests dispatch real `KeyboardEvent`s
with no globals mocking, and exposed a latent bug in passing: `destroy()` cleared the callback
but never removed its listeners, so a destroyed handler kept mutating its key set forever.

### RHINO-11 — The turtle

The player was a 40×40 green square with two dark rectangles that read as a **pause icon**.
It is now drawn as a top-down turtle — shell with six scutes, head pointing up toward the
falling objects, four flippers, tail — using canvas primitives scaled off the player bounds,
so no asset pipeline and no bundle cost.

### RHINO-12 — Verified in a real browser

Driven with Playwright against the production build (`vite preview`), not the dev server.

The first pass used a bot that swept blindly left and right. It "passed" but proved almost
nothing — it caught one object by luck. So the second pass reads **rendered canvas pixels**
(`getImageData`) to locate the lowest falling object and the turtle, then steers toward it.
That plays the game the way a person does, through the same keyboard path, with no test hooks
in production code.

Result over a 45-second session: **90 points, 9 catches, 367 control ticks**, ending in a
legitimate game over. Zero console errors or page errors across every run.

Also confirmed by hand: pause freezes the score, `R` restores three lives, and the high score
persists to `localStorage`.

### RHINO-13 — Difficulty tuning

The first real playtest ended with **score 10, lives 0** — the run was over in seconds. With a
miss costing a life, the opening spawn rate has to leave one turtle able to physically reach
every object. Lowered `initialSpawnRate` 1.2 → 0.7/s and the ramp 0.06 → 0.04, giving under two
objects in flight against a turtle that crosses the canvas in 2.1s. The tracking bot's score
went 10 → 90 on the same input logic.

This is a judgment call about feel, not a correctness fix — it is the one change here worth
overriding if you want the game harder.

---

## Sprint Review

| Gate      | Command                 | Exit | Result                                |
| --------- | ----------------------- | ---- | ------------------------------------- |
| Typecheck | `npm run typecheck`     | 0    | ✅ clean                              |
| Lint      | `npm run lint`          | 0    | ✅ clean, 0 warnings                  |
| Format    | `npm run format:check`  | 0    | ✅ all files match Prettier           |
| Tests     | `npm run test`          | 0    | ✅ 48 passed / 48, 5 files            |
| Coverage  | `npm run test:coverage` | 0    | ✅ 47.2% lines, up from 31.99%        |
| Build     | `vite build`            | 0    | ✅ 16 modules                         |
| Browser   | Playwright playthrough  | —    | ✅ 90 points scored, 0 console errors |

### Coverage movement

| Module                 | Sprint 01 | Sprint 02 |
| ---------------------- | --------- | --------- |
| `FallingObject.ts`     | 0%        | **100%**  |
| `InputHandler.ts`      | 0%        | **100%**  |
| `GameState.ts`         | 100%      | 100%      |
| `Player.ts`            | 100%      | 100%      |
| `Collision.ts`         | 100%      | 100%      |
| `Game.ts`              | 0%        | 0%        |
| `Renderer.ts`, drawers | 0%        | 0%        |

### Definition of Done

- [x] All gates green with recorded exit codes
- [x] Game verified playable in a real browser against the production build
- [x] Frame-rate independence pinned by tests at two different frame rates
- [x] New behavior covered; two modules moved 0% → 100%
- [x] Documentation matches the shipped state

---

## Retrospective

**What the browser pass caught that tests could not**
Every unit test passed before this sprint, and the game was still visibly broken — smeared
rendering, and a speed that depended on the player's monitor. Neither is expressible as a unit
test of a pure function. The difficulty problem was even less visible: nothing was _wrong_, the
game was just over in five seconds.

**The verification lesson**
My first browser bot swept blindly and reported success. It was a test that could not fail for
the right reason. Rewriting it to read rendered pixels and actually chase objects turned it
into evidence. A passing check that cannot distinguish working from broken is worse than none,
because it launders a guess into a claim.

**Rule adopted**
A gameplay change is not done until it has been driven in a browser against the production
build. `npm run ci` cannot see smearing, frame-rate coupling, or a game that ends too fast.

---

## Product Backlog (carried forward)

| Priority | Item                                   | Rationale                                                                                                                                     |
| -------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| High     | Test `Game` and `Renderer`/drawers     | The last two 0% modules; `Game` needs fake timers around `requestAnimationFrame`, `Renderer` needs a mocked 2D context                        |
| High     | Automate the browser playthrough in CI | The Playwright check is currently a scratch script. As a committed `test:e2e` it would guard against regressions in rendering and playability |
| Medium   | Catch-chain bonus scoring              | CLAUDE.md specifies bonus points for consecutive catches; only flat scoring exists                                                            |
| Medium   | Difficulty ramps on time, not skill    | `updateDifficulty` ignores how well the player is doing                                                                                       |
| Medium   | Responsive canvas                      | Fixed 800×600; `Renderer.resize()` exists but is never called                                                                                 |
| Medium   | `FallingObject.velocity.x` is always 0 | Horizontal drift would add variety, or the field should go                                                                                    |
| Low      | Particle effects and catch feedback    | Nothing signals a successful catch beyond the number changing                                                                                 |
| Low      | Sound effects, muted by default        | —                                                                                                                                             |
| Low      | Accessibility pass                     | High-contrast mode, audio cues, difficulty selection                                                                                          |
| Low      | Bump CI actions off Node 20            | Carried from Sprint 01; verify current major tags before bumping                                                                              |
| Low      | Dependency vulnerabilities             | `npm audit` reports 7 in the dev toolchain; needs an ESLint 9 flat-config migration                                                           |
