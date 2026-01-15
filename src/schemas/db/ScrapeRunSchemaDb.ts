import { z } from "zod";
import {ScrapeResultEnum} from "../domain/ScrapeRunSchema.ts";

export const ScrapeRunSchemaDb = z.object({
  scrape_run_id: z.uuid(),
  run_start: z.iso.datetime(),
  run_end: z.iso.datetime(),
  run_result: ScrapeResultEnum
});

export type ScrapeRunDb = z.infer<typeof ScrapeRunSchemaDb>;