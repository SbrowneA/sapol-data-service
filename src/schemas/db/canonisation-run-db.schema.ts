import { z } from 'zod';

import { IsoDateTimeWithOffset } from '../domain/iso-with-offset.schema.ts';
import { RunResultEnum } from '../domain/run-result.enum.ts';

export const CanonisationRunDbSchema = z.object({
  canonisation_run_id: z.int(),
  run_result: RunResultEnum,
  // execution timestamps
  run_start: IsoDateTimeWithOffset,
  run_end: IsoDateTimeWithOffset,
  // row/record timestamps
  created_at: IsoDateTimeWithOffset,
  updated_at: IsoDateTimeWithOffset.nullable(),
  meta: z.object({}).loose()
});

export type CanonisationRunDb = z.infer<typeof CanonisationRunDbSchema>;

export const CanonisationRunInsertDbSchema =
  CanonisationRunDbSchema.omit({ canonisation_run_id: true, run_end: true, created_at: true, updated_at: true });

export type CanonisationRunInsertDb = z.infer<typeof CanonisationRunInsertDbSchema>;
