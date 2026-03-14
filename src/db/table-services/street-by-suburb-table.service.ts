import {SupabaseClient} from "@supabase/supabase-js";

import {GenericTableService} from "./generic-table.service.ts";
import {type StreetBySuburbDb} from "../../schemas/db/street-by-suburb-db.schema.ts";
import type {SupabaseQuery} from "../sapol-db.service.ts";
import type {MobileSpeedCameraLocationDb} from "../../schemas/db/mobile-speed-camera-location-db.schema.ts";

// TODO create read only base class
export class StreetBySuburbTableService extends GenericTableService<StreetBySuburbDb, StreetBySuburbDb> {
  constructor(db: SupabaseClient) {
    super(
      'streets_by_suburb',
      'street_by_suburb_id',
      db);
  }

  matchLocationsToStreetBySuburb(locations: MobileSpeedCameraLocationDb[]) : SupabaseQuery<StreetBySuburbDb> {
    if (this.db) {
      // FIXME once function and tables are added
      //    - get street_by_suburb that matches (street_name + suburb_name)
      this.db.rpc('get_streets_by_suburb_from_list', {
        street_suburb_list: JSON.stringify(locations),
      });
      // return this.db.from(this.tableName).select().limit(10);
    }
    return Promise.resolve(null);
  }
}