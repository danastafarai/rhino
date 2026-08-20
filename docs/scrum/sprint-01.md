# Sprint 01 — Green Pipeline

**Status:** Done
**Branch:** `claude/claude-md-docs-uf68g6`

---

## Sprint Goal

> Every check that guards `main` runs, passes, and is enforced automatically.

The Sprint 00 scaffold looked complete but had never been executed. This sprint makes the
project genuinely buildable, testable, and lintable, and puts CI in front of the branch so the
gap between "code exists" and "code works" cannot reopen silently.

---

## Sprint Planning

### Starting condition (measured, not assumed)

The first act of the sprint was running the toolchain end to end. Four of five gates failed:

| Gate      | Command        | Result before                                    |
| --------- | -------------- | ------------------------------------------------ |
| Typecheck | `tsc --noEmit` | ✅ pass                                          |
| Lint      | `eslint src`   | ❌ config error on all 10 files, zero rules ran  |
| Format    | —              | ❌ no script existed                             |
| Test      | `vitest run`   | ❌ `ERR_MODULE_NOT_FOUND: jsdom`, 0 tests ran    |
| Build     | `vite build`   | ❌ `Could not resolve entry module "index.html"` |

The scaffold could not produce a bundle and could not run a single test.

### Sprint backlog (committed)

| ID      | Item                                         | Est. | Status  |
| ------- | -------------------------------------------- | ---- | ------- |
| RHINO-1 | Fix Vite entry so the production build works | M    | ✅ Done |
| RHINO-2 | Make the test suite runnable                 | S    | ✅ Done |
| RHINO-3 | Fix ESLint config so lint reports findings   | S    | ✅ Done |
| RHINO-4 | Add the npm scripts CI needs                 | S    | ✅ Done |
| RHINO-5 | Add GitHub Actions CI pipeline               | M    | ✅ Done |
| RHINO-6 | Implement the missing game-over condition    | M    | ✅ Done |
| RHINO-7 | Sprint documentation + CLAUDE.md refresh     | S    | ✅ Done |

---

## What Was Built

### RHINO-1 — Build works

`index.html` lived in `public/` and pointed at `../src/app.ts`, escaping the static directory.
Vite treats the project root as the entry point and copies `public/` verbatim, so this could
never resolve.

- Moved `index.html` to the project root with a root-absolute `/src/app.ts` entry.
- CSS is now imported from `app.ts` instead of a `<link>`, so Vite bundles and hashes it.
- Switched `minify` from `terser` (an uninstalled optional dependency) to the built-in
  `esbuild` — no extra dependency and a faster CI build.
- Kept `public/` as the static-asset directory for future sprites and audio.

### RHINO-2 — Tests run

`vitest.config.ts` requested the `jsdom` environment without declaring the dependency. Added
`jsdom` and `@vitest/coverage-v8`, scoped `include` to `src/**/*.test.ts`, and excluded test
files, `types.ts`, and `app.ts` from coverage so the number reflects real logic.

### RHINO-3 — Lint reports findings

The rule was `@typescript-eslint/explicit-function-return-types`; the real rule is singular.
ESLint aborted on every file with a config error, meaning **no lint rule had ever run**. Fixed
the name, added `ignorePatterns` for build output, and relaxed the return-type rule for test
files where inference is idiomatic.

### RHINO-4 — Scripts CI needs

Added `typecheck`, `test:coverage`, `format:check`, `lint:fix`, and an aggregate `ci` script so
one command reproduces the pipeline locally. `lint` runs with `--max-warnings 0`, so the
`no-console` warning is a hard failure rather than scrollback noise.

### RHINO-5 — CI pipeline

`.github/workflows/ci.yml` runs on every branch push and PR to `main`:

typecheck → lint → format:check → test with coverage → build

- Node 20.x and 22.x matrix with `fail-fast: false`, so one version failing still reports the other.
- `concurrency` cancels superseded runs on the same ref.
- `npm ci` against the now-committed `package-lock.json` for reproducible installs.
- `permissions: contents: read` — least privilege.
- Coverage and `dist/` uploaded as artifacts from the 22.x leg.

### RHINO-6 — Game over actually happens

`drawUI` rendered a full GAME OVER screen and `app.ts` bound `R` to restart, but **nothing ever
set the status to `gameOver`**. The game had no lose condition; missed objects vanished with no
consequence and the screen was unreachable dead code.

- `GameState` gained a lives counter (3), `loseLife()`, `getLives()`, and `isGameOver()`.
- A missed object costs a life; zero lives ends the run.
- `loseLife()` is a no-op unless status is `playing`, so a paused or finished game cannot bleed lives.
- Lives render in the HUD and in the DOM scoreboard.
- Restart moved into `InputHandler` as a proper `restart` action rather than a stray listener in `app.ts`.

### Opportunistic cleanups

- `app.ts` ran a **second `requestAnimationFrame` loop** purely to update the DOM scoreboard.
  Replaced with a `Game.onFrame()` listener — one loop drives everything now.
- `InputAction` declared a `'resume'` variant that was never emitted. Renamed the pair to
  `'togglePause' | 'restart'`, removing the dead variant.
- `app.ts` logged to console and continued when the canvas was missing; it now throws, per the
  "fail fast, no silent failures" convention in CLAUDE.md.

---

## Sprint Review

Every gate below was executed on the final tree and its exit code recorded.

