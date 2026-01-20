import {type Response} from "express";

import {SupabaseClient} from "@supabase/supabase-js";

import {CameraLocationTableService} from "../db/table-services/camera-location-table.service.ts";
import {ScrapeRunTableService} from "../db/table-services/scrape-run-table.service.ts";
import {SapolDataService, SapolScraperService} from "../sapol-scraper.service.ts";
import {type ScrapeRunDb} from "../schemas/db/scrape-run-db.schema.ts";
import {type ScrapeRun} from "../schemas/domain/scrape-run.schema.ts";
import {DataMappingService} from "../db/data-mapping.service.ts";
import {
  MobileSpeedCameraLocationDb,
  type MobileSpeedCameraLocationInsertDb
} from "../schemas/db/mobile-speed-camera-locations-db.schema.ts";
import {MobileSpeedCameraLocationReconciliationService} from "../db/data-reconciliation.service.ts";
import {DateTime} from "luxon";
import {PostgrestResponse} from "@supabase/postgrest-js";

export class ScrapingController {
  db: SupabaseClient;
  cameraLocationTableManager: CameraLocationTableService;
  scrapeRunTableManager: ScrapeRunTableService;
  sapolScraperService: SapolScraperService;

  constructor(db: SupabaseClient | null) {
    if (!db) {
      throw new Error('Database is not initialised.');
    }
    this.db = db;
    this.scrapeRunTableManager = new ScrapeRunTableService(this.db);
    this.cameraLocationTableManager = new CameraLocationTableService(this.db);
    this.sapolScraperService = new SapolScraperService();
  }

  async scrapeAndSaveResults(res: Response) {
    // FIXME refactor - Extract methods & move business logic to SapolDataService or SapolScraper
    const result
      = await this.scrapeRunTableManager.insertScrapeRun(SapolDataService.generateScrapeRun());

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
    const scrapeData = await this.sapolScraperService.scrapeLocations(scrapeRun);

    // parse to db datatype
    const dataToSave: MobileSpeedCameraLocationInsertDb[] = scrapeData.locations.map(DataMappingService.cameraLocationBeToDbInsert);

    // 1. group scraped locations into a queryableGroup
    const reconciliationMap = MobileSpeedCameraLocationReconciliationService.generateReconciliationMap(dataToSave);

    reconciliationMap.forEach((val, key) => {
      console.log(`${key} \t scrapedLocations: ${val.scrapedLocations.length}`);
    })

    // 2. query regionType|startDate|endDate
    MobileSpeedCameraLocationReconciliationService.generateDateRangeQueries(reconciliationMap, this.cameraLocationTableManager);

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
        const key = this.cameraLocationTableManager.getBusinessKeyDb(loc);
        const foundScraped: MobileSpeedCameraLocationInsertDb | undefined = val.scrapedLocations
          .find((s) => this.cameraLocationTableManager.getBusinessKeyDb(s) === key);

        if (!foundScraped) {
          toDeactivate.push();
        }
      });

      val.scrapedLocations.forEach((scrapedLocation: MobileSpeedCameraLocationInsertDb) => {
        const key = this.cameraLocationTableManager.getBusinessKeyDb(scrapedLocation);
        const foundRecord: MobileSpeedCameraLocationDb | undefined = val.existingLocations
          .find((e) => this.cameraLocationTableManager.getBusinessKeyDb(e) === key);

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
        const result = await this.cameraLocationTableManager.updateLocations(deactivated);
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
        const result = await this.cameraLocationTableManager.updateLocations(newValues);
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
        const result = await this.cameraLocationTableManager.insertLocations(toInsert);
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
    await this.scrapeRunTableManager.updateScrapeRun(DataMappingService.scrapeRunBeToDb(scrapeRun));
    console.log('SCRAPE RUN COMPLETE', result?.status);

    res.json({message: 'queries run', scrapeData: Array.from(reconciliationMap), toDeactivate, toUpdate, toInsert});
  }
}