import { getTranslations } from "next-intl/server";
import { ElementIcon } from "@/features/characters/components/ElementIcon";
import { WeaponIcon } from "@/features/weapons/components/WeaponIcon";
import { RarityStars } from "@/components/ui/RarityStars";
import { getElementNameByKey } from "@/core/game/element-reactions-data";
import {
  buildFilterQuery,
  type CharacterListingFilters,
} from "@/features/characters/listing";
import { ListFilterToolbar, FilterChip } from "@/components/list-layout";

interface CharacterFilterBarProps {
  locale: string;
  filters: CharacterListingFilters;
  visionRows: { vision: string; elementIcon: string | null }[];
  regionRows: string[];
  weaponTypes: readonly string[];
}

/** Một nhóm bộ lọc — label cố định bên trái, danh sách FilterChip dạng hàng cuộn/wrap mượt mà */
function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 py-2 border-b border-border/40 last:border-b-0">
      <span className="text-xs text-text-muted font-semibold w-24 shrink-0">{label}:</span>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

/**
 * Thanh công cụ tìm kiếm và bộ lọc đa chiều trang Nhân vật.
 * Tích hợp ListFilterToolbar chuẩn LEIBO v1.0, tự động thu gọn trên mobile và hiển thị rõ ràng trên desktop.
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

  const activeCount =
    filters.vision.length +
    filters.weapon.length +
    filters.region.length +
    filters.rarity.length +
    (filters.q ? 1 : 0);

  const searchSlot = (
    <form method="GET" action="" className="flex gap-2 w-full">
      {filters.vision.length > 0 && <input type="hidden" name="vision" value={filters.vision.join(",")} />}
      {filters.weapon.length > 0 && <input type="hidden" name="weapon" value={filters.weapon.join(",")} />}
      {filters.region.length > 0 && <input type="hidden" name="region" value={filters.region.join(",")} />}
      {filters.rarity.length > 0 && <input type="hidden" name="rarity" value={filters.rarity.join(",")} />}
      <div className="relative flex-1">
        <input
          type="search"
          name="q"
          defaultValue={filters.q || ""}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="w-full rounded-xl border border-border bg-bg-input px-3.5 py-2 text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-500 transition-colors"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-accent-500 text-bg-primary hover:bg-accent-bright transition-colors shrink-0"
      >
        {t("searchButton")}
      </button>
    </form>
  );

  return (
    <ListFilterToolbar
      searchSlot={searchSlot}
      activeCount={activeCount}
      clearHref="/characters"
      clearLabel={t("clearAllFilters")}
      mobileFilterLabel="Bộ lọc"
      className="mb-8"
    >
      {/* ── BỘ LỌC NGUYÊN TỐ (VISION) ── */}
      <FilterGroup label={t("filterVision")}>
        {visionRows.map(({ vision: v, elementIcon }) => {
          const isActive = filters.vision.includes(v);
          return (
            <FilterChip
              key={v}
              href={`/characters?${buildFilterQuery(filters, { vision: v }, { toggle: true })}`}
              active={isActive}
              size="sm"
              icon={<ElementIcon vision={v} iconUrl={elementIcon} size={15} glow={isActive} />}
              label={v === "None" ? t("noElement") : getElementNameByKey(v, locale)}
            />
          );
        })}
      </FilterGroup>

      {/* ── BỘ LỌC LOẠI VŨ KHÍ ── */}
      <FilterGroup label={t("filterWeapon")}>
        {weaponTypes.map((w) => {
          const isActive = filters.weapon.includes(w);
          return (
            <FilterChip
              key={w}
              href={`/characters?${buildFilterQuery(filters, { weapon: w }, { toggle: true })}`}
              active={isActive}
              size="sm"
              icon={<WeaponIcon type={w} size={15} />}
              label={tWeaponType(w as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst")}
            />
          );
        })}
      </FilterGroup>

      {/* ── BỘ LỌC KHU VỰC / QUỐC GIA ── */}
      <FilterGroup label={t("filterRegion")}>
        {regionRows.map((r) => {
          const isActive = filters.region.includes(r);
          return (
            <FilterChip
              key={r}
              href={`/characters?${buildFilterQuery(filters, { region: r }, { toggle: true })}`}
              active={isActive}
              size="sm"
              label={tRegion(r as "Mondstadt" | "Liyue" | "Inazuma" | "Sumeru" | "Fontaine" | "Natlan" | "Snezhnaya" | "Nod-Krai")}
            />
          );
        })}
      </FilterGroup>

      {/* ── BỘ LỌC PHẨM CẤP SAO (RARITY) ── */}
      <FilterGroup label={t("filterRarity")}>
        {[5, 4].map((r) => {
          const isActive = filters.rarity.includes(r);
          return (
            <FilterChip
              key={r}
              href={`/characters?${buildFilterQuery(filters, { rarity: String(r) }, { toggle: true })}`}
              active={isActive}
              size="sm"
              icon={<RarityStars count={r} size="sm" />}
              label={`${r}★`}
              style={
                isActive
                  ? {
                      backgroundColor: r >= 5 ? "rgba(245, 158, 11, 0.15)" : "rgba(167, 136, 212, 0.15)",
                      color: r >= 5 ? "var(--rarity-5)" : "var(--rarity-4)",
                      borderColor: r >= 5 ? "var(--rarity-5)" : "var(--rarity-4)",
                    }
                  : undefined
              }
            />
          );
        })}
      </FilterGroup>
    </ListFilterToolbar>
  );
}
