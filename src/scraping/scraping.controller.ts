import type { Response } from "express";

import {SupabaseClient} from "@supabase/supabase-js";

import {RunScrapeAndSaveResultsUseCase} from "./run-scrape-and-save.use-case.ts";

export class ScrapingController {
  db: SupabaseClient;

  constructor(db : SupabaseClient | null) {
    if (!db) {
      throw new Error('Database is not initialised.');
    }
    this.db = db;
  }

  async scrapeAndSaveResults(res: Response) {
    // TODO check if data has already been saved for date range (if no date check for week (from now/Today)
    // if YES - use saved results (if they are less than 2 days old)

    // if NO -
    // ELSE - load html from SAPOL site

    const scrapeAndSaveUseCase =  new RunScrapeAndSaveResultsUseCase(this.db);

    try {
      const { scrapeRun, toInsert, toUpdate, toDeactivate, reconciliationMap } = await scrapeAndSaveUseCase.execute();
      res.json({message: 'queries run', scrapeData: Array.from(reconciliationMap), toDeactivate, toUpdate, toInsert, scrapeRun});
    } catch (error) {
      console.error('something went wrong', error);
      res.status(500).json({message: 'Something went wrong while executing scrape run', error});
    }
  }
}