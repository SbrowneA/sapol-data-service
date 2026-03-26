import { describe, expect, it } from 'vitest';

import { AppError, BadRequestError, DatabaseError, NotFoundError } from './app-error.ts';

describe('AppError classes', () => {
  it('creates a base AppError with the provided values', () => {
    const error = new AppError({
      statusCode: 418,
      code: 'TEST_ERROR',
      message: 'Test message',
      details: { flag: true },
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(418);
    expect(error.code).toBe('TEST_ERROR');
    expect(error.message).toBe('Test message');
    expect(error.details).toEqual({ flag: true });
  });

  it('creates a BadRequestError with the expected defaults', () => {
    const error = new BadRequestError('Invalid input', { field: 'date' });

    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('BAD_REQUEST');
    expect(error.details).toEqual({ field: 'date' });
  });

  it('creates a DatabaseError with the expected defaults', () => {
    const error = new DatabaseError();

    expect(error.statusCode).toBe(503);
    expect(error.code).toBe('DATABASE_ERROR');
    expect(error.message).toBe('Database unavailable');
  });

  it('creates a NotFoundError with the expected defaults', () => {
    const error = new NotFoundError();

    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Resource not found');
  });
});
