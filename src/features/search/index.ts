export type SearchType = "characters" | "weapons" | "artifacts" | "domains";

export type SearchFilter = {
  query?: string;
  page?: number;
  limit?: number;
  types?: SearchType[];
};

export const SEARCH_TYPES: SearchType[] = [
  "characters",
  "weapons",
  "artifacts",
  "domains",
];
