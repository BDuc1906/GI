import { z } from "zod";

export const fullBuildPlanSchema = z.object({
  characterId: z.string().trim().min(1, "characterId không được để trống"),
});

export type FullBuildPlanInput = z.infer<typeof fullBuildPlanSchema>;
