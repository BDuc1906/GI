import { z } from "zod";

export const artifactRecommendationSchema = z.object({
  characterId: z.string().trim().min(1, "characterId không được để trống"),
  vision: z.string().trim().min(1).optional(),
});

export type ArtifactRecommendationInput = z.infer<typeof artifactRecommendationSchema>;
