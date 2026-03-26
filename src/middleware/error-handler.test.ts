import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { AppError } from '../errors/app-error.ts';
import { errorHandler } from './error-handler.ts';

type MockResponse = {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};

const createResponse = (): MockResponse => {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
  };

  response.status.mockReturnValue(response);

  return response;
};

describe('errorHandler', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the provided AppError response shape', () => {
    const res = createResponse();
    const req = { method: 'GET', originalUrl: '/api/camera-locations' };
    const next = vi.fn();
    const error = new AppError({
      statusCode: 409,
      code: 'CONFLICT',
      message: 'Conflict occurred',
      details: { id: 1 },
    });

    // prevent error logs
    vi.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(error, req as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'CONFLICT',
        message: 'Conflict occurred',
        details: { id: 1 },
      },
    });
  });

  it('maps ZodError to a bad request response', () => {
    const res = createResponse();
    const req = { method: 'GET', originalUrl: '/api/camera-locations?date=invalid' };
    const next = vi.fn();
    const schema = z.object({ date: z.iso.date() });
    const result = schema.safeParse({ date: 'invalid' });

    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(result.success).toBe(false);

    errorHandler(result.error, req as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid request',
        details: {
          issues: [{
            path: 'date',
            message: 'Invalid ISO date',
          }],
        },
      },
    });
  });

  it('maps unknown errors to an internal server error response', () => {
    const res = createResponse();
    const req = { method: 'GET', originalUrl: '/api/camera-locations' };
    const next = vi.fn();

    vi.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(new Error('boom'), req as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
        details: undefined,
      },
    });
  });
});
