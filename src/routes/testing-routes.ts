import {Router} from "express";

import {type PostgrestResponse} from "@supabase/postgrest-js";

import {SapolDataService, SapolScraperService} from "../sapol-scraper.service.ts";
import {DataMappingService} from "../db/data-mapping.service.ts";
import {SupaDatabase} from "../db/sapol-db.service.ts";
import {
  type MobileSpeedCameraLocationDb,
  type MobileSpeedCameraLocationInsertDb
} from "../schemas/db/MobileSpeedCameraLocationsSchemaDb.ts";
import {CameraLocationTableService} from "../db/table-services/camera-location-table.service.ts";
import {ScrapeRunTableService} from "../db/table-services/scrape-run-table.service.ts";
import {MobileSpeedCameraLocationReconciliationService} from "../db/data-reconciliation.service.ts";
import type {ScrapeRunDb} from "../schemas/db/ScrapeRunSchemaDb.ts";
import type {ScrapeRun} from "../schemas/domain/ScrapeRunSchema.ts";
import {DateTime} from "luxon";

const testingRoutes = Router();
const db = SupaDatabase.getInstance();

const cameraLocationTableManager = new CameraLocationTableService(db);
const scrapeRunTableManager = new ScrapeRunTableService(db);

const scraper = new SapolScraperService();
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
  // FIXME refactor - Extract methods & move business logic to SapolDataService or SapolScraper
  const result
    = await scrapeRunTableManager.insertScrapeRun(SapolDataService.generateScrapeRun());

  if (result?.error) {
    res.status(500).json({ message: result.error.message, error: result.error });
    console.error('ERROR: Failed initialising scrape run');
    console.error(result.error);
    return;
  } else if (!result?.data) {
    res.status(500).json({message: 'Something went wrong initiating scrape run'});
    console.error('Something went wrong initiating scrape run');
    return;
  }

  const scrapeRunDb: ScrapeRunDb = result?.data[0] as ScrapeRunDb;
  const scrapeRun: ScrapeRun = DataMappingService.scrapeRunDbToBe(scrapeRunDb);
  console.log('scrape run created & parsed: ', scrapeRun );

  // scrape data
  const scrapeData = await scraper.scrapeLocations(scrapeRun);

  // parse to db datatype
  const dataToSave: MobileSpeedCameraLocationInsertDb[] = scrapeData.locations.map(DataMappingService.cameraLocationBeToDbInsert);

  // 1. group scraped locations into a queryableGroup
  const reconciliationMap = MobileSpeedCameraLocationReconciliationService.generateReconciliationMap(dataToSave);

  reconciliationMap.forEach((val, key) => {
    console.log(`${key} \t scrapedLocations: ${val.scrapedLocations.length}`);
  })

  // 2. query regionType|startDate|endDate
  MobileSpeedCameraLocationReconciliationService.generateDateRangeQueries(reconciliationMap, cameraLocationTableManager);

  // const searchQueryResults = [];
  for(const [key, val] of reconciliationMap) {
    let queryResult: PostgrestResponse<MobileSpeedCameraLocationDb> | null = null;
    if (!!val.query) {
      queryResult = await val.query;
      // searchQueryResults.push(queryResult);
      console.log(`${key}\t${queryResult?.status}\tExisting locations, ${queryResult?.data?.length || 0}`);
    }
    val.existingLocations = queryResult?.data || [];
  }

  console.log('QUERIES RUN');
  // 3. Prepare for reconciliation (compare with existing records)
  // 3.1 Find records toInsert, toUpdate, and toDeactivate
  const toInsert: MobileSpeedCameraLocationInsertDb[] = [];
  const toUpdate: MobileSpeedCameraLocationDb[] = [];
  const toDeactivate: MobileSpeedCameraLocationDb[] = [];
  const scrapeRunId = scrapeData.scrapeRun.scrapeRunId;

  reconciliationMap.forEach((val, key) => {
    //  find records to be deactivated
    val.existingLocations.forEach((loc: MobileSpeedCameraLocationDb) => {
      const key = cameraLocationTableManager.getBusinessKeyDb(loc);
      const foundScraped: MobileSpeedCameraLocationInsertDb | undefined = val.scrapedLocations
        .find((s) => cameraLocationTableManager.getBusinessKeyDb(s) === key);

      if (!foundScraped) {
        toDeactivate.push();
      }
    });

    val.scrapedLocations.forEach((scrapedLocation: MobileSpeedCameraLocationInsertDb) => {
      const key = cameraLocationTableManager.getBusinessKeyDb(scrapedLocation);
      const foundRecord: MobileSpeedCameraLocationDb | undefined = val.existingLocations
        .find((e) => cameraLocationTableManager.getBusinessKeyDb(e) === key);

      if (foundRecord) {
        toUpdate.push(foundRecord);
      } else {
        toInsert.push(scrapedLocation);
      }
    });
  });

  // 4. Execute reconciliation (Updates & Insertions)
  // 4.1 Deactivate - records that are NOT found in the scraped locations
  const deactivated = toDeactivate.map(location => {
    return {
      ...location,
      is_active: false,
      scrape_run_id: scrapeRunId,
      meta: {
        ...location.meta,
        all_scrape_run_ids: [...location.meta.all_scrape_run_ids, scrapeRunId]
      }
    };
  });

  // todo remove try-catches (not required with supabase queries)
  try {
    console.log(`Deactivating...`);
    if(deactivated.length) {
      const result = await cameraLocationTableManager.updateLocations(deactivated);
      console.log(`${toUpdate.length} locations updated, Result: ${result?.status}, ${result?.statusText}`);
      if (result?.error){
        console.error(result.error);
      }
    } else {
      console.log('No locations to deactivate');
    }
  } catch (err) {
    console.log(err);
  }

  // 4.2 Update - records that are in the scraped locations
  const newValues: MobileSpeedCameraLocationDb[] = toUpdate.map((location: MobileSpeedCameraLocationDb)=> {
    return {
      ...location,
      is_active: true,
      scrape_run_id: scrapeRunId,
      meta: {
        ...location.meta,
        all_scrape_run_ids: [...location.meta.all_scrape_run_ids, scrapeRunId]
      }
    };
  });

  try {
    console.log(`Updating...`);
    if (toUpdate.length) {
      const result = await cameraLocationTableManager.updateLocations(newValues);
      console.log(`${toUpdate.length} locations updated, Result: ${result?.status}, ${result?.statusText}`);
      if (result?.error){
        console.error(result.error);
      }
    } else {
      console.log(`No locations to update...`);
    }
  } catch (err) {
    console.log(err);
  }

  // 4.3 Insert new scraped locations
  try {
    console.log(`Inserting...`);

    if (toInsert.length) {
      const result = await cameraLocationTableManager.insertLocations(toInsert);
      console.log(`${toInsert.length} locations inserted, Result: ${result?.status}, ${result?.statusText}`);
      if (result?.error){
        console.error(result.error);
      }
    } else {
      console.log('No locations to insert');
    }
  } catch (err) {
    console.log(err);
  }

  scrapeRun.runEnd = DateTime.utc().toISO();
  scrapeRun.runResult = 'SUCCESS';
  // TODO error handling
  await scrapeRunTableManager.updateScrapeRun(DataMappingService.scrapeRunBeToDb(scrapeRun));
  console.log('SCRAPE RUN COMPLETE', result?.status);

  res.json({message: 'queries run', scrapeData: Array.from(reconciliationMap), toDeactivate, toUpdate, toInsert});
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

export default testingRoutes;
