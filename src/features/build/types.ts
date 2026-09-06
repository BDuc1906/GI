export type BuildRecommendation = {
  characterId: string;
  characterName: string;
  vision: string | null;
  weaponType: string | null;
  recommendedWeapon: {
    id: string;
    name: string;
    type: string | null;
    rarity: number | null;
  } | null;
  summary: string;
};

export type BuildRecommendationRequest = {
  characterId: string;
  weaponId?: string;
};
