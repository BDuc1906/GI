import { z } from "zod";

export const buildCompareSchema = z.object({
  characterId1: z.string().trim().min(1, "characterId1 không được để trống"),
  characterId2: z.string().trim().min(1, "characterId2 không được để trống"),
});

export type BuildCompareInput = z.infer<typeof buildCompareSchema>;
