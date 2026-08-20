# Rhino Game - Developer Guide

## Project Overview

**Rhino** is a browser-based game where players control a turtle to catch falling objects. The goal is to continuously improve the webapp through iterative development, maintaining clean architecture and code quality throughout.

### Game Mechanics

- **Player Control**: Move a turtle left and right across the bottom of the screen — keyboard
  on desktop, drag anywhere on the board on touch devices
- **Objective**: Catch falling objects to score points
- **Lives**: Start with 3; every object that reaches the bottom uncaught costs one
- **Game Over**: Triggered at zero lives; `R` restarts
- **Difficulty**: Progressive increase in object falling speed and spawn rate
- **Score System**: Track player score with visual feedback

---

## Verified Commands

Every command below was executed against this tree and exits 0. Run `npm run ci` before
pushing — it is the exact sequence CI runs.

| Command                 | Purpose                                         |
| ----------------------- | ----------------------------------------------- |
| `npm install`           | Install dependencies (required before all else) |
| `npm run dev`           | Dev server at http://localhost:5173             |
| `npm run typecheck`     | `tsc --noEmit` over src/ **and** vite.config.ts |
| `npm run lint`          | ESLint over src/ and scripts/, 0 warnings       |
| `npm run format:check`  | Prettier verification (`npm run format` writes) |
| `npm test`              | Vitest, single run — 61 tests                   |
| `npm run test:watch`    | Vitest in watch mode                            |
| `npm run test:coverage` | Vitest with v8 coverage report                  |
| `npm run build`         | Typecheck, then production bundle into `dist/`  |
| `npm run test:mobile`   | Emulated Android touch checks (needs Chromium)  |
| `npm run ci`            | **The full gate — run this before pushing**     |

---

## Architecture

### Core Principles

1. **Separation of Concerns** - Game logic, rendering, and input handling are independent
2. **Clean Code** - Self-documenting code with minimal comments
3. **Single Responsibility** - Each module handles one aspect of the game
4. **Testability** - Pure functions and dependency injection for easy testing

### High-Level Structure

```
rhino/
├── index.html               # Vite entry point — MUST stay at root
├── src/
│   ├── game/
│   │   ├── Game.ts          # Main game loop orchestrator
│   │   ├── Player.ts        # Turtle entity and movement
│   │   ├── FallingObject.ts # Collectible objects
│   │   ├── GameState.ts     # Score, lives, level, status
│   │   └── *.test.ts        # Colocated unit tests
│   ├── input/
│   │   └── InputHandler.ts  # Keyboard input processing
│   ├── render/
│   │   ├── Renderer.ts      # Canvas rendering orchestrator
│   │   └── drawers/         # Specific drawable components
│   ├── physics/
│   │   └── Collision.ts     # Collision detection
│   ├── styles/
│   │   └── main.css         # Imported by app.ts so Vite bundles it
│   ├── types.ts             # Shared domain types
│   ├── constants.ts         # Tunable game configuration
│   └── app.ts               # Application entry point
├── public/                  # Static assets copied verbatim (no source here)
├── scripts/                 # Node-side checks (check-mobile.mjs)
├── docs/scrum/              # Sprint plans, reviews, product backlog
├── .github/workflows/ci.yml # CI pipeline
├── vite.config.ts           # Vite AND Vitest config — single source of truth
├── tsconfig.json            # App code (src/), DOM libs, vite/client types
├── tsconfig.node.json       # Node-side files (vite.config.ts)
└── package.json
```

### Config Structure (Vite 5)

Pinned to `vite@^5.4.21`, Vitest 2, TypeScript 5.

**One config file, not two.** `test` lives inside `vite.config.ts` behind
`/// <reference types="vitest/config" />`. A standalone `vitest.config.ts` would _take
precedence over_ `vite.config.ts` rather than merge with it, so build and test resolution could
drift apart silently — an alias added for the build would not exist in tests.

**Two tsconfigs, and `typecheck` runs both.** `tsconfig.json` covers `src/`;
`tsconfig.node.json` covers `vite.config.ts`. This is not ceremony: with a single
`include: ["src"]`, the config files were invisible to `tsc`, and a blatant type error in
`vite.config.ts` passed `npm run typecheck` cleanly.

