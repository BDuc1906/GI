export type RecommendedDomain = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  recommendReason: string;
};

export type DomainRecommendation = {
  characterId: string;
  characterName: string;
  vision: string | null;
  recommendedDomains: RecommendedDomain[];
  farmingPlan: string;
};
