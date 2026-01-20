import {
  type MobileCameraLocationResponse,
  MobileCameraLocationResponseSchema
} from "../schemas/api/mobile-speed-camera-location-response.schema.ts";
import {
  type MobileSpeedCameraLocation,
  MobileSpeedCameraLocationSchema
} from "../schemas/domain/mobile-speed-camera-location.schema.ts";
import {
  type MobileSpeedCameraLocationDb, type MobileSpeedCameraLocationInsertDb, MobileSpeedCameraLocationsInsertSchemaDb,
  MobileSpeedCameraLocationsDbSchema
} from "../schemas/db/mobile-speed-camera-locations-db.schema.ts";
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
    return MobileSpeedCameraLocationsDbSchema.parse({
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
    return ScrapeRunDbSchema.parse({
      scrape_run_id: value.scrapeRunId,
      run_start: value.runStart,
      run_end: value.runEnd,
      run_result: value.runResult,
      created_at: value.createdAt,
      edited_at: value.editedAt
    });
  }

  public static scrapeRunDbToBe(value: ScrapeRunDb): ScrapeRun {
    return ScrapeRunSchema.parse({
      scrapeRunId: value.scrape_run_id,
      runStart: value.created_at,
      runEnd: value.run_end || null,
      runResult: value.run_result,
      createdAt: value.created_at,
      editedAt: value.edited_at || null
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