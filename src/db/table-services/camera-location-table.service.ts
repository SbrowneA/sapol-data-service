import type { SupabaseClient } from '@supabase/supabase-js';

import { type RegionType } from '../../schemas/domain/region-type.enum.ts';
import type {
  MobileSpeedCameraLocationDb,
  MobileSpeedCameraLocationInsertDb
} from '../../schemas/db/mobile-speed-camera-location-db.schema.ts';
import { type SupabaseQuery } from '../sapol-db.service.ts';
import { GenericTableService } from './generic-table.service.ts';


export class CameraLocationTableService extends GenericTableService<MobileSpeedCameraLocationDb, MobileSpeedCameraLocationInsertDb> {
  constructor(db: SupabaseClient | null) {
    super(
      'mobile_speed_camera_location',
      'id',
      db);
  }

  getBusinessKeyDb(location: MobileSpeedCameraLocationDb | MobileSpeedCameraLocationInsertDb): string {
    return (location.location + location.start_date + location.end_date);
  }

  /**
   * TODO create db index/unique constraint (Materialised view?)
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

  /**
   * Retrieves the locations that don't have a defined street_full_canon
   */
  getLocationsToCanonise(): SupabaseQuery<MobileSpeedCameraLocationDb> {
    if (this.db) {
      return this.db.from(this.tableName).select().is('street_full_canon', null);
    }
    return Promise.resolve(null);
  }

  /**
   * Retrieves the locations that don't have matching location_by_suburb
   */
  getLocationsToResolve(limit?: number, region?:RegionType): SupabaseQuery<MobileSpeedCameraLocationDb> {
    if (this.db) {
      // TODO once function and tables are added
      //    - get camera_locations that don't have a  (left join where resolved_location_id=null)
      // this.db.rpc('get_streets_to_resolve', {
      //   street_suburb_list: JSON.stringify(locations),
      // });
      const query = this.db.from(this.tableName).select().neq('street_full_canon', null);
      if (region) {
        query.eq('region_type', region);
      }
      if (limit) {
        query.limit(limit);
      }
      return query;
    }
    return Promise.resolve(null);
  }
}
