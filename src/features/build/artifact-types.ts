export type RecommendedArtifact = {
  id: string;
  name: string;
  rarityRange?: number[];
  twoPieceBonus: string | null;
  fourPieceBonus: string | null;
};

export type ArtifactRecommendation = {
  characterId: string;
  characterName: string;
  vision: string | null;
  recommendedArtifacts: RecommendedArtifact[];
  buildSummary: string;
};
