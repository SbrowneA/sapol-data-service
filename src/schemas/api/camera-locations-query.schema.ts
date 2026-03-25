import { DateTime } from 'luxon';
import { z } from 'zod';

/**
 * Validates an ISO date string expected in yyyy-mm-dd format.
 */
const isoDateSchema = z.string().refine((value) => DateTime.fromISO(value).isValid, {
  message: 'Expected ISO date in yyyy-mm-dd format',
});

/**
 * Validates and normalises the camera locations API query parameters.
 *
 * Accepts either:
 * - `date`
 * - `start_date` and `end_date`
 *
 * Transforms the query into a consistent `{ startDate, endDate }` object.
 */
export const cameraLocationsQuerySchema = z.object({
  date: isoDateSchema.optional(),
  start_date: isoDateSchema.optional(),
  end_date: isoDateSchema.optional(),
}).transform((value) => {
  if (value.date) {
    return {
      startDate: value.date,
      endDate: value.date,
    };
  }

  return {
    startDate: value.start_date,
    endDate: value.end_date,
  };
}).pipe(z.object({
  startDate: isoDateSchema,
  endDate: isoDateSchema,
})).refine((value) => !!value.startDate && !!value.endDate, {
  message: 'a valid "start_date" and "end_date" are required',
  path: ['start_date'],
});

export type CameraLocationsQuery = z.infer<typeof cameraLocationsQuerySchema>;
