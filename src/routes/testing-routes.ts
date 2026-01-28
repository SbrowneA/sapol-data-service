import {Router} from "express";

import {type PostgrestResponse} from "@supabase/postgrest-js";
import {SupabaseClient} from "@supabase/supabase-js";

import {DataMappingService} from "../db/data-mapping.service.ts";
import {SupaDatabase} from "../db/sapol-db.service.ts";
import {type MobileSpeedCameraLocationDb} from "../schemas/db/mobile-speed-camera-location-db.schema.ts";
import {CameraLocationTableService} from "../db/table-services/camera-location-table.service.ts";
import {ScrapeRunTableService} from "../db/table-services/scrape-run-table.service.ts";
import {ScrapingController} from "../scraping/scraping.controller.ts";

const testingRoutes = Router();
const db: SupabaseClient | null = SupaDatabase.getInstance();
const scrapingController = new ScrapingController(db);

const cameraLocationTableManager = new CameraLocationTableService(db);
const scrapeRunTableManager = new ScrapeRunTableService(db);

testingRoutes.get("/", (req, res) => {
  res.json({message: `main route`});
});

testingRoutes.get("/data", (req, res) => {
  // todo
  res.json({message: `GET DATA`});
});

testingRoutes.get("/scrape-runs", async (req, res) => {
  const results = await scrapeRunTableManager.getAll();
  if (results?.error) {
    console.error()
    return res.status(500).json({ error: results.error });
  }

  const parsed = (results?.data || []).map(DataMappingService.scrapeRunDbToBe);
  res.json({message: `GET SCRAPE RUNS`, scrapeRunsDb: results?.data, parsed });
});

testingRoutes.get("/save", async (req, res) => {
  await scrapingController.scrapeAndSaveResults(res);
});

testingRoutes.get('/locations', async (req, res) => {
  const queryResult = (await cameraLocationTableManager.getAllLocations()) || {} as (PostgrestResponse<MobileSpeedCameraLocationDb[]>);
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

/**
 * Endpoint to normalise all speed camera locations to have street_norm and suburb_norm
 */
testingRoutes.get('/normalise-all', async (req, res) => {
  const result
    = (await cameraLocationTableManager.getAllLocations()) || {} as PostgrestResponse<MobileSpeedCameraLocationDb[]>;

  if (result?.error) {
    res.status(500).json({error: result.error});
  }

  const toUpdate: MobileSpeedCameraLocationDb[] = (result.data || [])
    // only update missing values
    .filter(l => !l.street_norm || !l.suburb_norm)
    .map((location: MobileSpeedCameraLocationDb) => {
    const [street = '', suburb = ''] = location.location.toUpperCase().split(',');
    console.log(location.location, ';', street, suburb);

    return {
      ...location,
      street_norm: location.street_norm || street.trim(),
      suburb_norm: location.suburb_norm || suburb.trim()
    };
  });

  const updatedResult = await cameraLocationTableManager.updateLocations(toUpdate) || {} as PostgrestResponse<MobileSpeedCameraLocationDb[]>;

  res.json({
    data: result?.data || [],
    toUpdate: toUpdate,
    updated: updatedResult.data,
    updateStatus: updatedResult.status,
    error: updatedResult.error
  });
});

export default testingRoutes;
