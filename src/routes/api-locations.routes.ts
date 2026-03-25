import { Router } from 'express';

import { SupabaseClient } from '@supabase/supabase-js';

import { SupaDatabase } from '../db/sapol-db.service.ts';
import { DatabaseError } from '../errors/app-error.ts';
import { type ApiCameraLocation, type ApiCameraLocationsByRegion } from '../schemas/api/api-speed-camera-locations-for-date-by-region.ts';
import { cameraLocationsQuerySchema } from '../schemas/api/camera-locations-query.schema.ts';
import { regionTypeValues } from '../schemas/domain/region-type.enum.ts';
import { env } from '../../env.ts';

const apiLocationsRoutes = Router();
const db: SupabaseClient | null = SupaDatabase.getInstance();

apiLocationsRoutes.get('/', async (req, res) => {
  const { startDate, endDate } = cameraLocationsQuerySchema.parse(req.query);

  if (!db) {
    throw new DatabaseError('Database connection unavailable');
  }

  // 2 min cache
  res.set('Cache-Control', `public, max-age=${env.API_CACHE_DURATION_S}`);

  const queryParams = {
    q_start_date: startDate,
    q_end_date: endDate
  };

  // Log if max length is met to investigate why
  const maxMetro = 50;
  const maxCountry = 100;
  const [metroResult, countryResult] = await Promise.all([
    db.rpc('api_resolved_locations_by_date_range',
      { ...queryParams, q_region: regionTypeValues.METRO }
    ).limit(maxMetro),
    db.rpc('api_resolved_locations_by_date_range',
      { ...queryParams, q_region: regionTypeValues.COUNTRY }
    ).limit(maxCountry)
  ]);

  if (metroResult.error || countryResult.error) {
    const dbError = metroResult.error || countryResult.error;
    throw new DatabaseError('Failed to fetch camera locations', {
      hint: dbError?.hint,
      code: dbError?.code,
    }, dbError);
  }

  if (metroResult?.data?.length === maxMetro) {
    console.warn(`Metro limit (${maxMetro}) met, there may be missing results`, metroResult?.data?.length);
  }
  if (countryResult?.data?.length === maxCountry ) {
    console.warn(`Country limit (${maxCountry}) met, there may be missing results`, countryResult?.data?.length);
  }

  const response: ApiCameraLocationsByRegion = {
    locations: {
      metro: (metroResult.data || []) as ApiCameraLocation[],
      country: (countryResult.data || []) as ApiCameraLocation[]
    },
    dateRange: { startDate, endDate }
  };

  return res.json(response);
});

export default apiLocationsRoutes;
