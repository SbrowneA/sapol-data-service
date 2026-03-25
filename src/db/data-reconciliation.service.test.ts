import { describe, expect, it } from 'vitest';

import { MobileSpeedCameraLocationReconciliationService } from './data-reconciliation.service.ts';
import { type RegionType } from '../schemas/domain/region-type.enum.ts';
import { type MobileSpeedCameraLocationInsertDb } from '../schemas/db/mobile-speed-camera-location-db.schema.ts';

const makeInsertLocation = (
  location: string,
  regionType: RegionType = 'METRO',
  startDate = '2026-03-24',
  endDate = '2026-03-24'
): MobileSpeedCameraLocationInsertDb => ({
  start_date: startDate,
  end_date: endDate,
  location,
  street_norm: 'MAIN ROAD',
  suburb_norm: 'ADELAIDE',
  region_type: regionType,
  is_active: true,
  scrape_run_id: 1,
  meta: {
    all_scrape_run_ids: [1],
  },
});

describe('MobileSpeedCameraLocationReconciliationService', () => {
  describe('generateReconciliationMap', () => {
    it('groups locations by region and date range', () => {
      const result = MobileSpeedCameraLocationReconciliationService.generateReconciliationMap([
        makeInsertLocation('MAIN ROAD, ADELAIDE'),
        makeInsertLocation('KING WILLIAM ROAD, ADELAIDE'),
        makeInsertLocation('PORT ROAD, PORT ADELAIDE', 'COUNTRY', '2026-03-24', '2026-03-28'),
      ]);

      expect(result.size).toBe(2);
      expect(result.get('METRO|2026-03-24|2026-03-24')?.scrapedLocations).toHaveLength(2);
      expect(result.get('COUNTRY|2026-03-24|2026-03-28')?.scrapedLocations).toHaveLength(1);
    });

    it('appends locations to an existing reconciliation group', () => {
      const result = MobileSpeedCameraLocationReconciliationService.generateReconciliationMap([
        makeInsertLocation('MAIN ROAD, ADELAIDE', 'METRO'),
        makeInsertLocation('UNLEY ROAD, UNLEY', 'METRO'),
        // separate group
        makeInsertLocation('MAIN ROAD, ADELAIDE', 'METRO', '2026-04-04', '2026-04-04'),
      ]);

      const metroGroup1 = result.get('METRO|2026-03-24|2026-03-24');
      const metroGroup2 = result.get('METRO|2026-04-04|2026-04-04');

      expect(metroGroup1?.scrapedLocations?.length).toBe(2);
      expect(metroGroup1?.scrapedLocations).toEqual(expect.arrayContaining([
        expect.objectContaining({ location: 'MAIN ROAD, ADELAIDE' }),
        expect.objectContaining({ location: 'UNLEY ROAD, UNLEY' })
      ]));
      // group 2
      expect(metroGroup2?.scrapedLocations?.length).toBe(1);
      expect(metroGroup1?.scrapedLocations).toEqual(expect.arrayContaining([
        expect.objectContaining({ location: 'MAIN ROAD, ADELAIDE' })
      ]));
    });
  });
});
