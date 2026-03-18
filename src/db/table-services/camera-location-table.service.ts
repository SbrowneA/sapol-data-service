import type { SupabaseClient } from '@supabase/supabase-js';

import { type RegionType } from '../../schemas/domain/region-type.enum.ts';
import type {
  MobileSpeedCameraLocationDb,
  MobileSpeedCameraLocationInsertDb,
} from '../../schemas/db/mobile-speed-camera-location-db.schema.ts';
import { type SupabaseQuery } from '../sapol-db.service.ts';

// FIXME: Refactor to extend generic class for consistency
export class CameraLocationTableService {
  tableName: string = 'mobile_speed_camera_location';
  private db: SupabaseClient | null;

  constructor(db: SupabaseClient | null) {
    this.db = db;
  }

  getBusinessKeyDb(location: MobileSpeedCameraLocationDb | MobileSpeedCameraLocationInsertDb): string {
    return (location.location + location.start_date + location.end_date);
  }

  /**
   * TODO create db index for constraint
   * Used to for reconciling camera location records with scraped camera locations for the same date range
   * @param regionType
   * @param startDate
   * @param endDate
   */
  getLocationsForDateRageByRegion(
    regionType: RegionType, startDate: string, endDate: string): SupabaseQuery<MobileSpeedCameraLocationDb> {
    if (this.db) {
      return this.db.from(this.tableName)
        .select()
        .eq('region_type', regionType)
        .eq('start_date', startDate)
        .eq('end_date', endDate);
    }
    return Promise.resolve(null);
  }

  getAllLocations(): SupabaseQuery<MobileSpeedCameraLocationDb> {
    if (this.db) {
      return this.db.from(this.tableName).select();
    }
    return Promise.resolve(null);
  }

  insertLocations(locations: MobileSpeedCameraLocationInsertDb[]): SupabaseQuery<MobileSpeedCameraLocationDb> {
    return (this.db?.from(this.tableName)?.insert(locations).select() || Promise.resolve(null));
  }

  // using upsert to bulk update rows
  updateLocations(locations: MobileSpeedCameraLocationDb[]): SupabaseQuery<MobileSpeedCameraLocationDb> {
    return (this.db?.from(this.tableName)?.upsert(locations).select() || Promise.resolve(null));
  }
}
