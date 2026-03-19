import { SupabaseClient } from '@supabase/supabase-js';
import { type PostgrestResponse } from '@supabase/postgrest-js';
import { DateTime } from 'luxon';

import { SapolDataService, SapolScraperService } from './sapol-scraper.service.ts';
import { ScrapeRunTableService } from '../db/table-services/scrape-run-table.service.ts';
import { CameraLocationTableService } from '../db/table-services/camera-location-table.service.ts';
import { MobileSpeedCameraLocationReconciliationService, type ReconciliationMap } from '../db/data-reconciliation.service.ts';
import { type ScrapeRun } from '../schemas/domain/scrape-run.schema.ts';
import { type ScrapeRunDb } from '../schemas/db/scrape-run-db.schema.ts';
import { DataMappingService } from '../db/data-mapping.service.ts';
import { type ScrapeRunResultsToSave } from './run-scrape-and-save.types.ts';
import type {
  MobileSpeedCameraLocationDb,
  MobileSpeedCameraLocationInsertDb,
} from '../schemas/db/mobile-speed-camera-location-db.schema.ts';

export class RunScrapeAndSaveResultsUseCase {
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

  /**
   * Main method to execute scrape run
   * 1. Initialise scrapeRun
   * 2. Scrape & parse HTML
   * 3. Get existing records for the scraped date ranges
   * 4. Compare existing records with scraped results
   * 5. Do required reconciliation
   * 5.1 deactivate - records which are missing in the scraped results
   * 5.2 update - existing records from the scraped results
   * 5.3 Insert - new records that did not exist
   * 6. Finalise scrapeRun
   */
  public async execute(): Promise<ScrapeRunResultsToSave> {
    // 1. initialise scrape run
    const scrapeRun = await this.initialiseScrapeRun();
    console.log('scrape run created & parsed: ', scrapeRun);

    // 2.1 scrape data
    const scrapeData = await this.sapolScraperService.scrapeLocations(scrapeRun);

    // 2.2 parse to db datatype
    const locationsToDbInsert: MobileSpeedCameraLocationInsertDb[] =
      scrapeData.locations.map(DataMappingService.cameraLocationBeToDbInsert);

    // 3.1 group scraped locations into a queryable reconciliationMap
    const reconciliationMap = MobileSpeedCameraLocationReconciliationService.generateReconciliationMap(locationsToDbInsert);

    reconciliationMap.forEach((val, key) => {
      console.log(`${key} \t scrapedLocations: ${val.scrapedLocations.length}`);
    });

    // 3.2 query regionType + startDate + endDate
    MobileSpeedCameraLocationReconciliationService.generateDateRangeQueries(reconciliationMap, this.cameraLocationTableManager);
    await this.runReconciliationCheckQueries(reconciliationMap);
    console.log('CHECK QUERIES RUN');

    // 4. Prepare for reconciliation (compare with existing records)
    // 4.1 Find records toInsert, toUpdate, and toDeactivate
    const { toInsert, toUpdate, toDeactivate } = this.compareScrapedWithExistingRecords(reconciliationMap);
    const scrapeRunId = scrapeData.scrapeRun.scrapeRunId;

    // 5. Execute reconciliation (Updates & Insertions)
    // 5.1 Deactivate - records that are NOT found in the scraped locations
    await this.deactivateDeletedLocations(scrapeRunId, toDeactivate);

    // 5.2 Update - records that are in the scraped locations
    await this.updateExistingRecords(scrapeRunId, toUpdate);

    // 5.3 Insert new scraped locations
    await this.insertNewLocations(toInsert);

    // 6. END finalise scrapeRun
    await this.finaliseScrapeRun(scrapeRun);

    return { scrapeRun, toInsert, toUpdate, toDeactivate, reconciliationMap };
  }

