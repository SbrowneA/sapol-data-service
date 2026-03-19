import { z } from 'zod';


/**
 * API Response Schemas (FE)
 * @see MobileSpeedCameraLocationSchema for BE
 * @see MobileSpeedCameraLocationsDbSchema for DB
 */
export const CameraLocationApiSchema = z.object({
  location: z.string(),
  // ISO string
  lastUpdatedAt: z.iso.datetime(),
  // TODO install geolocation types GeoJSON
  geom: z.object()
});

export const CameraLocationsByDayApiSchema = z.object({
  date: z.iso.date(),
  lastUpdatedAt: z.iso.datetime(),
  totalCount: z.number().int().nonnegative(),
  metro: z.array(CameraLocationApiSchema),
  country: z.array(CameraLocationApiSchema)
}).refine(
  (d) => d.totalCount === d.metro.length + d.country.length,
  { message: 'totalCount must equal metro + country count' }
);

export const MobileSpeedCameraLocationsApiSchema = z.object({
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  days: z.array(CameraLocationsByDayApiSchema)
}).refine((d) => d.startDate <= d.endDate, {
  message: 'startDate must be <= endDate',
}).refine((d) => d.days.length > 0, {
  message: 'days must not be empty',
});

export type MobileCameraLocationResponse = z.infer<typeof CameraLocationApiSchema>;
export type MobileCameraLocationResultsByDayResponse = z.infer<typeof CameraLocationsByDayApiSchema>;
export type MobileCameraLocationsResponse = z.infer<typeof MobileSpeedCameraLocationsApiSchema>;
