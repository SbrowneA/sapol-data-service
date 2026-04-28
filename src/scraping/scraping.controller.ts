import { SupabaseClient } from '@supabase/supabase-js';

import { AppError } from '../errors/app-error.ts';
import { RunScrapeAndSaveResultsUseCase } from './run-scrape-and-save.use-case.ts';
import { type Env } from '../../env.schema.ts';

export class ScrapingController {
  private readonly db: SupabaseClient;
  private readonly env: Env;

  constructor(db : SupabaseClient | null, env: Env) {
    if (!db) {
      throw new Error('Database is not initialised.');
    }
    this.db = db;
    this.env = env;
  }

  async scrapeAndSaveResults() {
    // TODO check if data has already been saved for date range (if no date check for week (from now/Today)
    // if YES - use saved results (if they are less than 2 days old)

    // if NO -
    // ELSE - load html from SAPOL site

    const scrapeAndSaveUseCase = new RunScrapeAndSaveResultsUseCase(this.db, this.env);

    try {
      const { scrapeRun, toInsert, toUpdate, toDeactivate, reconciliationMap } = await scrapeAndSaveUseCase.execute();
      return { message: 'queries run', scrapeData: Array.from(reconciliationMap), toDeactivate, toUpdate, toInsert, scrapeRun };
    } catch (error) {
      throw new AppError({
        statusCode: 500,
        code: 'SCRAPE_RUN_FAILED',
        message: 'Something went wrong while executing scrape run',
        cause: error,
      });
    }
  }
}

export const createScrapingController: (db: SupabaseClient, env: Env) => ScrapingController =
  (db: SupabaseClient, env: Env) => (new ScrapingController(db, env));
