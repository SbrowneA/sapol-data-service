import {SupabaseClient} from "@supabase/supabase-js";

import {GenericTableService} from "./generic-table.service.ts";
import type {
  ResolvedCameraLocationDb,
  ResolvedCameraLocationInsertDb
} from "../../schemas/db/resolved-camera-location-db.schema.ts";

export class ResolvedCameraLocationTableService extends GenericTableService<ResolvedCameraLocationDb, ResolvedCameraLocationInsertDb> {
  constructor(db: SupabaseClient) {
    super(
      'resolved_camera_location',
      'resolved_location_id',
      db);
  }
}
