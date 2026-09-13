export type SearchRepo = {
  searchCharacters: (query: string, limit: number) => Promise<unknown[]>;
  searchWeapons: (query: string, limit: number) => Promise<unknown[]>;
  searchArtifacts: (query: string, limit: number) => Promise<unknown[]>;
  searchDomains: (query: string, limit: number) => Promise<unknown[]>;
};

export class SearchService {
  constructor(private readonly repo: SearchRepo) {}

  async search(query: string, options?: { limit?: number }) {
    const normalized = query.trim();
    if (!normalized) {
      throw new Error("Query không được để trống");
    }

    const limit = Math.min(Math.max(options?.limit ?? 12, 1), 50);

    const [characters, weapons, artifacts, domains] = await Promise.all([
      this.repo.searchCharacters(normalized, limit),
      this.repo.searchWeapons(normalized, limit),
      this.repo.searchArtifacts(normalized, limit),
      this.repo.searchDomains(normalized, limit),
    ]);

    return {
      query: normalized,
      total: characters.length + weapons.length + artifacts.length + domains.length,
      characters,
      weapons,
      artifacts,
      domains,
    };
  }
}
