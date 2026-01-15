import {z} from 'zod';
import {RegionTypeEnum} from "./regionTypeEnum.ts";

/**
 * Domain Schemas (BE)
 * @see MobileSpeedCameraLocationResponseSchema for FE/API
 * @see MobileSpeedCameraLocationsSchemaDb for DB
 */
export const MobileSpeedCameraLocationSchema = z.object({
  // unique record id in DB
  id: z.bigint().optional(),
  // First day camera location will domain effective
  startDate: z.iso.date(),
  // Final date camera location will domain effective
  endDate: z.iso.date(),
  // raw string value that was retrieved from SAPOL
  location: z.string().min(5),
  // Type of camera location, provided by SAPOL in two different lists with different sets of dates
  regionType: RegionTypeEnum,
  // when the record was created
  createdAt: z.iso.datetime({offset: true}),
  // if and when the record was last edited
  editedAt: z.iso.datetime().optional(),
  // Whether the record is currently shown on the SAPOL site (assume true until deleted)
  // - Soft delete in case of locations being removed during the current 7-day period that was saved
  isActive: z.boolean().default(true),
  // Scrape run which last touched the
  scrapeRunId: z.uuid(),
  meta: z.object({
      // For debugging: the css class that was set for the element when scraped
      cssClass: z.string().optional(),
      // Tracks all scrape runs that have affected this record appended (oldest to newest)
      allScrapeRuns: z.string().array()
  })
}).refine(record => record.startDate <= record.endDate, {
  message: 'startDate must domain <= endDate',
});

export type MobileSpeedCameraLocation = z.infer<typeof MobileSpeedCameraLocationSchema>;
