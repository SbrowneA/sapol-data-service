import { Router } from 'express';

import { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { TestDbService } from '../testing/test-db.service.ts';
import { CameraLocationTableService } from '../db/table-services/camera-location-table.service.ts';
import { SupaDatabase } from '../db/sapol-db.service.ts';
import { DebugService } from '../debug/debug.service.ts';

const StreetsBySuburbApiDbSchema = z.object({
  streets_by_suburb_id: z.int(),
  street_canon: z.string(),
  street_osm_ids: z.array(z.int()),
  street_geom: z.json(),
  suburb_name: z.string(),
  suburb_osm_id: z.string(),
  suburb_geom: z.json(),
});

type StreetsBySuburbApiDb = z.infer<typeof StreetsBySuburbApiDbSchema>;


const testDbRoutes = Router();

const db: SupabaseClient | null = SupaDatabase.getInstance();
const cameraLocationTableManager = new CameraLocationTableService(db);
const testDbConnectionService = new TestDbService();

testDbRoutes.get('/streets-by-suburb', async (req, res) => {
  try {
    const result = await testDbConnectionService.runQuery('SELECT * FROM streets_by_suburb LIMIT 10');
    res.json({ message: 'streets-by-suburb table:', result });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

testDbRoutes.get('/locations-to-canonise', async (req, res) => {
  const result = await cameraLocationTableManager.getLocationsToCanonise();
  if (result?.error) {
    res.json({ error: result.error }).status(500);
  }
  const data = result?.data || [];
  res.json({ message: 'locations to canonise', data: data, count: data.length });
});

testDbRoutes.get('/resolved-location-by-suburb', async (req, res) => {
  // const result = await cameraLocationTableManager.getLocationsToResolve(50, "COUNTRY");
  const result = await cameraLocationTableManager.getLocationsToResolve(50, 'METRO');

  if (result?.error) {
    res.json({ error: result.error }).status(500);
  }

  type ResolveMapItem = {
    street: string;
    suburb: string;
    // reference to create resolved_location records
    locationIds: number[];
    // Reference to street_by_suburb with street geometry
    streetBySuburbId?: number;
    streetGeometry?: object;
    suburbGeometry?: object;
  };
  // create lookup map for unique (street+suburb) lookups.
  const uniqueLocations =
    new Map<string, ResolveMapItem>();

  (result?.data || []).forEach((loc) => {
    const key = `${loc.street_full_canon}|${loc.suburb_norm}`;
    if (uniqueLocations.has(key)) {
      uniqueLocations.set(key, {
        street: loc.street_full_canon,
        suburb: loc.suburb_norm,
        locationIds: [...(uniqueLocations.get(key)?.locationIds || []), loc.id],
      });
    } else {
      uniqueLocations.set(key, {
        street: loc.street_full_canon,
        suburb: loc.suburb_norm,
        locationIds: [loc.id],
      });
    }
  });

  const locations = [...uniqueLocations.values()];

  // Generate SQL query
  console.log('locations:', locations);
  const values = locations
    // Counts in pairs e.g. ($1{i=0*2+1}, $2{i=0*2+2}) ($3{i=1+*2+1}, $4{i=1*2+2})
    .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
    .join(',');
  console.log('values:', values);

  // generate params (single flat array)
  // const params = locations.flatMap(l => [l.street, l.suburb]);
  // console.log('params:', params);

  const query = `SELECT * FROM api_get_streets_from_input(
            $$${JSON.stringify(locations)}$$
          );`;

  console.log('query:', query);

  // run query to resolve locations
  try {
    const result = await testDbConnectionService.runQuery(query);
    (result.rows as StreetsBySuburbApiDb[]).forEach((row: StreetsBySuburbApiDb) => {
      console.log(row);
      // Link locations to street_by_suburb record
      const key = `${row.street_canon}|${row.suburb_name}`;
      if (uniqueLocations.has(key)) {
        uniqueLocations
          .set(key, {
            ...uniqueLocations.get(key) as ResolveMapItem,
            streetBySuburbId: row.streets_by_suburb_id,
            streetGeometry: JSON.parse(row.street_geom as string),
            suburbGeometry: JSON.parse(row.suburb_geom as string)
          });
      }
    });
    const v = [...uniqueLocations.values()];
    DebugService.writeDataForDebug(v, 'resolved-locations.json');
    console.log('resolved:', v);
    // res.json({message: 'resolved camera-locations from streets-by-suburb', result, query, locations});
    res.json({ message: 'resolved camera-locations from streets-by-suburb', resolved: v });
  } catch (err) {
    res.json({ error: err }).status(500);
  }
});

export default testDbRoutes;
