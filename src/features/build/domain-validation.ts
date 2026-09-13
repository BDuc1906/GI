import { z } from "zod";

export const domainRecommendationSchema = z.object({
  characterId: z.string().trim().min(1, "characterId không được để trống"),
});

export type DomainRecommendationInput = z.infer<typeof domainRecommendationSchema>;
