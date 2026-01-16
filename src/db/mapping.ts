import {
  type MobileCameraLocationResponse,
  MobileCameraLocationResponseSchema
} from "../schemas/api/MobileSpeedCameraLocationResponseSchema.ts";
import {
  type MobileSpeedCameraLocation,
  MobileSpeedCameraLocationSchema
} from "../schemas/domain/MobileSpeedCameraLocationSchema.ts";
import {
  type MobileSpeedCameraLocationDb, type MobileSpeedCameraLocationInsertDb, MobileSpeedCameraLocationsInsertSchemaDb,
  MobileSpeedCameraLocationsSchemaDb
} from "../schemas/db/MobileSpeedCameraLocationsSchemaDb.ts";
import {type ScrapeRun, ScrapeRunSchema} from "../schemas/domain/ScrapeRunSchema.ts";
import {type ScrapeRunDb, ScrapeRunSchemaDb} from "../schemas/db/ScrapeRunSchemaDb.ts";

/**
 * Uses zod schemas to parse data between layers:
 * - API/FE,
 * - to Domain/BE,
 * - to DB (and vice versa).
 * */
export class DataMapping {

  public static cameraLocationBeToDb(value: MobileSpeedCameraLocation): MobileSpeedCameraLocationDb {
    return MobileSpeedCameraLocationsSchemaDb.parse({
      // domain level may be null
      id: value.id,
      start_date: value.startDate,
      end_date: value.endDate,
      location: value.location,
      region_type: value.regionType,
      created_at: value.createdAt,
      edited_at: value.editedAt,
      is_active: value.isActive,
      scrape_run_id: value.scrapeRunId,
      meta: {
        css_class: value.meta?.cssClass,
        all_scrape_run_ids: value.meta.allScrapeRuns?.length ? value.meta.allScrapeRuns : [value.scrapeRunId]
      }
    });
  }

  public static cameraLocationBeToDbInsert(value: MobileSpeedCameraLocation): MobileSpeedCameraLocationInsertDb {
    return MobileSpeedCameraLocationsInsertSchemaDb.parse({
      start_date: value.startDate,
      end_date: value.endDate,
      location: value.location,
      region_type: value.regionType,
      is_active: value.isActive,
      scrape_run_id: value.scrapeRunId,
      meta: {
        css_class: value.meta?.cssClass,
        all_scrape_run_ids: value.meta.allScrapeRuns?.length ? value.meta.allScrapeRuns : [value.scrapeRunId]
      }
    });
  }

  public static cameraLocationDbToBe(value: MobileSpeedCameraLocationDb): MobileSpeedCameraLocation {
    return MobileSpeedCameraLocationSchema.parse({
      // domain level may be null
      id: value.id,
      startDate: value.start_date,
      endDate: value.end_date,
      location: value.location,
      regionType: value.region_type,
      createdAt: value.created_at,
      editedAt: value.edited_at,
      isActive: value.is_active,
      scrapeRunId: value.scrape_run_id,
      meta: {
        cssClass: value.meta.css_class,
        allScrapeRuns: value.meta.all_scrape_run_ids
      }
    });
  }

  public static cameraLocationBeToFe(value: MobileSpeedCameraLocation): MobileCameraLocationResponse {
    return MobileCameraLocationResponseSchema.parse({
      location: value.location,
      lastUpdatedAt: value.editedAt || value.editedAt || ''
    });
  }

  public static scrapeRunBeToDb(value: ScrapeRun): ScrapeRunDb {
    return ScrapeRunSchemaDb.parse({
      scrape_run_id: value.scrapeRunId,
      run_start: value.runStart,
      run_end: value.runEnd,
      run_result: value.runResult
    });
  }

  public static scrapeRunDbToBe(value: ScrapeRunDb): ScrapeRun {
    return ScrapeRunSchema.parse({
      scrapeRunId: value.scrape_run_id,
      runStart: value.run_start,
      runEnd: value.run_end,
      runResult: value.run_result
    });
  }
}