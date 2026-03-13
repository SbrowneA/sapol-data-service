import {type IdFieldType, type SupabaseQuery} from "../sapol-db.service.ts";
import { type SupabaseClient } from "@supabase/supabase-js";

/**
 * Manages the provided table based on the provided types
 * @typeParam T - Table data type
 * @typeParam I - Permissible insert type
 */
export interface SupaTableService<T extends Record<string, unknown>, I extends Record<string, unknown>> {
  tableName: string;
  idFieldName: IdFieldType;
  db: SupabaseClient | null;

  insertRow?: (item: I) => any;
  updateRow?: (item: T, itemId: IdFieldType) => SupabaseQuery<T>;
  // Bulk queries
  insertRows: (item: I[]) => SupabaseQuery<T>;
  upsertRows: (items: I[]) => SupabaseQuery<T>;
  removeRows?: (itemIds: IdFieldType[]) => SupabaseQuery<T>;
  /**
   * Get all values from the table
   */
  getAll: (limit?: number) => SupabaseQuery<T>;
}

/**
 * Generic implementation of SupaTableService with crud operations
 */
export class GenericTableService<T extends Record<string, unknown>, I extends Record<string, unknown>> implements SupaTableService<T, I> {
  tableName: string;
  idFieldName;
  db: SupabaseClient;

  constructor(tableName: string, idField: string, database: SupabaseClient | null) {
    if (!database) {
      throw new Error('Database is not initialised.');
    }

    this.tableName = tableName;
    this.db = database;
    this.idFieldName = idField || 'id';
  }

  /**
   * Add a new row and return the updated row
   * @param item
   */
  insertRow(item: I): SupabaseQuery<T> {
    return (this.db?.from(this.tableName)?.insert(item)?.select() || Promise.resolve(null));
  }

  /**
   * Delete the specified row and return the removed row
   * @param itemIds id of item(s) to domain deleted
   */
  // removeRow(itemIds: string[]): Promise<PostgrestResponse<T> | null> {

  // removeRows(itemIds: IdFieldType[]): SupabaseQuery<T> {
  //   removeRows(itemIds: string[]): Promise<T> {
    // const query = itemIds.length > 1
    //   ? this.db?.from(this.tableName)?.delete()?.in(this.idFieldName, itemIds)
    //   : this.db?.from(this.tableName)?.delete()?.eq(this.idFieldName, itemIds[0]);
    // return query?.select() || Promise.resolve(null);
  // }

  /**
   * Upserts the provided items
   * @param items
   */
  upsertRows(items: I[]): SupabaseQuery<T> {
    if (this.db) {
      return this.db.from(this.tableName).upsert(items).select()
    }
    return Promise.resolve(null);
  }

  /**
   * Inserts the provided items
   * May throw errors if attempting to insert an existing record.
   * @param items
   */
  insertRows(items: I[]): SupabaseQuery<T> {
    if (this.db) {
      return this.db.from(this.tableName).insert(items).select()
    }
    return Promise.resolve(null);
  }


  /**
   * Get all records in table
   * @param limit - defaults to 500
   */
  getAll(limit = 500): SupabaseQuery<T> {
    if (this.db) {
      return this.db.from(this.tableName).select().limit(limit);
    }
    return Promise.resolve(null);
  }
}