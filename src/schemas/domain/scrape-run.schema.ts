import { z } from 'zod';

import { IsoDateTimeWithOffset } from './iso-with-offset.schema.ts';

export const ScrapeResultEnum = z.enum(['SUCCESS', 'FAIL', 'PENDING']);

export type ScrapeRunResult = z.infer<typeof ScrapeRunSchema>;

export const ScrapeRunSchema = z.object({
  scrapeRunId: z.int(),
  runStart: IsoDateTimeWithOffset,
  runEnd: IsoDateTimeWithOffset.nullable(),
  createdAt: IsoDateTimeWithOffset,
  updatedAt: IsoDateTimeWithOffset.nullable(),
  runResult: ScrapeResultEnum
});

export type ScrapeRun = z.infer<typeof ScrapeRunSchema>;
export const ScrapeRunInsertSchema =
  ScrapeRunSchema.omit({ scrapeRunId: true, runEnd: true, createAt: true, updatedAt: true });

export type ScrapeRunInsert = z.infer<typeof ScrapeRunInsertSchema>;
