import { Router } from 'express';

import { SupabaseClient } from '@supabase/supabase-js';
import { type PostgrestResponse } from '@supabase/postgrest-js';

import { SupaDatabase } from '../db/sapol-db.service.ts';
import { CameraLocationTableService } from '../db/table-services/camera-location-table.service.ts';
import { type MobileSpeedCameraLocationDb } from '../schemas/db/mobile-speed-camera-location-db.schema.ts';
import { DataNormalisationService } from '../db/data-normalisation/data-normalisation-service.ts';
import { CanonicalStreetTypeTableService } from '../db/table-services/canonical-street-type-table.service.ts';
import type { StreetTypeDb, StreetTypeDbInsert } from '../schemas/db/street-type.schema.ts';

const normalisationRoutes = Router();
const db: SupabaseClient | null = SupaDatabase.getInstance();
const cameraLocationTableManager = new CameraLocationTableService(db);
const streetTypeTableService = new CanonicalStreetTypeTableService(db);

/**
 * Endpoint to normalise all speed camera locations to have street_norm and suburb_norm
 */
normalisationRoutes.get('/normalise-all', async (req, res) => {
  const result =
    (await cameraLocationTableManager.getAll()) || {} as PostgrestResponse<MobileSpeedCameraLocationDb[]>;

  if (result?.error) {
    res.status(500).json({ error: result.error });
  }

  const toUpdate: MobileSpeedCameraLocationDb[] = (result.data || [])
    // only update missing values
    .filter((l) => !l.street_norm || !l.suburb_norm)
    .map((location: MobileSpeedCameraLocationDb) => {
      const [street = '', suburb = ''] = location.location.toUpperCase().split(',');
      console.log(location.location, ';', street, suburb);

      return {
        ...location,
        street_norm: location.street_norm || street.trim(),
        suburb_norm: location.suburb_norm || suburb.trim()
      };
    });

  const updatedResult
    = await cameraLocationTableManager.upsertRows(toUpdate) || {} as PostgrestResponse<MobileSpeedCameraLocationDb[]>;

  res.json({
    data: result?.data || [],
    toUpdate: toUpdate,
    updated: updatedResult.data,
    updateStatus: updatedResult.status,
    error: updatedResult.error
  });
});

normalisationRoutes.get('/add-street-types', async (req, res) => {
  try {
    // load street types
    const streetTypes: StreetTypeDbInsert[] = await DataNormalisationService.getStreetTypesFromFile();
    console.log(streetTypes.length, 'street-types: loaded');
    // upsert street types
    const result: PostgrestResponse<StreetTypeDb> =
      (await streetTypeTableService.updateStreetTypes(streetTypes)) || {} as PostgrestResponse<StreetTypeDb>;
    if (result?.error) {
      return res.status(500).json({ error: result.error, attempted: streetTypes });
    }
    console.log(result.data.length, 'street-types: upserted');
    res.json({ savedValues: result.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});


export default normalisationRoutes;
