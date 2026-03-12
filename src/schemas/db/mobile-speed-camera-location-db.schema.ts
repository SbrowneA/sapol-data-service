import { z } from 'zod';
import { RegionTypeEnum } from "../domain/region-type.enum.ts";

/**
 * DB Schemas
 * @see MobileSpeedCameraLocationResponseSchema for FE/API
 * @see MobileSpeedCameraLocationSchema for BE
 */
export const MobileSpeedCameraLocationDbSchema = z.object({
  id: z.bigint(),
  start_date: z.iso.date(),
  end_date: z.iso.date(),
  location: z.string().min(5),
  // With the street type (RD/ROAD)
  street_norm: z.string().min(3),
  suburb_norm: z.string().min(3),
  street_full_canon: z.string().min(2),
  // Without street type
  street_name_canon: z.string().min(2),
  // the value of the mapped canonical key for the street type (e.g. Rd. -> ROAD)
  street_type_canon: z.string().min(2),
  direction_suffix_canon: z.string().min(4),
  region_type: RegionTypeEnum,
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime().optional(),
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
  MobileSpeedCameraLocationDbSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    street_full_canon: true,
    street_name_canon: true,
    street_type_canon: true,
    direction_suffix_canon: true
  });


export type MobileSpeedCameraLocationDb = z.infer<typeof MobileSpeedCameraLocationDbSchema>;
// Defines values that will be inserted into the databaes
export type MobileSpeedCameraLocationInsertDb = z.infer<typeof MobileSpeedCameraLocationsInsertSchemaDb>;