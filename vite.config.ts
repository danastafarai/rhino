import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    target: 'ES2020',
    minify: 'terser',
    sourcemap: true,
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true,
  },
});
