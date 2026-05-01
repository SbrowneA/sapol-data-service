import { SupabaseClient } from '@supabase/supabase-js';

import { GenericTableService } from './generic-table.service.ts';
import type { CanonisationRunDb, CanonisationRunInsertDb } from '../../schemas/db/canonisation-run-db.schema.ts';

export class CanonisationRunTableService extends GenericTableService<CanonisationRunDb, CanonisationRunInsertDb> {
  constructor(db: SupabaseClient | null) {
    super(
      'canonisation_run',
      'canonisation_run_id',
      db);
  }
}
