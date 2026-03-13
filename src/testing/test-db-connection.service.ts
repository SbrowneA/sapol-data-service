import {Pool, type QueryResult, type QueryResultRow} from 'pg';

import { env } from "../../env.ts";

export class TestDbConnectionService {
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

  runQuery(query: string): Promise<QueryResult<QueryResultRow> | null> {
    try {
      return this.pool.query(query);
    } catch(error){
      console.error(error);
    }
    return Promise.resolve(null);
  }
}
