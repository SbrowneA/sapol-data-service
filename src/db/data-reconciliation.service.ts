import { type SupabaseQuery } from './sapol-db.service.ts';
import type {
  MobileSpeedCameraLocationDb,
  MobileSpeedCameraLocationInsertDb,
} from '../schemas/db/mobile-speed-camera-location-db.schema.ts';
import { type RegionType } from '../schemas/domain/region-type.enum.ts';
import { CameraLocationTableService } from './table-services/camera-location-table.service.ts';

type LocationReconciliationQueryGroup = {
  startDate: string,
  endDate: string,
  regionType: RegionType
  scrapedLocations: MobileSpeedCameraLocationInsertDb[];
  existingLocations: MobileSpeedCameraLocationDb[];
  query?: SupabaseQuery<MobileSpeedCameraLocationDb>;
}

export type ReconciliationMap = Map<string, LocationReconciliationQueryGroup>;

export class MobileSpeedCameraLocationReconciliationService {
  static generateReconciliationMap(scrapedLocations: MobileSpeedCameraLocationInsertDb[]): ReconciliationMap {
    const reconciliationMap = new Map<string, LocationReconciliationQueryGroup>();

    // Groups each scraped location by key of "REGION|START-DATE|END-DATE"
    scrapedLocations.forEach((location) => {
      const key = `${location.region_type}|${location.start_date}|${location.end_date}`;

      if (reconciliationMap.has(key)) {
        reconciliationMap.get(key)?.scrapedLocations?.push(location);
      } else {
        reconciliationMap.set(key, {
          startDate: location.start_date,
          endDate: location.end_date,
          regionType: location.region_type,
          scrapedLocations: [location],
          existingLocations: []
        });
      }
    });

    return reconciliationMap;
  }

  /**
   * (Mutating Method) Returns the provided map with the corresponding db query to execute
   */
  static generateDateRangeQueries(
    original: ReconciliationMap,
    cameraLocationTableManager: CameraLocationTableService): ReconciliationMap {
    original.forEach((value: LocationReconciliationQueryGroup, key, map) => {
      const query = cameraLocationTableManager.getLocationsForDateRageByRegion(value.regionType, value.startDate, value.endDate);
      map.set(key, { ...value, query });
    });
    return original;
  }
}
