import { vi } from 'vitest';
import { Env } from '../../env.schema.ts';

export type MockResponse = {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};

export const createMockResponse = (): MockResponse => {
  const response: any = {};
  response.status = vi.fn().mockImplementation(() => response);
  response.json = vi.fn().mockImplementation(() => response);
  return response;
};


export const createMockEnv: (options: { env: Env, envOverride?: Partial<Env> }) => Env =
  (options) => {
    return {
      ...(options.env || {}),
      ...(options.envOverride || {})
    } as Env;
  };
