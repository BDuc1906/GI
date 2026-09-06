import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ElementIcon } from "@/components/character/ElementIcon";
import { WeaponIcon } from "@/components/weapon/WeaponIcon";
import { rarityStars } from "@/lib/ui/theme";
import { getElementNameByKey } from "@/lib/game/element-reactions-data";
import {
  buildFilterQuery,
  hasActiveFilters,
  type CharacterListingFilters,
} from "@/features/characters/listing";

interface CharacterFilterBarProps {
  locale: string;
  filters: CharacterListingFilters;
  visionRows: { vision: string; elementIcon: string | null }[];
  regionRows: string[];
  weaponTypes: readonly string[];
}

/** Một nhóm bộ lọc — label cố định bên trái, chip cuộn ngang trên mobile
 *  thay vì wrap tự do, để 4 nhóm liên tiếp không biến thành khối dài vô tận. */
function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-b-0">
      <span className="text-xs text-text-muted font-medium w-24 shrink-0 pt-1.5">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

/**
 * Thanh tìm kiếm + toàn bộ nhóm filter (vision/weapon/region/rarity) của
 * trang /characters. Server Component riêng — chỉ nhận filter đã parse
 * sẵn + data tra cứu (visionRows/regionRows), không tự đụng Prisma.
 */
export async function CharacterFilterBar({
  locale,
  filters,
  visionRows,
  regionRows,
  weaponTypes,
}: CharacterFilterBarProps) {
  const t = await getTranslations({ locale, namespace: "Characters" });
  const tWeaponType = await getTranslations({ locale, namespace: "WeaponType" });
  const tRegion = await getTranslations({ locale, namespace: "Region" });

  const activeFilters = hasActiveFilters(filters);

  return (
    <>
      <form method="GET" className="flex gap-2 mb-5">
        {filters.vision.length > 0 && <input type="hidden" name="vision" value={filters.vision.join(",")} />}
        {filters.weapon.length > 0 && <input type="hidden" name="weapon" value={filters.weapon.join(",")} />}
        {filters.region.length > 0 && <input type="hidden" name="region" value={filters.region.join(",")} />}
        {filters.rarity.length > 0 && <input type="hidden" name="rarity" value={filters.rarity.join(",")} />}
        <input
          type="text"
          name="q"
          defaultValue={filters.q || ""}
          placeholder={t("searchPlaceholder")}
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm placeholder:text-text-muted focus:outline-none focus:border-border-strong transition-colors"
        />
        <button type="submit" className="btn-accent rounded-lg px-4 py-2 text-sm">
          {t("searchButton")}
        </button>
      </form>

      <div className="surface-glass border border-border rounded-xl mb-8 px-4">
        <FilterGroup label={t("filterVision")}>
          {visionRows.map(({ vision: v, elementIcon }) => {
            const isActive = filters.vision.includes(v);
            return (
              <Link
                key={v}
                href={`/characters?${buildFilterQuery(filters, { vision: v }, { toggle: true })}`}
                aria-pressed={isActive}
                className="chip px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs"
              >
                <ElementIcon vision={v} iconUrl={elementIcon} size={14} />
                {v === "None" ? t("noElement") : getElementNameByKey(v, locale)}
              </Link>
            );
          })}
        </FilterGroup>

        <FilterGroup label={t("filterWeapon")}>
          {weaponTypes.map((w) => (
            <Link
              key={w}
              href={`/characters?${buildFilterQuery(filters, { weapon: w }, { toggle: true })}`}
              aria-pressed={filters.weapon.includes(w)}
              className="chip px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs"
            >
              <WeaponIcon type={w} size={14} />
              {tWeaponType(w as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst")}
            </Link>
          ))}
        </FilterGroup>

        <FilterGroup label={t("filterRegion")}>
          {regionRows.map((r) => (
            <Link
              key={r}
              href={`/characters?${buildFilterQuery(filters, { region: r }, { toggle: true })}`}
              aria-pressed={filters.region.includes(r)}
              className="chip px-2.5 py-1 rounded-full text-xs"
            >
              {tRegion(r as "Mondstadt" | "Liyue" | "Inazuma" | "Sumeru" | "Fontaine" | "Natlan" | "Snezhnaya" | "Nod-Krai")}
            </Link>
          ))}
        </FilterGroup>

        <FilterGroup label={t("filterRarity")}>
          {[5, 4].map((r) => (
            <Link
              key={r}
              href={`/characters?${buildFilterQuery(filters, { rarity: String(r) }, { toggle: true })}`}
              aria-pressed={filters.rarity.includes(r)}
              className="chip px-2.5 py-1 rounded-full text-xs text-[color:var(--rarity-5)] font-semibold"
            >
              {rarityStars(r)}
            </Link>
          ))}
          {activeFilters && (
            <Link
              href="/characters"
              className="ml-auto text-xs text-text-muted hover:text-text-primary transition-colors underline underline-offset-2"
            >
              {t("clearAllFilters")}
            </Link>
          )}
        </FilterGroup>
      </div>
    </>
  );
}
