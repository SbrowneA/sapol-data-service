import { z } from 'zod';
import { StreetTypeKeyTypeEnum } from '../domain/street-type-key-type.enum.ts';

export const StreetTypeKeyTypeSchemaDb = z.object({
  key_type: StreetTypeKeyTypeEnum,
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime().optional(),
});

export type StreetTypeKeyTypeDb = z.infer<typeof StreetTypeKeyTypeSchemaDb>;
