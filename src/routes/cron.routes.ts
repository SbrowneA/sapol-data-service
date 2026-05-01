import { Router } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';

import { SupaDatabase } from '../db/sapol-db.service.ts';
import { CameraLocationPipelineService } from '../data-pipeline/camera-location-pipeline.service.ts';
import { AppError, DatabaseError } from '../errors/app-error.ts';
import { cronRequireApiKeyHandler } from '../middleware/cron-require-api-key.ts';
import { env } from '../../env.ts';
import rateLimit from 'express-rate-limit';
import { type CameraPipelineRunDb } from '../schemas/db/camera-pipeline-run-db.schema.ts';

const cronRoutes = Router();

cronRoutes.use(cronRequireApiKeyHandler);

const cronRateLimit = rateLimit({
  windowMs: env.CRON_RATE_LIMIT_WINDOW_MS,
  limit: () => env.CRON_RATE_LIMIT_REQUESTS,
  skip: () => (env.IS_TEST || env.IS_LOCAL),
  message: 'Too only one request allowed within the cooldown window',
});

cronRoutes.post('/camera-pipeline', cronRateLimit, async (req, res) => {
  const db: SupabaseClient | null = SupaDatabase.getInstance(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const pipelineService = new CameraLocationPipelineService(db, env);
  const triggerSource = req.get('Trigger-Source');

  if (db) {
    try {
      // pipeline will run in background
      const newPipelineRun: CameraPipelineRunDb = await pipelineService.execute(triggerSource);

      res.status(200).json({
        message: `Camera pipeline run has been initiated - (Pipeline run id: ${ newPipelineRun.camera_pipeline_run_id })`,
      });
    } catch (err) {
      console.error(err);
      if (err instanceof AppError) {
        res.status(err.statusCode).json({
          message: err.message || 'Camera pipeline failed to trigger',
          error: err,
        });
      } else {
        res.status(500).json({
          message: 'Unexpected server error',
        });
      }
    }

    return;
  } else {
    throw new DatabaseError('Database Is not available');
  }
});

export default cronRoutes;
