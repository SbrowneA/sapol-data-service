import { vi } from 'vitest';
import { mockEnv } from './mock-env.ts';

vi.mock('../../env.ts', () => ({
  env: mockEnv
}));
