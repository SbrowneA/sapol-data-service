import { z } from "zod";

export const RegionTypeEnum = z.enum(['METRO', 'COUNTRY']);

export type RegionType = z.infer<typeof RegionTypeEnum>;

export const regionTypeValues = {
  METRO: 'METRO',
  COUNTRY: 'COUNTRY'
};
