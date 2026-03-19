import { z } from 'zod';
import { ScrapeResultEnum } from '../domain/scrape-run.schema.ts';
import { IsoDateTimeWithOffset } from '../domain/iso-with-offset.schema.ts';

export const LocationResolutionRunDbSchema = z.object({
  resolution_run_id: z.int(),
  run_start: IsoDateTimeWithOffset,
  run_end: IsoDateTimeWithOffset,
  run_result: ScrapeResultEnum,
  created_at: IsoDateTimeWithOffset,
  updated_at: IsoDateTimeWithOffset.nullable()
});
export const LocationResolutionRunInsertDbSchema = LocationResolutionRunDbSchema
  .omit({ resolution_run_id: true, created_at: true, updated_at: true, run_end: true });

export type LocationResolutionRunDb = z.infer<typeof LocationResolutionRunDbSchema>;
export type LocationResolutionRunInsertDb = z.infer<typeof LocationResolutionRunInsertDbSchema>;
