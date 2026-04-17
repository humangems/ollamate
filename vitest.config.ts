import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    globals: false,
    include: ['{src,electron}/**/*.{test,spec}.{ts,tsx}'],
    environmentMatchGlobs: [
      ['src/**/*.test.tsx', 'happy-dom'],
      ['src/redux/**/*.test.ts', 'happy-dom'],
    ],
  },
});
