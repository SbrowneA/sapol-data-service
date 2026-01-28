import {Router} from "express";
import {SupabaseClient} from "@supabase/supabase-js";
import {type PostgrestResponse} from "@supabase/postgrest-js";
import {SupaDatabase} from "../db/sapol-db.service.ts";
import {CameraLocationTableService} from "../db/table-services/camera-location-table.service.ts";
import {type MobileSpeedCameraLocationDb} from "../schemas/db/mobile-speed-camera-location-db.schema.ts";
const normalisationRoutes = Router();
const db: SupabaseClient | null = SupaDatabase.getInstance();
const cameraLocationTableManager = new CameraLocationTableService(db);
/**
 * Endpoint to normalise all speed camera locations to have street_norm and suburb_norm
 */
normalisationRoutes.get('/normalise-all', async (req, res) => {
  const result
    = (await cameraLocationTableManager.getAllLocations()) || {} as PostgrestResponse<MobileSpeedCameraLocationDb[]>;

  if (result?.error) {
    res.status(500).json({error: result.error});
  }

  const toUpdate: MobileSpeedCameraLocationDb[] = (result.data || [])
    // only update missing values
    .filter(l => !l.street_norm || !l.suburb_norm)
    .map((location: MobileSpeedCameraLocationDb) => {
      const [street = '', suburb = ''] = location.location.toUpperCase().split(',');
      console.log(location.location, ';', street, suburb);

      return {
        ...location,
        street_norm: location.street_norm || street.trim(),
        suburb_norm: location.suburb_norm || suburb.trim()
      };
    });

  const updatedResult = await cameraLocationTableManager.updateLocations(toUpdate) || {} as PostgrestResponse<MobileSpeedCameraLocationDb[]>;

  res.json({
    data: result?.data || [],
    toUpdate: toUpdate,
    updated: updatedResult.data,
    updateStatus: updatedResult.status,
    error: updatedResult.error
  });
});

