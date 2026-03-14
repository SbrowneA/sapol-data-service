import {Pool, type QueryResult, type QueryResultRow} from 'pg';

import { env } from "../../env.ts";
import {type MobileSpeedCameraLocationDb} from "../schemas/db/mobile-speed-camera-location-db.schema.ts";

export class TestDbService {
  pool: Pool;

  constructor() {
    console.log('Running testDbConnectionService');
    this.pool = new Pool({
      user: env.TEST_DB_USER,
      host: env.TEST_DB_HOST,
      database: env.TEST_DB_DATABASE,
      port: env.TEST_DB_PORT,
      password: env.TEST_DB_PASSWORD,
    });
  }

  runQuery(query: string, params?: string[]): Promise<QueryResult<QueryResultRow>> {
    try {
      if (params) {
        return this.pool.query(query, params);
      }
      return this.pool.query(query);
    } catch(error) {
      console.error(error);
      throw error;
    }
  }

  static getLookupKey(location: MobileSpeedCameraLocationDb): string {
    return `${location.street_full_canon}_${location.suburb_norm}`;
  }

  crateQueryFromLocations(camLocations: MobileSpeedCameraLocationDb[]): string {
    const query = '';
    const lookupMap = new Map<string, QueryResultRow>();
    camLocations.forEach(camLocation => {
      const key = TestDbService.getLookupKey(camLocation);
    });
    return query;
  }
}
