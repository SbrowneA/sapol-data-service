import {
  type MobileCameraLocationResponse,
  MobileCameraLocationResponseSchema
} from "../schemas/api/mobile-speed-camera-location-response.schema.ts";
import {
  type MobileSpeedCameraLocation, type MobileSpeedCameraLocationInsert,
  MobileSpeedCameraLocationSchema
} from "../schemas/domain/mobile-speed-camera-location.schema.ts";
import {
  type MobileSpeedCameraLocationDb, type MobileSpeedCameraLocationInsertDb, MobileSpeedCameraLocationsInsertSchemaDb,
  MobileSpeedCameraLocationDbSchema
} from "../schemas/db/mobile-speed-camera-location-db.schema.ts";
import {type ScrapeRun, type ScrapeRunInsert, ScrapeRunSchema} from "../schemas/domain/scrape-run.schema.ts";
import {type ScrapeRunDb, type ScrapeRunInsertDb, ScrapeRunDbSchema} from "../schemas/db/scrape-run-db.schema.ts";

/**
 * Uses zod schemas to parse data between layers:
 * - API/FE,
 * - to Domain/BE,
 * - to DB (and vice versa).
 * */
export class DataMappingService {
  public static cameraLocationBeToDb(value: MobileSpeedCameraLocation): MobileSpeedCameraLocationDb {
    return MobileSpeedCameraLocationDbSchema.parse({
      // domain level may be null
      id: value.id,
      start_date: value.startDate,
      end_date: value.endDate,
      location: value.location,
      street_norm: value.streetNormalised,
      suburb_norm: value.suburbNormalised,
      region_type: value.regionType,
      created_at: value.createdAt,
      updated_at: value.updatedAt,
      is_active: value.isActive,
      scrape_run_id: value.scrapeRunId,
      meta: {
        css_class: value.meta?.cssClass,
        all_scrape_run_ids: value.meta.allScrapeRuns?.length ? value.meta.allScrapeRuns : [value.scrapeRunId]
      }
    });
  }

  public static cameraLocationBeToDbInsert(value: MobileSpeedCameraLocationInsert): MobileSpeedCameraLocationInsertDb {
    return MobileSpeedCameraLocationsInsertSchemaDb.parse({
      start_date: value.startDate,
      end_date: value.endDate,
      location: value.location,
      street_norm: value.streetNormalised,
      suburb_norm: value.suburbNormalised,
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
      streetNormalised: value.street_norm,
      suburbNormalised: value.suburb_norm,
      regionType: value.region_type,
      createdAt: value.created_at,
      updatedAt: value.updated_at,
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
      lastUpdatedAt: value.updatedAt || ''
    });
  }

  public static scrapeRunBeToDb(value: ScrapeRun): ScrapeRunDb {
    return ScrapeRunDbSchema.parse({
      scrape_run_id: value.scrapeRunId,
      run_start: value.runStart,
      run_end: value.runEnd,
      run_result: value.runResult,
      created_at: value.createdAt,
      updated_at: value.updatedAt
    });
  }

  public static scrapeRunDbToBe(value: ScrapeRunDb): ScrapeRun {
    return ScrapeRunSchema.parse({
      scrapeRunId: value.scrape_run_id,
      runStart: value.run_start,
      runEnd: value.run_end || null,
      runResult: value.run_result,
      createdAt: value.created_at,
      updatedAt: value.updated_at || null
      // TODO: enable offset fpr zod.iso.datetime() in service or fix on fix on DB side? e.g.
      // runStart: DateTime.fromISO(value.created_at).toUTC().toISO(),
    });
  }

  public static scrapeRunDbToBeInsert(value: ScrapeRunInsertDb): ScrapeRunInsert {
    return ScrapeRunSchema.parse({
      runStart: value.run_start,
      runResult: value.run_result
    });
  }
}