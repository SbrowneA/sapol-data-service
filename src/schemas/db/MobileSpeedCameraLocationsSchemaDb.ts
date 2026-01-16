import { z } from 'zod';
import { RegionTypeEnum } from "../domain/regionTypeEnum.ts";

/**
 * DB Schemas
 * @see MobileSpeedCameraLocationResponseSchema for FE/API
 * @see MobileSpeedCameraLocationSchema for BE
 */
export const MobileSpeedCameraLocationsSchemaDb = z.object({
  id: z.bigint(),
  start_date: z.iso.date(),
  end_date: z.iso.date(),
  location: z.string().min(5),
  region_type: RegionTypeEnum,
  created_at: z.iso.datetime(),
  edited_at: z.iso.datetime().optional(),
  is_active: z.boolean(),
  scrape_run_id: z.uuid(),
  meta: z.object({
    css_class: z.string().optional(),
    all_scrape_run_ids: z.string().array()
  })
}).refine(record => record.start_date <= record.end_date, {
  message: 'start_date must be <= end_date',
});

export const MobileSpeedCameraLocationsInsertSchemaDb =
  MobileSpeedCameraLocationsSchemaDb.omit({ id: true, created_at: true, edited_at: true});


export type MobileSpeedCameraLocationDb = z.infer<typeof MobileSpeedCameraLocationsSchemaDb>;
// Defines values that will be inserted into the databaes
export type MobileSpeedCameraLocationInsertDb = z.infer<typeof MobileSpeedCameraLocationsInsertSchemaDb>;