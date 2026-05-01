import { z } from 'zod';

export const RequestMethodEnum = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

export type RequestMethod = z.infer<typeof RequestMethodEnum>;

export const requestMethodValues = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
};
