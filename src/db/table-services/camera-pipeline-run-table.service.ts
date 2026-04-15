import { SupabaseClient } from '@supabase/supabase-js';

import { GenericTableService } from './generic-table.service.ts';
import type { CameraPipelineRunDb, CameraPipelineRunInsertDb } from '../../schemas/db/camera-pipeline-run-db.schema.ts';

export class CameraPipelineRunTableService extends GenericTableService<CameraPipelineRunDb, CameraPipelineRunInsertDb> {
  constructor(db: SupabaseClient | null) {
    super(
      'camera_pipeline_run',
      'camera_pipeline_run_id',
      db);
  }
}
