import { z } from 'zod';
import { StreetTypeKeyTypeEnum } from '../domain/street-type-key-type.enum.ts';

export const StreetTypeSchemaDb = z.object({
  street_type_key: z.string().uppercase(),
  canonical_key: z.string().uppercase(),
  key_type: StreetTypeKeyTypeEnum,

  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime().optional(),
});

export const StreetTypeInsertSchemaDb =
  StreetTypeSchemaDb.omit({ created_at: true, updated_at: true });

export type StreetTypeDb = z.infer<typeof StreetTypeSchemaDb>;
export type StreetTypeDbInsert = z.infer<typeof StreetTypeInsertSchemaDb>;
