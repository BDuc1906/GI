export type TeamMember = {
  id: string;
  name: string;
  vision: string | null;
  weaponType: string | null;
  rarity: number | null;
  synergy: number; // 0-100, synergy score với main character
  role: string; // DPS, Support, Healer, Sub-DPS
  reason: string;
};

export type TeamCompositionRecommendation = {
  mainCharacterId: string;
  mainCharacterName: string;
  mainCharacterVision: string | null;
  recommendedTeamMembers: TeamMember[];
  teamComposition: string;
  teamSynergy: string;
};