**Never declare a path alias in only one of the two places.** `tsconfig` `paths` and Vite's
`resolve.alias` are separate resolvers. A `@/*` path was declared in `tsconfig` but never
wired into Vite: `tsc` accepted `import ... from '@/game/Game'` and `vite build` then failed
with "Could not resolve". Typecheck-green-but-build-red is the exact failure mode Sprint 01
existed to eliminate. The alias has been removed — the codebase uses relative imports. If you
add one back, add it to **both** files and prove it with a build.

`src/vite-env.d.ts` pulls in `vite/client` types, which is what makes `import.meta.env`,
`?url`, `?raw`, and CSS imports type-check.

**Entry point rule:** `index.html` belongs at the project root, not in `public/`. Vite resolves
the build entry from the root and copies `publicDir` verbatim — an HTML file in `public/`
referencing `../src/...` cannot resolve and breaks the build. Reference source as `/src/app.ts`,
and import CSS from TypeScript rather than linking it, so Vite bundles and hashes it.

### Module Responsibilities

#### Game Logic (`src/game/`)

- **Game.ts**: Orchestrates the game loop, manages update/render cycle
- **Player.ts**: Turtle state, position, speed, movement bounds
- **FallingObject.ts**: Object state, velocity, position updates
- **GameState.ts**: Score, level, active objects, game status (playing/paused/over)

#### Input (`src/input/`)

- **InputHandler.ts**: Owns all keyboard state. Two distinct shapes:
  - **Continuous** movement is _polled_: `isMovingLeft()` / `isMovingRight()` report whether a
    key is currently held. `Game` polls these each frame and scales by delta time. Movement
    must never be an event callback — a callback fires once per keypress, not per frame, so it
    cannot be delta-scaled.
  - **Discrete** actions are _pushed_ via `InputAction` (`'togglePause' | 'restart'`), fired
    once on key release.
  - **Pointer/touch** is polled too: `getPointerFraction()` returns where the finger is across
    the play surface as 0–1, or `null` when nothing is pressed. It reports a _fraction_, not a
    pixel, so `InputHandler` stays free of canvas geometry and the caller maps it into the
    logical space.
- Takes an `EventTarget` for keys and an optional `HTMLElement` as the pointer surface, so tests
  can dispatch real `KeyboardEvent`s and `PointerEvent`s without touching globals.
- `destroy()` unregisters every listener; handlers are bound class fields so the removal matches.
- All key handling lives here — never attach game key listeners in `app.ts`

#### Rendering (`src/render/`)

