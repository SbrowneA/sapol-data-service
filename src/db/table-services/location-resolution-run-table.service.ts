import { GenericTableService } from './generic-table.service.ts';
import { SupabaseClient } from '@supabase/supabase-js';

import {
  type LocationResolutionRunDb,
  type LocationResolutionRunInsertDb
} from '../../schemas/db/location-resolution-run-db.schema.ts';

export class LocationResolutionRunTableService extends GenericTableService<LocationResolutionRunDb, LocationResolutionRunInsertDb> {
  constructor(db: SupabaseClient) {
    super(
      'location_resolution_run',
      'resolution_run_id',
      db);
  }
}
