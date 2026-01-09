import { z } from 'zod';

/**
 * DB Schemas
 * @see MobileSpeedCameraLocationResponseSchema for FE/API
 * @see MobileSpeedCameraLocationSchema for BE
 */
export const MobileSpeedCameraLocationsSchemaDb = z.object({
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  location: z.string().min(5),
  region_type: z.enum(['METRO', 'COUNTRY']),
  css_class: z.string().optional()
}).refine(record => record.start_date <= record.end_date, {
  message: 'start_date must be <= end_date',
});

export type MobileSpeedCameraLocationDb = z.infer<typeof MobileSpeedCameraLocationsSchemaDb>;