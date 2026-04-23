import { Router } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';

import { SupaDatabase } from '../db/sapol-db.service.ts';
import { CameraLocationPipelineService } from '../data-pipeline/camera-location-pipeline.service.ts';

const pipelineRoutes = Router();

// todo
//  - add current job active lock/check
//  - add api key middleware - Checks if client has access to this route (return 401 status if not)
pipelineRoutes.post('/run-camera-pipeline', async (req, res) => {
  const db: SupabaseClient | null = SupaDatabase.getInstance();
  const result = await new CameraLocationPipelineService(db).execute() || {};
  // fixme return straight away and don't wait for pipeline to finish
  res.json(result);
});

export default pipelineRoutes;
