import { Router } from 'express';

import { type PostgrestResponse } from '@supabase/postgrest-js';
import { SupabaseClient } from '@supabase/supabase-js';

import { DataMappingService } from '../db/data-mapping.service.ts';
import { SupaDatabase } from '../db/sapol-db.service.ts';
import { type MobileSpeedCameraLocationDb } from '../schemas/db/mobile-speed-camera-location-db.schema.ts';
import { CameraLocationTableService } from '../db/table-services/camera-location-table.service.ts';
import { ScrapeRunTableService } from '../db/table-services/scrape-run-table.service.ts';
import { ScrapingController } from '../scraping/scraping.controller.ts';

const testingRoutes = Router();
const db: SupabaseClient | null = SupaDatabase.getInstance();
const scrapingController = new ScrapingController(db);

const cameraLocationTableManager = new CameraLocationTableService(db);
const scrapeRunTableManager = new ScrapeRunTableService(db);

testingRoutes.get('/', (req, res) => {
  res.json({ message: `main route` });
});

testingRoutes.get('/scrape-runs', async (req, res) => {
  const results = await scrapeRunTableManager.getAll();
  if (results?.error) {
    console.error();
    return res.status(500).json({ error: results.error });
  }

  const parsed = (results?.data || []).map(DataMappingService.scrapeRunDbToBe);
  res.json({ message: `GET SCRAPE RUNS`, scrapeRunsDb: results?.data, parsed });
});

testingRoutes.post('/scrape-and-save', async (req, res) => {
  await scrapingController.scrapeAndSaveResults(res);
});

testingRoutes.get('/locations', async (req, res) => {
  const queryResult =
    (await cameraLocationTableManager.getAll()) || {} as (PostgrestResponse<MobileSpeedCameraLocationDb[]>);
  res.json({
    message: 'all locations',
    queryResult: {
      error: queryResult.error,
      status: queryResult.status,
      statusText: queryResult.statusText,
      count: queryResult.count
    },
    data: queryResult.data
  });
});

testingRoutes.get('/resolved-locations', async (req, res) => {
  const startDate = req.query['start_date'] || "";
  const endDate = req.query['end_date'] || "";
  console.log('startDate', startDate, 'endDate', endDate);

  if (db) {
    if (!startDate || !endDate) {
      res.status(400).json({error: 'a valid "start_date" and "end_date" are required'});
    }
    // todo add region filter
    const {data, error} = await db.rpc('api_resolved_locations_by_date_range', {q_start_date: startDate, q_end_date: endDate}).limit(10)
    if (data) {
      res.json({ resolved: data });
    }
    if (error) {
      res.json({ error: error }).status(500);
    }
  }
});

export default testingRoutes;
