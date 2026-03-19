import { z } from 'zod';

export const ResolvedCameraLocationDbSchema = z.object({
  resolved_location_id: z.int(),
  location_id: z.int(),
  resolution_run_id: z.int(),
  street_by_suburb_id: z.string()
});

export const ResolvedCameraLocationInsertDbSchema = ResolvedCameraLocationDbSchema
  .omit({ resolved_location_id: true });

export type ResolvedCameraLocationDb = z.infer<typeof ResolvedCameraLocationDbSchema>;
export type ResolvedCameraLocationInsertDb = z.infer<typeof ResolvedCameraLocationInsertDbSchema>;
