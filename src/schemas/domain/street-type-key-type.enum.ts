import { z } from 'zod';

export const StreetTypeKeyTypeEnum = z.enum(['CANONICAL', 'ABBREVIATION', 'VARIANT']);

export type StreetTypeKeyTypeEnumType = z.infer<typeof StreetTypeKeyTypeEnum>;

export const streetTypeKeyTypeValues = {
  CANONICAL: 'CANONICAL',
  ABBREVIATION: 'ABBREVIATION',
  VARIANT: 'VARIANT'
}