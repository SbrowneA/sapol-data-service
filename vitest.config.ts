import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration for fast unit-test runs against TypeScript source files.
 */
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