  async initialiseScrapeRun(): Promise<ScrapeRun> {
    const result =
      await this.scrapeRunTableManager.insertScrapeRun(SapolDataService.generateGenericRun());

    if (result?.error) {
      console.error('ERROR: Failed initialising scrape run');
      console.error(result.error);
      throw result.error;
    } else if (!result?.data) {
      console.error('Something went wrong initiating scrape run');
      throw new Error('Something went wrong initiating scrape run');
    }

    const scrapeRunDb: ScrapeRunDb = result?.data[0] as ScrapeRunDb;
    return DataMappingService.scrapeRunDbToBe(scrapeRunDb);
  }

  async runReconciliationCheckQueries(reconciliationMap: ReconciliationMap): Promise<void> {
    for (const [key, val] of reconciliationMap) {
      let queryResult: PostgrestResponse<MobileSpeedCameraLocationDb> | null = null;
      if (val.query) {
        queryResult = await val.query;
        if (queryResult?.error) {
          console.error('Query Check failed gracefully:');
          console.error(queryResult?.error);
        } else {
          console.log(`${key}\t${queryResult?.status}\tExisting locations, ${queryResult?.data?.length || 0}`);
        }
      }
      val.existingLocations = queryResult?.data || [];
    }
  }

  compareScrapedWithExistingRecords(reconciliationMap: ReconciliationMap): {
    toInsert: MobileSpeedCameraLocationInsertDb[],
    toUpdate: MobileSpeedCameraLocationDb[],
    toDeactivate: MobileSpeedCameraLocationDb[]
  } {
    const toInsert: MobileSpeedCameraLocationInsertDb[] = [];
    const toUpdate: MobileSpeedCameraLocationDb[] = [];
    const toDeactivate: MobileSpeedCameraLocationDb[] = [];

    reconciliationMap.forEach((val) => {
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
    return { toInsert, toUpdate, toDeactivate };
  }

  async deactivateDeletedLocations(scrapeRunId: number, toDeactivate: MobileSpeedCameraLocationDb[]) {
    const deactivated = toDeactivate.map((location) => {
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

    console.log(`Deactivating...`);
    if (deactivated.length) {
      const result = await this.cameraLocationTableManager.upsertRows(deactivated);
      console.log(`${toDeactivate.length} locations deactivated, Result: ${result?.status}, ${result?.statusText}`);
      if (result?.error) {
        console.error(result.error);
        throw result.error;
      }
    } else {
      console.log('No locations to deactivate');
    }
  }

  async updateExistingRecords(scrapeRunId: number, toUpdate: MobileSpeedCameraLocationDb[]) {
    const newValues: MobileSpeedCameraLocationDb[] = toUpdate.map((location: MobileSpeedCameraLocationDb) => {
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

    console.log(`Updating...`);
    if (toUpdate.length) {
      const result = await this.cameraLocationTableManager.upsertRows(newValues);
      console.log(`${toUpdate.length} locations updated, Result: ${result?.status}, ${result?.statusText}`);
      if (result?.error) {
        console.error(result.error);
        throw result.error;
      }
    } else {
      console.log(`No existing locations to update`);
    }
  }

  async insertNewLocations(toInsert: MobileSpeedCameraLocationInsertDb[]) {
    try {
      console.log(`Inserting...`);
      if (toInsert.length) {
        const result = await this.cameraLocationTableManager.insertRows(toInsert);
        console.log(`${toInsert.length} locations inserted, Result: ${result?.status}, ${result?.statusText}`);
        if (result?.error) {
          console.error(result.error);
        }
      } else {
        console.log('No new locations to insert');
      }
    } catch (err) {
      console.log(err);
    }
  }

  async finaliseScrapeRun(scrapeRun: ScrapeRun) {
    scrapeRun.runEnd = DateTime.utc().toISO();
    scrapeRun.runResult = 'SUCCESS';

    const result = await this.scrapeRunTableManager.updateScrapeRun(DataMappingService.scrapeRunBeToDb(scrapeRun));
    if (result?.error) {
      console.error('ERROR: Could not finalise successful scrape run', result.error);
      throw result.error;
    }
    console.log('SCRAPE RUN COMPLETE', result?.status);
  }
}
