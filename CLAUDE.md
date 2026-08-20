# Rhino Game - Developer Guide

## Project Overview

**Rhino** is a browser-based game where players control a turtle to catch falling objects. The goal is to continuously improve the webapp through iterative development, maintaining clean architecture and code quality throughout.

### Game Mechanics
- **Player Control**: Move a turtle left and right across the bottom of the screen
- **Objective**: Catch falling objects to score points
- **Difficulty**: Progressive increase in object falling speed and spawn rate
- **Score System**: Track player score with visual feedback

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
├── src/
│   ├── game/
│   │   ├── Game.ts          # Main game loop orchestrator
│   │   ├── Player.ts        # Turtle entity and movement
│   │   ├── FallingObject.ts # Collectible objects
│   │   └── GameState.ts     # Game state management
│   ├── input/
│   │   └── InputHandler.ts  # Keyboard input processing
│   ├── render/
│   │   ├── Renderer.ts      # Canvas rendering orchestrator
│   │   └── drawers/         # Specific drawable components
│   ├── physics/
│   │   └── Collision.ts     # Collision detection
│   └── app.ts               # Application entry point
├── public/
│   └── index.html           # Entry HTML
└── package.json
```

### Module Responsibilities

#### Game Logic (`src/game/`)
- **Game.ts**: Orchestrates the game loop, manages update/render cycle
- **Player.ts**: Turtle state, position, speed, movement bounds
- **FallingObject.ts**: Object state, velocity, position updates
- **GameState.ts**: Score, level, active objects, game status (playing/paused/over)

#### Input (`src/input/`)
- **InputHandler.ts**: Converts keyboard events to player actions
- Exposes clean interface: `moveLeft()`, `moveRight()`, `pause()`
- Handles key debouncing to prevent input buffering

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
- **Language**: TypeScript (for type safety)
- **Build Tool**: Vite (fast dev server, optimized builds)
- **Canvas API**: Native browser canvas for rendering
- **Testing**: Vitest + Testing Library for game logic
- **Package Manager**: npm or pnpm

### Development Dependencies
- `typescript` - Type checking
- `vite` - Build and dev server
- `vitest` - Unit testing
- `prettier` - Code formatting
- `eslint` - Code linting

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
- 1 point per object caught (baseline)
- Bonus points for chains (consecutive catches)
- Display current score and high score
- Persist high score to localStorage

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

### Unit Tests
- Game state transitions
- Collision detection edge cases
- Score calculation
- Player movement bounds

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
