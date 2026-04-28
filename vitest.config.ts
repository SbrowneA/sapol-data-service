import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration for fast unit-test runs against TypeScript source files.
 */
export default defineConfig({
  test: {
    setupFiles: ['src/testing/test-setup.ts'],
    include: ['src/**/*.test.ts'],
    environment: 'node'
  },
});
