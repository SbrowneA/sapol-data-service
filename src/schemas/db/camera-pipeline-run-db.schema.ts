import { z } from 'zod';

import { IsoDateTimeWithOffset } from '../domain/iso-with-offset.schema.ts';
import { RunResultEnum } from '../domain/run-result.enum.ts';

export const CameraPipelineRunDbSchema = z.object({
  camera_pipeline_run_id: z.int(),
  scrape_run_id: z.int().nullable(),
  canonisation_run_id: z.int().nullable(),
  resolution_run_id: z.int().nullable(),
  run_result: RunResultEnum,
  // execution timestamps
  run_start: IsoDateTimeWithOffset,
  run_end: IsoDateTimeWithOffset,
  // row/record timestamps
  created_at: IsoDateTimeWithOffset,
  updated_at: IsoDateTimeWithOffset.nullable(),
  meta: z.object({}).loose()
});

export type CameraPipelineRunDb = z.infer<typeof CameraPipelineRunDbSchema>;

export const CameraPipelineRunInsertDbSchema =
  CameraPipelineRunDbSchema.omit({
    camera_pipeline_run_id: true,
    run_end: true,
    created_at: true,
    updated_at: true,
    scrape_run_id: true,
    canonisation_run_id: true,
    resolution_run_id: true,
  });

export type CameraPipelineRunInsertDb = z.infer<typeof CameraPipelineRunInsertDbSchema>;
