import { z } from 'zod';

/**
 * Domain Schemas (BE)
 * @see MobileSpeedCameraLocationResponseSchema for FE/API
 * @see MobileSpeedCameraLocationsSchemaDb for DB
 */
export const MobileSpeedCameraLocationSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  location: z.string().min(5),
  regionType: z.enum(['METRO', 'COUNTRY']),
  createdAt: z.iso.datetime(),
  editedAt: z.iso.datetime(),
  meta: z.object({
      cssClass: z.string().optional()
  })
}).refine(record => record.startDate <= record.endDate, {
  message: 'startDate must be <= endDate',
});

export type MobileSpeedCameraLocation = z.infer<typeof MobileSpeedCameraLocationSchema>;
