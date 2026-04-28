import { Router } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';

import { SupaDatabase } from '../db/sapol-db.service.ts';
import { CameraLocationPipelineService } from '../data-pipeline/camera-location-pipeline.service.ts';
import { DatabaseError } from '../errors/app-error.ts';
import { cronRequireApiKeyHandler } from '../middleware/cron-require-api-key.ts';
import { env } from '../../env.ts';

const cronRoutes = Router();

// todo
//  - add current job active lock/check
cronRoutes.use(cronRequireApiKeyHandler);

cronRoutes.post('/camera-pipeline', async (req, res) => {
  const db: SupabaseClient | null = SupaDatabase.getInstance(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (db) {
    res.status(200).json({
      message: 'Camera pipeline run has been initiated',
    });

    const result = await new CameraLocationPipelineService(db, env).execute() || {};
    console.log('camera pipeline complete\n', result);
    return;
  } else {
    throw new DatabaseError('Database Is not available');
  }
});

export default cronRoutes;
