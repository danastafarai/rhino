/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';

// Single source of truth for Vite and Vitest. A standalone vitest.config.ts would take
// precedence over this file rather than merging with it, so build and test resolution could
// silently drift apart — an alias added here would not exist in tests.
export default defineConfig({
  build: {
    // More conservative than Vite's 'modules' default, which is fine: the game is plain
    // TypeScript against browser APIs with no syntax newer than ES2020.
    target: 'es2020',
    sourcemap: true,
  },

  // host: true binds 0.0.0.0 instead of localhost. Without it a phone on the same Wi-Fi
  // cannot reach the dev or preview server at all — the page simply never loads.
  server: {
    host: true,
    port: 5173,
    strictPort: false,
  },

  preview: {
    host: true,
    port: 4173,
    strictPort: false,
  },

  test: {
    globals: true,
    // jsdom is required: GameState touches localStorage and InputHandler dispatches DOM events.
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/types.ts', 'src/vite-env.d.ts', 'src/app.ts'],
    },
  },
});
