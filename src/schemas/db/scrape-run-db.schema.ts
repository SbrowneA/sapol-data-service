import { z } from 'zod';

import { IsoDateTimeWithOffset } from '../domain/iso-with-offset.schema.ts';
import { RunResultEnum } from '../domain/run-result.enum.ts';

export const ScrapeRunMetaDbSchema = z.object({
  deactivated_locations_count: z.int().nullable(),
  existing_locations_count: z.int().nullable(),
  new_locations_count: z.int().nullable()
});

export type ScrapeRunMetaDb = z.infer<typeof ScrapeRunMetaDbSchema>;

export const ScrapeRunDbSchema = z.object({
  scrape_run_id: z.int(),
  run_start: IsoDateTimeWithOffset,
  run_end: IsoDateTimeWithOffset,
  run_result: RunResultEnum,
  created_at: IsoDateTimeWithOffset,
  updated_at: IsoDateTimeWithOffset.nullable(),
  meta: z.object({}).loose()
});

export const ScrapeRunSchemaInsertDb = ScrapeRunDbSchema
  .omit({ scrape_run_id: true, created_at: true, updated_at: true, run_end: true });

export type ScrapeRunDb = z.infer<typeof ScrapeRunDbSchema>;
export type ScrapeRunInsertDb = z.infer<typeof ScrapeRunSchemaInsertDb>;
