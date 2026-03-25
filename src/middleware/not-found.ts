import type { RequestHandler } from 'express';

import { NotFoundError } from '../errors/app-error.ts';

/**
 * Converts unmatched routes into a typed not-found error.
 */
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
};
