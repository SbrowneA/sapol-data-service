import { Router } from 'express';

import { SupabaseClient } from '@supabase/supabase-js';

import { SupaDatabase } from '../db/sapol-db.service.ts';
import { type ApiCameraLocation, type ApiCameraLocationsByRegion } from '../schemas/api/api-speed-camera-locations-for-date-by-region.ts';
import { regionTypeValues } from '../schemas/domain/region-type.enum.ts';
import { env } from '../../env.ts';

const apiLocationsRoutes = Router();
const db: SupabaseClient | null = SupaDatabase.getInstance();

apiLocationsRoutes.get('/', async (req, res) => {
  // 2 min cache
  res.set('Cache-Control', `public, max-age=${env.API_CACHE_DURATION_S}`);
  let startDate = `${req.query['start_date'] || ''}`;
  let endDate = `${req.query['end_date'] || ''}`;
  const date = `${req.query['date'] || ''}`;

  if ((!startDate || !endDate) && date) {
    startDate = date;
    endDate = date;
  }

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'a valid "start_date" and "end_date" are required' });
  }

  if (!db) {
    return res.status(500).json({ error: 'database connection unavailable' });
  }

  const queryParams = {
    q_start_date: startDate,
    q_end_date: endDate
  };

  const [metroResult, countryResult] = await Promise.all([
    db.rpc('api_resolved_locations_by_date_range',
      { ...queryParams, q_region: regionTypeValues.METRO }
    ).limit(200),
    db.rpc('api_resolved_locations_by_date_range',
      { ...queryParams, q_region: regionTypeValues.COUNTRY }
    ).limit(200)
  ]);

  if (metroResult.error || countryResult.error) {
    return res.status(500).json({ error: metroResult.error || countryResult.error });
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
