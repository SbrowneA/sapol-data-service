import { z } from "zod";
import {ScrapeResultEnum} from "../domain/ScrapeRunSchema.ts";
import {IsoDateTimeWithOffset} from "../domain/iso-with-offset.schema.ts";

export const ScrapeRunSchemaDb = z.object({
  scrape_run_id: z.int(),
  run_start: IsoDateTimeWithOffset,
  run_end: IsoDateTimeWithOffset,
  run_result: ScrapeResultEnum,
  created_at: IsoDateTimeWithOffset,
  edited_at: IsoDateTimeWithOffset.nullable()
});
export const ScrapeRunSchemaInsertDb = ScrapeRunSchemaDb
  .omit({scrape_run_id: true, created_at: true, edited_at: true, run_end: true});

export type ScrapeRunDb = z.infer<typeof ScrapeRunSchemaDb>;
export type ScrapeRunInsertDb = z.infer<typeof ScrapeRunSchemaInsertDb>;
