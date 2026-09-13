export type RepositoryQuery<TQuery = Record<string, unknown>> = TQuery;

export interface Repository<T, TQuery = Record<string, unknown>> {
  findMany(query?: TQuery): Promise<T[]>;
  findById(id: string): Promise<T | null>;
}

export const repos = {
  characters: "characters",
  weapons: "weapons",
  artifacts: "artifacts",
  domains: "domains",
  materials: "materials",
};
