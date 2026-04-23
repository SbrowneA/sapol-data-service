import { Router } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';

import { SupaDatabase } from '../db/sapol-db.service.ts';
import { CameraLocationPipelineService } from '../data-pipeline/camera-location-pipeline.service.ts';
import { DatabaseError } from '../errors/app-error.ts';

const pipelineRoutes = Router();

// todo
//  - add current job active lock/check
//  - add api key middleware - Checks if client has access to this route (return 401 status if not)
pipelineRoutes.post('/run-camera-pipeline', async (req, res) => {
  const db: SupabaseClient | null = SupaDatabase.getInstance();
  if (db) {
    return res.status(200).json({
      message: 'Camera pipeline run has been initiated',
    });

    const result = await new CameraLocationPipelineService(db).execute() || {};
    console.log(result);
  } else {
    throw new DatabaseError('Database Is not available');
  }
});

export default pipelineRoutes;
