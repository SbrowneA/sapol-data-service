import { z } from 'zod';
import { RegionTypeEnum } from "../domain/region-type.enum.ts";

/**
 * DB Schemas
 * @see MobileSpeedCameraLocationResponseSchema for FE/API
 * @see MobileSpeedCameraLocationSchema for BE
 */
export const MobileSpeedCameraLocationsDbSchema = z.object({
  id: z.bigint(),
  start_date: z.iso.date(),
  end_date: z.iso.date(),
  location: z.string().min(5),
  region_type: RegionTypeEnum,
  created_at: z.iso.datetime(),
  edited_at: z.iso.datetime().optional(),
  is_active: z.boolean(),
  scrape_run_id: z.int(),
  meta: z.object({
    css_class: z.string().optional(),
    all_scrape_run_ids: z.int().array()
  })
}).refine(record => record.start_date <= record.end_date, {
  message: 'start_date must be <= end_date',
});

export const MobileSpeedCameraLocationsInsertSchemaDb =
  MobileSpeedCameraLocationsDbSchema.omit({ id: true, created_at: true, edited_at: true});


export type MobileSpeedCameraLocationDb = z.infer<typeof MobileSpeedCameraLocationsDbSchema>;
// Defines values that will be inserted into the databaes
export type MobileSpeedCameraLocationInsertDb = z.infer<typeof MobileSpeedCameraLocationsInsertSchemaDb>;