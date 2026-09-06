/**
 * Parse + build query string cho trang danh sách nhân vật (/characters).
 * Toàn bộ hàm ở đây là pure function — không đụng DB, không đụng React —
 * để test được độc lập và tái dùng nếu sau này có trang filter tương tự
 * (vd /weapons).
 */

export interface CharacterListingFilters {
  vision: string[];
  weapon: string[];
  region: string[];
  rarity: number[];
  q?: string;
}

export interface CharacterListingSearchParams {
  vision?: string;
  weapon?: string;
  region?: string;
  rarity?: string;
  q?: string;
}

export function parseMulti(value?: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function toggleValue(current: string[], value: string): string[] {
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

export function parseCharacterFilters(searchParams: CharacterListingSearchParams): CharacterListingFilters {
  const { vision, weapon, region, rarity, q } = searchParams;
  return {
    vision: parseMulti(vision),
    weapon: parseMulti(weapon),
    region: parseMulti(region),
    rarity: parseMulti(rarity)
      .map(Number)
      .filter((n) => !Number.isNaN(n)),
    q,
  };
}

export function hasActiveFilters(filters: CharacterListingFilters): boolean {
  return (
    filters.vision.length > 0 ||
    filters.weapon.length > 0 ||
    filters.region.length > 0 ||
    filters.rarity.length > 0 ||
    Boolean(filters.q)
  );
}

type FilterKey = "vision" | "weapon" | "region" | "rarity";

/**
 * Xây lại query string khi người dùng bấm chọn/bỏ chọn 1 filter chip,
 * giữ nguyên các filter còn lại — dùng làm href cho <Link> trong filter bar.
 */
export function buildFilterQuery(
  filters: CharacterListingFilters,
  changes: Partial<Record<FilterKey, string>>,
  opts: { toggle?: boolean } = {}
): string {
  const sp = new URLSearchParams();
  let nextVision = filters.vision;
  let nextWeapon = filters.weapon;
  let nextRegion = filters.region;
  let nextRarity = filters.rarity.map(String);

  if (changes.vision !== undefined) {
    nextVision = opts.toggle ? toggleValue(filters.vision, changes.vision) : parseMulti(changes.vision);
  }
  if (changes.weapon !== undefined) {
    nextWeapon = opts.toggle ? toggleValue(filters.weapon, changes.weapon) : parseMulti(changes.weapon);
  }
  if (changes.region !== undefined) {
    nextRegion = opts.toggle ? toggleValue(filters.region, changes.region) : parseMulti(changes.region);
  }
  if (changes.rarity !== undefined) {
    nextRarity = opts.toggle
      ? toggleValue(filters.rarity.map(String), changes.rarity)
      : parseMulti(changes.rarity);
  }

  if (nextVision.length > 0) sp.set("vision", nextVision.join(","));
  if (nextWeapon.length > 0) sp.set("weapon", nextWeapon.join(","));
  if (nextRegion.length > 0) sp.set("region", nextRegion.join(","));
  if (nextRarity.length > 0) sp.set("rarity", nextRarity.join(","));
  if (filters.q) sp.set("q", filters.q);
  return sp.toString();
}