- **Renderer.ts**: Main render orchestrator, clear canvas, coordinate management
- **drawers/**: Modular drawing functions for each entity type
  - `drawPlayer.ts` - Render turtle sprite
  - `drawObjects.ts` - Render falling objects
  - `drawUI.ts` - HUD, score, level display

#### Physics (`src/physics/`)

- **Collision.ts**: AABB collision detection between player and objects
- Pure function: `detectCollision(player, objects) -> collectedIndices`

---

## Tech Stack

### Core Technologies

- **Language**: TypeScript, `strict: true`
- **Build Tool**: Vite 5 (esbuild minification — no `terser` dependency)
- **Canvas API**: Native browser canvas for rendering
- **Testing**: Vitest 2 with the `jsdom` environment
- **Package Manager**: npm (`package-lock.json` is committed and required by CI)

### Development Dependencies

- `typescript` — type checking
- `vite` — build and dev server
- `vitest` + `jsdom` + `@vitest/coverage-v8` — unit testing and coverage
- `prettier` — code formatting
- `eslint` + `@typescript-eslint/*` — linting

No runtime dependencies. The game ships as plain TypeScript against browser APIs, and it
should stay that way unless a dependency earns its bundle cost.

---

## Code Conventions

### Naming

- **Classes**: PascalCase (e.g., `FallingObject`, `InputHandler`)
- **Functions**: camelCase (e.g., `detectCollision`, `updatePlayerPosition`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_PLAYER_SPEED`, `GRAVITY`)
- **Private members**: Prefix with `#` (e.g., `#position`, `#velocity`)

### Type Safety

- Use strict TypeScript (`strict: true` in tsconfig.json)
- Export interfaces from modules for public APIs
- Avoid `any` type - use specific types or generics
- Use type aliases for domain concepts:
  ```typescript
  type Position = { x: number; y: number };
  type Velocity = { x: number; y: number };
  ```

### Code Style

- **No comments explaining WHAT** - code should be self-explanatory
- **Comments only for WHY** - non-obvious constraints, workarounds, domain knowledge
- **Max line length**: 100 characters
- **Use functional approach**: Pure functions > mutable state
- **Avoid premature abstractions** - duplicate code is better than wrong abstraction

### File Organization

- One class per file (exceptions: small related types)
- Exports grouped at end of file
- Imports sorted: external deps → relative paths
- No default exports (easier refactoring and testing)

### Error Handling

- Validate at system boundaries (input, canvas availability)
- Use domain types to prevent invalid states (e.g., non-negative score)
- Fail fast with descriptive messages
- No silent failures

---

## Development Workflow

### For AI Assistants Improving the Codebase

When asked to improve or add features:

1. **Understand the Current State**
   - Read relevant source files
   - Check existing tests to understand expected behavior
   - Review git history for context

2. **Plan the Change**
   - Identify affected modules
   - Check if you can make the change without breaking existing code
   - Consider performance implications

3. **Implement with Clean Code**
   - Make minimal, focused changes
   - Maintain existing code style
   - Add tests for new logic
   - No dead code or TODO comments

4. **Testing**
   - Run unit tests locally
   - Verify game plays correctly
   - Check edge cases (e.g., player at screen bounds, multiple collisions)

5. **Commit**
   - Descriptive message focusing on "why", not "what"
   - One logical change per commit
   - Reference issue numbers if applicable

### Continuous Integration

`.github/workflows/ci.yml` runs on every branch push and every PR into `main`:

```
typecheck → lint → format:check → test:coverage → build
```

- **Node matrix**: 20.x and 22.x, `fail-fast: false` so one version failing still reports the other
- **`npm ci`**: requires `package-lock.json` to stay committed — never gitignore it
- **Concurrency**: superseded runs on the same ref are cancelled
- **Permissions**: `contents: read` only
- **Artifacts**: coverage report and `dist/` uploaded from the 22.x leg

`npm run ci` reproduces this locally. Run it before pushing — a red pipeline costs a cycle and
reviewer trust.

**When adding a check to CI, add it as an npm script first** and include it in the `ci` script,
so local and CI runs never drift apart.

### Sprint Workflow

Work proceeds in Scrum increments recorded under `docs/scrum/`:

1. **Plan** — measure the current state by _running_ the toolchain, never by reading code.
   Failing gates become backlog items.
2. **Commit to a sprint backlog** — a small set of items with a single clear sprint goal.
3. **Build** — one logical change per item, tests alongside.
4. **Review** — run every gate and record the actual exit codes in the sprint document.
5. **Retro + backlog** — carry unfinished and newly discovered work into the product backlog.

The current product backlog lives at the bottom of the latest sprint file.

### Evidence Rule

**Never report an item done without the command output that proves it.** A green exit code is
the evidence; a description of the change is not. This rule exists because Sprint 00 shipped a
"complete, ready to run" scaffold that could not build, could not test, and had linting silently
disabled by a misspelled rule name — all of which one `npm install && npm run ci` would have caught.

### Git Workflow

- Develop on designated feature branches
- Squash related commits before merging
- Rebase on main for clean history
- Write clear commit messages

### Branch Naming

- `claude/feature-name` for feature work
- `claude/fix-issue-name` for bug fixes
- `claude/refactor-component` for refactoring

---

## Game Systems

### Update Cycle (per frame)

```
1. Process Input → Update Player Position
2. Update Falling Objects → Remove off-screen objects
3. Detect Collisions → Update Score, Remove collected objects
4. Render All → Draw player, objects, UI
5. Check Win/Lose Conditions
```

### Mobile & Canvas Sizing (non-negotiable)

**The game thinks in a fixed logical space of `GAME_CONFIG.canvasWidth × canvasHeight`
(800×600).** Every tuned constant assumes it. `Renderer` scales that space onto whatever the
element actually occupies, multiplied by `devicePixelRatio`, so drawing code never deals with
screen size. Never read `canvas.width` to lay out gameplay or UI — that is the _backing store_
in device pixels, not the logical space. `drawUI` receives the logical dimensions explicitly.

Two traps that already cost a sprint:

1. **Never put the canvas in normal flow inside an aspect-ratio box.** A canvas is a replaced
   element whose `width`/`height` attributes give it an intrinsic aspect ratio, and the renderer
   sets those attributes from the element's measured size. In flow that closes a feedback loop —
   measure → set backing store → intrinsic ratio changes → box changes — and it settles at the
   wrong shape, stretching the game. `#gameCanvas` is `position: absolute; inset: 0` inside a
   `position: relative` `#stage` so it cannot influence its parent's height.
2. **The play surface needs `touch-action: none`.** Without it the browser claims the drag as a
   scroll and the turtle never moves.

**Every control needs a touch path.** The game shipped keyboard-only once and was completely
unplayable on a phone while every test passed. Anything reachable only by keypress must also be
reachable by touch — dragging for movement, on-screen buttons for pause and restart. Instruction
text is chosen by `@media (hover: none) and (pointer: coarse)`; never tell a phone to press `A`.

`npm run test:mobile` drives emulated Pixel 5 and Galaxy S9+ with real touch events and fails on
regressions in any of the above. Run it after touching input, layout, or rendering.

### Frame-Rate Independence (non-negotiable)

**Every rate in this codebase is per second, and every consumer multiplies by `deltaTime`.**
Never write `position += speed` — write `position += speed * deltaTime`.

The original build added a fixed amount per frame, which meant the game ran 2.4× faster on a
144 Hz monitor than on a 60 Hz one. Anything that moves, falls, or spawns takes `deltaTime`:

```typescript
player.moveRight(deltaTime); // px/second
object.update(deltaTime); // px/second
this.#spawnAccumulator += this.#spawnRate * deltaTime; // objects/second
```

`Game` clamps each frame to `MAX_FRAME_DELTA` (0.1s). A backgrounded tab hands back a
multi-second delta on its first frame; without the ceiling every object would teleport past the
player and drain all three lives at once. The spawn accumulator drains in a `while` loop rather
than an `if`, so a long frame still spawns the right number of objects.

When adding anything time-based, add a test asserting equal travel at two different frame
rates — `Player.test.ts` and `FallingObject.test.ts` both have one to copy.

### Collision Detection

- Use Axis-Aligned Bounding Box (AABB) for simplicity and performance
- Player is represented as rectangle
- Objects are represented as rectangles
- Collision occurs when bounding boxes overlap

### Difficulty Progression

- Track level (increases every N points or seconds)
- Adjust: object spawn rate, fall speed, object size
- Keep progression smooth to avoid frustration

### Score System

- 10 points per object caught (`POINTS_PER_OBJECT`)
- Level increases every 100 points (`LEVEL_UP_SCORE`), raising fall speed
- Current score, lives, and high score render in both the canvas HUD and the DOM scoreboard
- High score persists to `localStorage` under `rhino-high-score` and survives a reset
- _Not yet implemented:_ bonus points for consecutive catches (see product backlog)

### Lives & Game Over

- Start at `INITIAL_LIVES` (3); each object that falls off-screen uncaught costs one life
- Reaching zero sets status to `gameOver`, which freezes updates and shows the end screen
- `loseLife()` is inert unless status is `playing`, so a paused or finished game cannot bleed lives
- `R` restarts only from `gameOver`

### Single Game Loop

`Game` owns the only `requestAnimationFrame` loop. UI that needs per-frame data subscribes via
`game.onFrame(listener)` — do not start a second loop to poll state, and do not update the DOM
scoreboard from anywhere else.

---

## Performance Considerations

### Optimization Opportunities

- **Object Pooling**: Reuse falling object instances instead of creating/destroying
- **Render Batching**: Group canvas draws by type
- **RequestAnimationFrame**: Use for 60 FPS gameplay
- **Lazy Loading**: Only load assets when needed

### Metrics to Monitor

- Frame rate (target 60 FPS)
- Number of active game objects
- Input latency (player action to visual feedback)
- Memory usage

### Canvas Optimization

- Clear only the affected regions if needed
- Use integer coordinates to avoid anti-aliasing
- Minimize state changes (strokeStyle, fillStyle)
- Consider offscreen canvas for complex drawings

---

## Testing Strategy

Tests are colocated with source as `*.test.ts` and run under Vitest with the `jsdom`
environment (needed for `localStorage` in `GameState`).

### Current coverage

| Module                 | Lines | Covered by                                            |
| ---------------------- | ----- | ----------------------------------------------------- |
| `GameState.ts`         | 100%  | Score, level, lives, game over, reset, persistence    |
| `Player.ts`            | 100%  | Movement, both bounds, frame-rate independence        |
| `FallingObject.ts`     | 100%  | Spawn bounds, sizing, fall rate, off-screen boundary  |
| `InputHandler.ts`      | 100%  | Held keys, discrete actions, preventDefault, teardown |
| `Collision.ts`         | 100%  | Overlap, adjacency, containment                       |
| `constants.ts`         | 100%  | —                                                     |
| `Game.ts`              | 0%    | Needs a loop harness with fake timers                 |
| `Renderer.ts`, drawers | 0%    | Needs a canvas 2D context mock                        |

Everything that can be tested without a canvas is now covered. The two remaining gaps both
need a rendering harness: `Game` needs fake timers around `requestAnimationFrame`, and
`Renderer`/drawers need a mocked 2D context.

### Unit Tests

- Game state transitions (playing / paused / gameOver)
- Lives decrement and the zero-lives boundary
- Collision detection edge cases (adjacent boxes must **not** collide)
- Score and level calculation
- Player movement clamped at both screen bounds

### Integration Tests

- Complete game loop cycle
- Input → Movement → Rendering pipeline

### Manual Testing Checklist

- [ ] Player moves smoothly left/right
- [ ] Objects spawn and fall at expected rate
- [ ] Collision detection works at edges
- [ ] Score updates correctly
- [ ] Game over state triggers properly
- [ ] Game can be paused and resumed
- [ ] Performance is smooth at high object counts

---

## Key Design Decisions

### Why Canvas Over DOM

- Better performance for frequent updates
- Simpler coordinate system for game mechanics
- Lower overhead than DOM manipulation

### Why TypeScript

- Prevents runtime errors through static typing
- Improves code maintainability at scale
- Better IDE support and refactoring

### Why Modular Architecture

- Easy to test individual components
- Simple to add features without side effects
- Clear dependencies make it easy to understand

---

## Common Improvement Areas

> The live, prioritized product backlog is at the bottom of the most recent file in
> `docs/scrum/`. That is the authoritative list; the categories below are inspiration for
> filling it, not a to-do list themselves.

### Visual Polish

- Add sprite animations for turtle movement
- Particle effects for object collection
- Screen shake on collision
- Gradient or parallax background

### Gameplay Enhancements

- Power-ups with special effects
- Enemy objects to avoid
- Sound effects and music (muted by default)
- Different game modes (time attack, survival)

### Persistence

- Store high scores
- Track statistics (longest game, total objects caught)
- Save game state for resume

### Accessibility

- High contrast mode
- Keyboard-only controls
- Audio cues for game events
- Adjustable difficulty levels

---

## Debugging Tips

### Common Issues

- **Objects not spawning**: Check spawn logic and bounds
- **Collision not detecting**: Verify bounding box calculations
- **Performance lag**: Check object count, reduce draw calls
- **Input not working**: Verify input handler is listening and updating player state

### Debug Helpers

- Render bounding boxes with `debugMode` flag
- Log game state changes for tracing
- Monitor FPS with performance tools
- Check console for TypeScript type errors

---

## Resources & References

### Canvas API

- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Game Loop Patterns](https://gameprogrammingpatterns.com/game-loop.html)

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Game Development

- [2D Game Physics](https://www.gamedev.net/tutorials/programming/general-programming/collision-detection-using-the-separating-axis-theorem-r3042/)

---

## Continuous Improvement Process

As an AI assistant improving this game:

1. **Incremental Changes** - Small, focused improvements
2. **Maintain Quality** - Don't add tech debt for quick wins
3. **Document Decisions** - Update this file if architecture changes
4. **Test Thoroughly** - Verify changes don't break existing features
5. **Polish Gradually** - Each improvement should feel intentional

The goal is to build a solid, maintainable foundation that can grow with the game's complexity while remaining enjoyable to play and easy to modify.
