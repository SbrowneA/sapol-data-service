import { SupabaseClient } from '@supabase/supabase-js';

import { AppError } from '../errors/app-error.ts';
import { RunScrapeAndSaveResultsUseCase } from './run-scrape-and-save.use-case.ts';

export class ScrapingController {
  db: SupabaseClient;

  constructor(db : SupabaseClient | null) {
    if (!db) {
      throw new Error('Database is not initialised.');
    }
    this.db = db;
  }

  async scrapeAndSaveResults() {
    // TODO check if data has already been saved for date range (if no date check for week (from now/Today)
    // if YES - use saved results (if they are less than 2 days old)

    // if NO -
    // ELSE - load html from SAPOL site

    const scrapeAndSaveUseCase = new RunScrapeAndSaveResultsUseCase(this.db);

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
