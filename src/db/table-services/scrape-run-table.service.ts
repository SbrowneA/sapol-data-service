import { SupabaseClient } from '@supabase/supabase-js';

import { type ScrapeRunDb, type ScrapeRunInsertDb } from '../../schemas/db/scrape-run-db.schema.ts';
import { GenericTableService } from './generic-table.service.ts';

export class ScrapeRunTableService extends GenericTableService<ScrapeRunDb, ScrapeRunInsertDb> {
  constructor(db: SupabaseClient | null) {
    super(
      'scrape_run',
      'scrape_run_id',
      db);
  }
}
