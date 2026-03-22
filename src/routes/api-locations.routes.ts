import { Router } from 'express';

import { SupabaseClient } from '@supabase/supabase-js';

import { SupaDatabase } from '../db/sapol-db.service.ts';

const apiLocationsRoutes = Router();
const db: SupabaseClient | null = SupaDatabase.getInstance();

apiLocationsRoutes.get('/', async (req, res) => {
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

  const { data, error } = await db
    .rpc('api_resolved_locations_by_date_range', { q_start_date: startDate, q_end_date: endDate })
    // todo add region filters
    // .eq({ })
    .limit(10);

  if (error) {
    return res.status(500).json({ error });
  }

  return res.json({ locations: { metro: data, country: []}, dateRange: { start_date: startDate, end_date: endDate }});
});

export default apiLocationsRoutes;
