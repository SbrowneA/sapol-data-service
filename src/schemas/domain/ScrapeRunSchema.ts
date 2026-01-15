import { z } from "zod";

export const ScrapeResultEnum = z.enum(["SUCCESS", "FAIL", "PENDING"]);

export type ScrapeRunResult = z.infer<typeof ScrapeRunSchema>;

export const ScrapeRunSchema = z.object({
  scrapeRunId: z.uuid(),
  runStart: z.iso.datetime(),
  runEnd: z.iso.datetime().optional(),
  runResult: ScrapeResultEnum
});

export type ScrapeRun = z.infer<typeof ScrapeRunSchema>;
