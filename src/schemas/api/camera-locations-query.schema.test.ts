import { describe, expect, it } from 'vitest';

import { cameraLocationsQuerySchema } from './camera-locations-query.schema.ts';

describe('cameraLocationsQuerySchema', () => {
  it('maps date to startDate and endDate', () => {
    const result = cameraLocationsQuerySchema.parse({
      date: '2026-03-25',
    });

    expect(result).toEqual({
      startDate: '2026-03-25',
      endDate: '2026-03-25',
    });
  });

  it('accepts start_date and end_date', () => {
    const result = cameraLocationsQuerySchema.parse({
      start_date: '2026-03-24',
      end_date: '2026-03-25',
    });

    expect(result).toEqual({
      startDate: '2026-03-24',
      endDate: '2026-03-25',
    });
  });

  it('rejects missing date range values', () => {
    const result = cameraLocationsQuerySchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it('rejects invalid ISO dates', () => {
    const result = cameraLocationsQuerySchema.safeParse({
      start_date: '25-03-2026',
      end_date: '2026-03-25',
    });

    expect(result.success).toBe(false);
  });
});
