import { z } from 'zod';


/**
 * API Response Schemas (FE)
 * @see MobileSpeedCameraLocationSchema for BE
 * @see MobileSpeedCameraLocationsDbSchema for DB
 */
export const MobileCameraLocationResponseSchema = z.object({
  location: z.string(),
  // ISO string
  lastUpdatedAt: z.iso.datetime(),
  // TODO geolocation details
});

export const CameraLocationsByDayResponseSchema = z.object({
  date: z.iso.date(),
  lastUpdatedAt: z.iso.datetime(),
  totalCount: z.number().int().nonnegative(),
  metro: z.array(MobileCameraLocationResponseSchema),
  country: z.array(MobileCameraLocationResponseSchema)
}).refine(
  (d) => d.totalCount === d.metro.length + d.country.length,
  { message: 'totalCount must equal metro + country count' }
);

export const MobileSpeedCameraLocationResponseSchema = z.object({
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  days: z.array(CameraLocationsByDayResponseSchema)
}).refine((d) => d.startDate <= d.endDate, {
  message: 'startDate must be <= endDate',
}).refine((d) => d.days.length > 0, {
  message: 'days must not be empty',
});

export type MobileCameraLocationResponse = z.infer<typeof MobileCameraLocationResponseSchema>;
export type MobileCameraLocationResultsByDayResponse = z.infer<typeof CameraLocationsByDayResponseSchema>;
export type MobileCameraLocationsResponse = z.infer<typeof MobileSpeedCameraLocationResponseSchema>;
