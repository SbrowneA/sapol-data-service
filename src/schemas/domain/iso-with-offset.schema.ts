import { z } from "zod";

export const IsoDateTimeWithOffset = z.iso.datetime({ offset: true});