import type {
  MobileSpeedCameraLocationDb,
  MobileSpeedCameraLocationInsertDb,
} from '../schemas/db/mobile-speed-camera-location-db.schema.ts';
import type { MobileSpeedCameraLocationInsert } from '../schemas/domain/mobile-speed-camera-location.schema.ts';
import type { ScrapeRun } from '../schemas/domain/scrape-run.schema.ts';
import type { ReconciliationMap } from '../db/data-reconciliation.service.ts';

export interface ScrapeRunResults {
  locations: MobileSpeedCameraLocationInsert[];
  scrapeRun: ScrapeRun;
}

export interface ScrapeRunResultsToSave {
  scrapeRun: ScrapeRun;
  toInsert: MobileSpeedCameraLocationInsertDb[];
  toUpdate: MobileSpeedCameraLocationDb[];
  toDeactivate: MobileSpeedCameraLocationDb[];
  reconciliationMap: ReconciliationMap;
}
