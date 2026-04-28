import type { Request, Response, NextFunction } from 'express';
import { env } from '../../env.ts';
import { type RequestMethod } from '../schemas/domain/request-method.enum.ts';

/**
 * Validates the cron job request has a valid api key and method is permitted
 * @param req
 * @param res
 * @param next
 */
export function cronRequireApiKeyHandler(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !env.CRON_API_KEYS.includes(token || '')) {
    return res.status(403).json({ error: 'Invalid API key' });
  }
  if (!env.CRON_ALLOWED_METHODS.includes(req.method as RequestMethod)) {
    return res.status(401).json({ error: `Method not allowed: ${req.method}` });
  }

  next();
}