| Gate      | Command                 | Exit | Result                                  |
| --------- | ----------------------- | ---- | --------------------------------------- |
| Typecheck | `npm run typecheck`     | 0    | ✅ clean                                |
| Lint      | `npm run lint`          | 0    | ✅ clean, 0 warnings                    |
| Format    | `npm run format:check`  | 0    | ✅ all files match Prettier             |
| Tests     | `npm run test`          | 0    | ✅ 27 passed / 27, 3 files              |
| Coverage  | `npm run test:coverage` | 0    | ✅ report generated                     |
| Build     | `vite build`            | 0    | ✅ 15 modules → 9.88 kB js, 1.18 kB css |

### Coverage after the sprint

| Module                 | Lines | Note                                    |
| ---------------------- | ----- | --------------------------------------- |
| `GameState.ts`         | 100%  | Score, level, lives, game over, reset   |
| `Player.ts`            | 100%  | Movement, both bounds, position copying |
| `Collision.ts`         | 100%  | AABB overlap, adjacency, containment    |
| `constants.ts`         | 100%  | —                                       |
| `Game.ts`              | 0%    | Needs a loop harness — Sprint 02        |
| `InputHandler.ts`      | 0%    | Needs DOM event simulation — Sprint 02  |
| `Renderer.ts`, drawers | 0%    | Needs a canvas mock — Sprint 02         |

Pure, framework-free logic is fully covered. The uncovered modules all sit against browser
APIs and need test harnesses that were out of scope here.

### Definition of Done

- [x] All acceptance gates green with recorded exit codes
- [x] New behavior covered by tests (8 new lives/game-over cases, 8 new Player cases)
- [x] No dead code introduced; three pre-existing dead paths removed
- [x] CI enforces the gates on every push
- [x] Documentation matches the shipped state

---

## Retrospective

**What went wrong before this sprint**
Sprint 00 shipped 25 files and a completion report without ever executing `npm install`. The
claim "the project is ready to run" was never true. A misspelled lint rule silently disabled
linting entirely — the most dangerous failure mode, since it looks identical to passing.

**What we changed**
CI now makes that class of claim impossible to sustain: a broken build cannot reach `main`
unnoticed. The `ci` script gives the same guarantee locally before pushing.

**Rule adopted for future sprints**
Do not report an item done without the command output that proves it. A green exit code is the
evidence; a description of the change is not.

---

## Product Backlog (carried forward)

Ordered by value. Sprint 02 would pull from the top.

| Priority | Item                                            | Rationale                                                                                                                                                                                                                           |
| -------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| High     | Test `Game`, `InputHandler`, `Renderer`         | The three 0%-coverage modules; needs a fake timer + canvas harness                                                                                                                                                                  |
| High     | `Renderer.clearCanvas()` does not clear         | Paints `rgba(0,0,0,0.1)` each frame, leaving motion smear. Either clear properly or rename to `drawTrail()` and make it intentional                                                                                                 |
| High     | Difficulty curve is time-based, not skill-based | `updateDifficulty` ramps on elapsed time regardless of player performance                                                                                                                                                           |
| Medium   | Object pooling                                  | `FallingObject` is allocated per spawn; pooling was called out in CLAUDE.md but never implemented                                                                                                                                   |
| Medium   | Catch-chain bonus scoring                       | CLAUDE.md specifies bonus points for consecutive catches; only flat scoring exists                                                                                                                                                  |
| Medium   | `FallingObject` has an unused `velocity.x`      | Either implement horizontal drift or drop the field                                                                                                                                                                                 |
| Medium   | Turtle is a green rectangle                     | Real sprite + movement animation                                                                                                                                                                                                    |
| Medium   | Responsive canvas                               | Fixed 800×600; `Renderer.resize()` exists but is never called                                                                                                                                                                       |
| Low      | Particle effects on catch                       | Visual feedback for a successful catch                                                                                                                                                                                              |
| Low      | Sound effects, muted by default                 | —                                                                                                                                                                                                                                   |
| Low      | Accessibility pass                              | High-contrast mode, audio cues, difficulty selection                                                                                                                                                                                |
| Low      | Dependency vulnerabilities                      | `npm audit` reports 7 in the dev toolchain; needs an ESLint 9 flat-config migration                                                                                                                                                 |
| Low      | Bump CI actions off Node 20                     | Run 1 warned `actions/checkout@v4`, `setup-node@v4`, `upload-artifact@v4` target deprecated Node 20 and are forced onto Node 24. Not failing yet. Verify current major tags before bumping — a wrong tag turns a green pipeline red |

---

## CI Verification (Run 1)

[Run 32416603420](https://github.com/danastafarai/rhino/actions/runs/32416603420) — **success**.

- Both matrix legs (Node 20.x and 22.x) ran every gate and passed.
- 27/27 tests executed on the runner, matching the local run.
- CI emitted `index-B6XofG70.js` — the same content hash as the local build, so the pipeline is
  reproducible.
- Artifacts published from the 22.x leg: `coverage` (48 KB, 26 files) and `dist` (13 KB, 4 files).
- The artifact-upload steps show as `skipped` on the 20.x leg. That is the intended
  `matrix.node-version == '22.x'` condition, not a silent failure.
- Benign: both legs raced to save the same npm cache key and one logged
  `Unable to reserve cache`. The lockfile is identical, so either leg's cache is correct.
