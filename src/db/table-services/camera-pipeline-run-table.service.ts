import { SupabaseClient } from '@supabase/supabase-js';

import { GenericTableService } from './generic-table.service.ts';
import type { CameraPipelineRunDb, CameraPipelineRunInsertDb } from '../../schemas/db/camera-pipeline-run-db.schema.ts';
import { type Env } from '../../../env.schema.ts';


export class CameraPipelineRunTableService extends GenericTableService<CameraPipelineRunDb, CameraPipelineRunInsertDb> {
  env: Env;

  constructor(db: SupabaseClient | null, env: Env) {
    super(
      'camera_pipeline_run',
      'camera_pipeline_run_id',
      db);
    this.env = env;
  }

  /**
   * Checks if there is an existing record that is in "PENDING" status within the active interval.
   */
  getCurrentRunningPipeline() {
    const cutoff = new Date(Date.now() - this.env.CAMERA_PIPELINE_ACTIVE_WINDOW_MS).toISOString();
    console.log('search interval (after)', cutoff);
    return this.db.from(this.tableName)
      .select('*')
      .eq('run_result', 'PENDING')
      .gte(`created_at`, cutoff)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle<CameraPipelineRunDb>();
  }
}
