import { z } from "zod";

export const teamCompositionSchema = z.object({
  characterId: z.string().trim().min(1, "characterId không được để trống"),
});

export type TeamCompositionInput = z.infer<typeof teamCompositionSchema>;
