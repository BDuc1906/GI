import { z } from "zod";

export const buildRecommendationSchema = z.object({
  characterId: z.string().trim().min(1, "characterId không được để trống"),
  weaponId: z.string().trim().min(1).optional(),
});

export type BuildRecommendationInput = z.infer<typeof buildRecommendationSchema>;
