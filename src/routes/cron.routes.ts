import { Router } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';

import { SupaDatabase } from '../db/sapol-db.service.ts';
import { CameraLocationPipelineService } from '../data-pipeline/camera-location-pipeline.service.ts';
import { DatabaseError } from '../errors/app-error.ts';
import { cronRequireApiKeyHandler } from '../middleware/cron-require-api-key.ts';
import { env } from '../../env.ts';
import rateLimit from 'express-rate-limit';

const cronRoutes = Router();

// todo
//  - add current job active lock/check
cronRoutes.use(cronRequireApiKeyHandler);

const cronRateLimit = rateLimit({
  windowMs: env.CRON_RATE_LIMIT_WINDOW_MS,
  limit: () => env.CRON_RATE_LIMIT_REQUESTS,
  skip: () => (env.IS_TEST || env.IS_LOCAL),
  message: 'Too only one request allowed within the cooldown window',
});

cronRoutes.post('/camera-pipeline', cronRateLimit, async (req, res) => {
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
