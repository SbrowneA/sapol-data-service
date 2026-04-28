import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockEnv } from '../testing/mock-env.ts';
import { Env } from '../../env.schema.ts';
import { createMockEnv, createMockResponse, MockResponse } from '../testing/testing-utils.ts';
import { cronRequireApiKeyHandler } from './cron-require-api-key.ts';

describe('cronRequireApiKeyHandler', () => {
  let next: () => void;
  const cronTestKey = 'cron-test-key';
  const envOverride: Partial<Env> = {
    CRON_API_KEYS: [cronTestKey],
    CRON_ALLOWED_METHODS: ['GET'],
  };

  let res: MockResponse;
  beforeEach(async () => {
    vi.resetAllMocks();
    vi.doMock('../..env.ts', () => ({
      env: createMockEnv({
        env: mockEnv,
        envOverride: envOverride
      })
    }));
    next = vi.fn();
    res = createMockResponse();
  });

  it('should return 401 error if no auth header is provided', () => {
    const req = { method: 'POST', headers: { } };

    const result = cronRequireApiKeyHandler(req as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing Authorization header' });
    expect(result).toEqual(res);
  });

  it('should return 401 error if no API key is provided', () => {
    const req = { method: 'POST', headers: { authorization: `Bearer ${cronTestKey}` } };

    const result = cronRequireApiKeyHandler(req as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: `Method not allowed: POST` });
    expect(result).toEqual(res);
  });

  it('should return 403 error if the API key is invalid', () => {
    const req = { method: 'GET', headers: { authorization: 'Bearer invalid-key' } };

    const result = cronRequireApiKeyHandler(req as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid API key' });
    expect(result).toEqual(res);
  });

  it('should call next() if the request is valid', () => {
    const req = { method: 'GET', headers: { authorization: `Bearer ${cronTestKey}` } };
    vi.spyOn(console, 'error');

    const result = cronRequireApiKeyHandler(req as never, res as never, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
