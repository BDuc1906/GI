import type { AppLocale } from "@/i18n/routing";

type SearchEntity = {
  id: string;
  name: string;
  nameTranslations: unknown;
};

export type SearchCharacter = SearchEntity & {
  vision: string;
  weaponType: string;
  rarity: number;
  iconUrl: string | null;
  elementIcon: string | null;
};

export type SearchWeapon = SearchEntity & {
  type: string;
  rarity: number;
  iconUrl: string | null;
};

export type SearchArtifact = SearchEntity & {
  rarityRange: number[];
  iconUrl: string | null;
};

export type SearchDomain = SearchEntity & {
  category: string;
  imageUrl: string | null;
  imageUrlOriginal: string | null;
};

export type SearchMaterial = SearchEntity & {
  iconUrl: string | null;
  iconUrlOriginal: string | null;
};

export type SearchRepo = {
  searchCharacters: (query: string, limit: number, locale: AppLocale) => Promise<SearchCharacter[]>;
  searchWeapons: (query: string, limit: number, locale: AppLocale) => Promise<SearchWeapon[]>;
  searchArtifacts: (query: string, limit: number, locale: AppLocale) => Promise<SearchArtifact[]>;
  searchDomains: (query: string, limit: number, locale: AppLocale) => Promise<SearchDomain[]>;
  searchMaterials: (query: string, limit: number, locale: AppLocale) => Promise<SearchMaterial[]>;
};

export class SearchService {
  constructor(private readonly repo: SearchRepo) {}

  async search(query: string, options?: { limit?: number; locale?: AppLocale }) {
    const normalized = query.trim();
    if (!normalized) {
      throw new Error("Query không được để trống");
    }

    const limit = Math.min(Math.max(options?.limit ?? 12, 1), 50);
    const locale = options?.locale ?? "en";

    const [characters, weapons, artifacts, domains, materials] = await Promise.all([
      this.repo.searchCharacters(normalized, limit, locale),
      this.repo.searchWeapons(normalized, limit, locale),
      this.repo.searchArtifacts(normalized, limit, locale),
      this.repo.searchDomains(normalized, limit, locale),
      this.repo.searchMaterials(normalized, limit, locale),
    ]);

    return {
      query: normalized,
      total:
        characters.length +
        weapons.length +
        artifacts.length +
        domains.length +
        materials.length,
      characters,
      weapons,
      artifacts,
      domains,
      materials,
    };
  }
}
