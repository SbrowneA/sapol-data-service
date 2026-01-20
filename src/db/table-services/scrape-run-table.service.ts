import {SupabaseClient} from "@supabase/supabase-js";

import {type SupabaseQuery} from "../sapol-db.service.ts";
import {type MobileSpeedCameraLocationDb} from "../../schemas/db/mobile-speed-camera-locations-db.schema.ts";
import {type ScrapeRunDb, type ScrapeRunInsertDb} from "../../schemas/db/scrape-run-db.schema.ts";

// FIXME: Refactor to extend generic class for consistency
export class ScrapeRunTableService {
  tableName: string = 'scrape_run';
  private db: SupabaseClient | null;

  constructor(db: SupabaseClient | null) {
    this.db = db;
  }

  insertScrapeRun(rows: ScrapeRunInsertDb): SupabaseQuery<MobileSpeedCameraLocationDb> {
    return (this.db?.from(this.tableName)?.insert(rows).select() || Promise.resolve(null));
  }

  updateScrapeRun(run: ScrapeRunDb): SupabaseQuery<MobileSpeedCameraLocationDb> {
    if (this.db) {
      return this.db.from(this.tableName)
        .update(run)
        .eq('scrape_run_id', run.scrape_run_id)
        .select();
    }
    return Promise.resolve(null);
  }

  getAll(): SupabaseQuery<MobileSpeedCameraLocationDb> {
    return this.db?.from(this.tableName).select() || Promise.resolve(null);
  }
}
