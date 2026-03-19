import { z } from "zod";

export const StreetBySuburbDbSchema = z.object({
  streets_by_suburb_id: z.int(),
  street_canon: z.string(),
  suburb_name: z.string(),
  street_osm_ids: z.array(z.int()),
  street_geom: z.json()
});

export type StreetBySuburbDb = z.infer<typeof StreetBySuburbDbSchema>;
