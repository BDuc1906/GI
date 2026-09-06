export type CompareItem = {
  id: string;
  name: string;
  type: string | null;
  rarity: number | null;
  vision?: string | null;
};

export type CompareRequest = {
  ids: string[];
  entity: "characters" | "weapons" | "artifacts";
};
