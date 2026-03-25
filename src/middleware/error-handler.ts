import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { AppError, BadRequestError } from '../errors/app-error.ts';

/**
 * Normalises unknown thrown values into an AppError instance.
 * @param err Raw thrown value from route or middleware code.
 * @return A normalised AppError for consistent API responses.
 */
const getErrorPayload = (err: unknown): AppError => {
  if (err instanceof AppError) {
    return err;
  }

  if (err instanceof ZodError) {
    return new BadRequestError('Invalid request', {
      issues: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  return new AppError({
    statusCode: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
    cause: err,
  });
};

/**
 * Final Express error middleware that logs once and returns a standard JSON error body.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const appError = getErrorPayload(err);

  console.error('Request failed', {
    method: req.method,
    path: req.originalUrl,
    code: appError.code,
    statusCode: appError.statusCode,
    details: appError.details,
    cause: err,
  });

  res.status(appError.statusCode).json({
    error: {
      code: appError.code,
      message: appError.message,
      details: appError.details,
    },
  });
};
