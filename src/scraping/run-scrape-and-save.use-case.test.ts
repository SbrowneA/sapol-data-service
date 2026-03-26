import { describe, expect, it } from 'vitest';

import { RunScrapeAndSaveResultsUseCase } from './run-scrape-and-save.use-case.ts';
import { type ReconciliationMap } from '../db/data-reconciliation.service.ts';
import type {
  MobileSpeedCameraLocationDb,
  MobileSpeedCameraLocationInsertDb,
} from '../schemas/db/mobile-speed-camera-location-db.schema.ts';

const _makeExistingLocation = (
  id: bigint,
  location: string,
  startDate = '2026-03-24',
  endDate = '2026-03-24'
): MobileSpeedCameraLocationDb => ({
  id,
  start_date: startDate,
  end_date: endDate,
  location,
  street_norm: 'MAIN ROAD',
  suburb_norm: 'ADELAIDE',
  street_full_canon: 'MAIN ROAD',
  street_name_canon: 'MAIN',
  street_type_canon: 'ROAD',
  direction_suffix_canon: 'NORTH',
  region_type: 'METRO',
  created_at: '2026-03-25T00:00:00.000Z',
  is_active: true,
  scrape_run_id: 1,
  meta: {
    all_scrape_run_ids: [1],
  },
});

const _makeScrapedLocation = (
  location: string,
  startDate = '2026-03-24',
  endDate = '2026-03-24'
): MobileSpeedCameraLocationInsertDb => ({
  start_date: startDate,
  end_date: endDate,
  location,
  street_norm: 'MAIN ROAD',
  suburb_norm: 'ADELAIDE',
  region_type: 'METRO',
  is_active: true,
  scrape_run_id: 2,
  meta: {
    all_scrape_run_ids: [2],
  },
});

describe('RunScrapeAndSaveResultsUseCase', () => {
  describe('compareScrapedWithExistingRecords', () => {
    it('splits locations into insert, update, and deactivate buckets', () => {
      // Create a bare instance so the test can call the pure comparison method
      // without constructing the real DB-backed dependencies in the constructor.
      const useCase = Object.create(RunScrapeAndSaveResultsUseCase.prototype) as RunScrapeAndSaveResultsUseCase;

      (useCase as {
        cameraLocationTableManager: {
          getBusinessKeyDb: (location: MobileSpeedCameraLocationDb | MobileSpeedCameraLocationInsertDb) => string;
        };
      }).cameraLocationTableManager = {
        getBusinessKeyDb: (location) => `${location.location}|${location.start_date}|${location.end_date}`,
      };

      const existingOnly = _makeExistingLocation(1n, 'EXISTING ONLY, ADELAIDE');
      const existingAndScraped = _makeExistingLocation(2n, 'SHARED LOCATION, ADELAIDE');
      const scrapedOnly = _makeScrapedLocation('NEW LOCATION, ADELAIDE');

      const reconciliationMap: ReconciliationMap = new Map([
        ['METRO|2026-03-24|2026-03-24', {
          startDate: '2026-03-24',
          endDate: '2026-03-24',
          regionType: 'METRO',
          scrapedLocations: [
            _makeScrapedLocation('SHARED LOCATION, ADELAIDE'),
            scrapedOnly,
          ],
          existingLocations: [
            existingOnly,
            existingAndScraped,
          ],
        }],
      ]);

      const result = useCase.compareScrapedWithExistingRecords(reconciliationMap);

      expect(result.toDeactivate).toEqual([existingOnly]);
      expect(result.toUpdate).toEqual([existingAndScraped]);
      expect(result.toInsert).toEqual([scrapedOnly]);
    });
  });
});
