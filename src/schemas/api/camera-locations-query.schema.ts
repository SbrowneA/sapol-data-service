import { z } from 'zod';

/**
 * Validates an ISO date string expected in yyyy-mm-dd format.
 */
const isoDateSchema = z.iso.date();

/**
 * Validates and normalises the camera locations API query parameters.
 *
 * Accepts:
 * - `date`
 * - `start_date` and `end_date`
 *
 * Processing order:
 * 1. Parse individual fields as ISO dates in yyyy-mm-dd format when present.
 * 2. Refine the full input so it contains either `date` or both `start_date`
 *    and `end_date`, but never a mix.
 * 3. Refine the date range so `start_date <= end_date` when using range mode.
 * 4. Transform the validated input into a consistent `{ startDate, endDate }`
 *    object.
 */
export const cameraLocationsQuerySchema = z.object({
  date: isoDateSchema.optional(),
  start_date: isoDateSchema.optional(),
  end_date: isoDateSchema.optional(),
}).superRefine((value, ctx) => {
  const hasDate = !!value.date;
  const hasStartDate = !!value.start_date;
  const hasEndDate = !!value.end_date;
  const hasRange = hasStartDate || hasEndDate;

  // No mixed values date + start_date/end_date
  if (hasDate && hasRange) {
    ctx.addIssue({
      code: 'custom',
      message: 'use either "date" or both "start_date" and "end_date"',
      path: ['start_date'],
    });
    ctx.addIssue({
      code: 'custom',
      message: 'use either "date" or both "start_date" and "end_date"',
      path: ['end_date'],
    });
    return;
  }

  // only date is provided
  if (hasDate) {
    return;
  }

  // start_date is missing
  if (!hasStartDate) {
    ctx.addIssue({
      code: 'custom',
      message: 'a valid "start_date" is required',
      path: ['start_date'],
    });
  }

  // end_date is missing
  if (!hasEndDate) {
    ctx.addIssue({
      code: 'custom',
      message: 'a valid "end_date" is required',
      path: ['end_date'],
    });
  }

  if (value.start_date && value.end_date && value.start_date > value.end_date) {
    ctx.addIssue({
      code: 'custom',
      message: '"start_date" must be less than or equal to "end_date"',
      path: ['start_date'],
    });
  }
}).transform((value) => ({
  startDate: value.start_date ?? value.date!,
  endDate: value.end_date ?? value.date!,
}));

export type CameraLocationsQuery = z.infer<typeof cameraLocationsQuerySchema>;
