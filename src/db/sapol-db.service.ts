import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

import { env } from '../../env.ts';

/**
 * See docs at: https://supabase.com/docs/reference/javascript/start
 */

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.PRIVATE_SUPABASE_NODE_SERVICE_KEY;

export type IdFieldType = string | number | 'id';
// Can increase granularity of response type with PostgrestMaybeSingleResponse & PostgrestSingleResponse

/**
 * Since supabase queries fail gracefully, errors are passed within the response
 * there is no catch() exposed only then().
 * @typeParam T - expected return value once resolved
 */
type Thenable<T> = Exclude<Promise<T>, 'catch'>

type SupabaseQueryBuilder<T extends Record<string, unknown>>
  = PostgrestFilterBuilder<any, any, T, any[], string, any, 'POST' | 'GET' | 'PATCH' | 'DELETE'>;
export type SupabaseQuery<T extends Record<string, unknown>>
  = SupabaseQueryBuilder<T> | Thenable<null>;

/**
 * Singleton class for supabase database instance
 */
export class SupaDatabase {
  private static db: SupabaseClient | null = null;

  // Private constructor to prevent direct instantiation
  constructor() {
    SupaDatabase.getInstance();
  };

  public static getInstance() {
    if (!SupaDatabase.db) {
      try {
        SupaDatabase.db = createClient(supabaseUrl, supabaseKey);
      } catch (err) {
        console.error(err);
      }
    }
    return SupaDatabase.db;
  }
}
