import { z } from 'zod';

export const SuburbDbSchema = z.object({
  suburb_osm_id: z.int(),
  suburb_name: z.string(),
  suburb_geom: z.json()
});

export type SuburbDb = z.infer<typeof SuburbDbSchema>;