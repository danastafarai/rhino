# Rhino Game

A browser-based game where players control a turtle to catch falling objects. Built with
TypeScript and the Canvas API.

## Quick Start

### Prerequisites

- Node.js 20+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Starts a dev server at `http://localhost:5173` with hot module reloading.

### Build

```bash
npm run build
```

Typechecks, then writes an optimized production bundle to `dist/`.

### Testing

```bash
npm test              # single run
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
npm run test:mobile   # emulated Android touch checks (needs Chromium)
```

### Before pushing

```bash
npm run ci
```

Runs the exact sequence CI runs: typecheck → lint → format check → tests with coverage → build.

## Game Controls

**Desktop**

| Key       | Action              |
| --------- | ------------------- |
| `A` / `←` | Move turtle left    |
| `D` / `→` | Move turtle right   |
| `P`       | Pause / resume      |
| `R`       | Restart (game over) |

**Phone / tablet**

Tap and hold the **left half** of the board to move left, the **right half** to move right. The
pressed side lights up with an arrow while held. Pause and restart are on-screen buttons.

### Playing on your phone

`npm run dev` binds to `0.0.0.0`, so Vite prints a second "Network" address. Open that one on a
phone connected to the same Wi-Fi — `localhost` will not work from another device.

## How to Play

Catch falling objects for 10 points each. You start with **3 lives** — every object that
reaches the bottom uncaught costs one. At zero lives the run ends. Fall speed increases every
100 points, and the spawn rate climbs the longer you survive. High scores persist between
sessions.

## Project Structure

```
index.html               # Vite entry point (must stay at root)
src/
├── game/                # Game loop, player, objects, state
├── input/               # Keyboard handling
├── render/              # Canvas renderer and drawers
├── physics/             # Collision detection
├── styles/              # CSS, bundled via app.ts
└── app.ts               # Entry point
docs/scrum/              # Sprint plans, reviews, product backlog
.github/workflows/ci.yml # CI pipeline
```

See [CLAUDE.md](./CLAUDE.md) for architecture, conventions, and the development workflow.

## Continuous Integration

Every push and PR runs typecheck, lint, format check, tests with coverage, and a production
build across Node 20.x and 22.x. See [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).

## Roadmap

The prioritized product backlog lives at the bottom of the latest sprint document in
[`docs/scrum/`](./docs/scrum/).

## Other planning documents in this repository

The repository also carries planning material for a separate **EdTech learning platform**
concept, merged from earlier branches. It describes a different product from the game above and
no code for it exists here:

| Document                                                           | Purpose                                                     |
| ------------------------------------------------------------------ | ----------------------------------------------------------- |
| [`docs/sprint-0-report.md`](docs/sprint-0-report.md)               | Sprint 0 engineering audit, backlog and risk register       |
| [`docs/edtech-mvp-architektur.md`](docs/edtech-mvp-architektur.md) | MVP architecture: stack, data model, GDPR strategy (German) |
| [`docs/roadmap-phase-a-b.md`](docs/roadmap-phase-a-b.md)           | Phase A/B milestone roadmap with Go/No-Go gates (German)    |

## License

See [LICENSE](./LICENSE).
