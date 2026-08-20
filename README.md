# Rhino Game

A browser-based game where players control a turtle to catch falling objects. Built with TypeScript and Canvas API for fast, fluid gameplay.

## Quick Start

### Prerequisites
- Node.js 18+ and npm (or pnpm/yarn)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This starts a development server at `http://localhost:5173` with hot module reloading.

### Build

```bash
npm run build
```

Produces optimized production build in `dist/`.

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:ui
```

## Game Controls

- **A / Left Arrow**: Move turtle left
- **D / Right Arrow**: Move turtle right
- **P**: Pause/Resume game
- **R**: Restart (when game over)

## Project Structure

See [CLAUDE.md](./CLAUDE.md) for comprehensive architecture documentation and development guidelines.

```
src/
├── game/          # Game logic (Player, FallingObject, GameState, Game loop)
├── input/         # Input handling (keyboard events)
├── render/        # Rendering system (Canvas drawing)
├── physics/       # Collision detection
├── types.ts       # TypeScript type definitions
├── constants.ts   # Game configuration constants
└── app.ts         # Application entry point

public/
└── index.html     # HTML entry point

styles/
└── main.css       # Game styling
```

## Features

- Smooth player movement with keyboard controls
- Progressive difficulty (increasing spawn rate and fall speed)
- Collision detection
- Score tracking with persistence
- Pause/Resume functionality
- Responsive canvas rendering

## Development Workflow

For AI assistants and developers, refer to [CLAUDE.md](./CLAUDE.md) for:
- Architecture principles
- Code conventions
- Testing strategy
- Common improvement areas
- Debugging tips

## License

See LICENSE file for details.
