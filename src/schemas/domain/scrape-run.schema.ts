import { z } from 'zod';

import { IsoDateTimeWithOffset } from './iso-with-offset.schema.ts';
import { RunResultEnum } from './run-result.enum.ts';

export const ScrapeRunMetaSchema = z.object({
  deactivatedLocationsCount: z.int().nullable(),
  existingLocationsCount: z.int().nullable(),
  newLocationsCount: z.int().nullable()
});

export type ScrapeRunMeta = z.infer<typeof ScrapeRunMetaSchema>;

export const ScrapeRunSchema = z.object({
  scrapeRunId: z.int(),
  runStart: IsoDateTimeWithOffset,
  runEnd: IsoDateTimeWithOffset.nullable(),
  createdAt: IsoDateTimeWithOffset,
  updatedAt: IsoDateTimeWithOffset.nullable(),
  runResult: RunResultEnum,
  meta: z.object({}).loose()
});

export type ScrapeRun = z.infer<typeof ScrapeRunSchema>;
export const ScrapeRunInsertSchema =
  ScrapeRunSchema.omit({ scrapeRunId: true, runEnd: true, createdAt: true, updatedAt: true });

export type ScrapeRunInsert = z.infer<typeof ScrapeRunInsertSchema>;
