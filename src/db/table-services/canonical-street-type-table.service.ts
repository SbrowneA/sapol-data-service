import {SupabaseClient} from "@supabase/supabase-js";

import type {SupabaseQuery} from "../sapol-db.service.ts";
import type {StreetTypeDb, StreetTypeDbInsert} from "../../schemas/db/street-type.schema.ts";

export class CanonicalStreetTypeTableService {
  tableName: string = 'canonical_street_type';
  private db: SupabaseClient;

  constructor(db: SupabaseClient| null) {
    if (db) {
      this.db = db;
    } else {
      throw Error('A valid SupabaseClient instance must be provided');
    }
  }

  updateStreetTypes(streetTypes: StreetTypeDbInsert[] | StreetTypeDb[]): SupabaseQuery<StreetTypeDb> {
    return this.db.from(this.tableName)
      .upsert(streetTypes, { onConflict: 'street_type_key, canonical_key', ignoreDuplicates: true })
      .select();
  }

  getAll(): SupabaseQuery<StreetTypeDb> {
    return this.db.from(this.tableName).select();
  }
}