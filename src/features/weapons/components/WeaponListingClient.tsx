"use client";

import { useState, useMemo } from "react";
import { WeaponCard } from "./WeaponCard";
import { translateStatName } from "@/core/game/stat-name-translations";
import { WeaponIcon } from "@/features/weapons/components/WeaponIcon";
import {
  ListFilterToolbar,
  FilterChip,
  EntityGrid,
  ListEmptyState,
} from "@/components/list-layout";

export interface WeaponListingItem {
  id: string;
  name: string;
  localizedName: string;
  type: string;
  rarity: number;
  baseAtk: number | null;
  subStatName: string | null;
  subStatValue: string | null;
  iconUrl: string | null;
  effectName: string | null;
}

interface WeaponListingClientProps {
  initialWeapons: WeaponListingItem[];
  locale: string;
  typeLabels: Record<string, string>;
}

const WEAPON_TYPES = [
  { key: "Sword" },
  { key: "Claymore" },
  { key: "Polearm" },
  { key: "Bow" },
  { key: "Catalyst" },
];

const SUBSTAT_FILTERS = [
  { key: "all", labelVi: "Tất cả chỉ số" },
  { key: "CRIT Rate", labelVi: "Tỷ Lệ Bạo Kích" },
  { key: "CRIT DMG", labelVi: "Sát Thương Bạo Kích" },
  { key: "Energy Recharge", labelVi: "Hiệu Quả Nạp" },
  { key: "Elemental Mastery", labelVi: "Tinh Thông" },
  { key: "ATK", labelVi: "Tấn Công (ATK)" },
  { key: "HP", labelVi: "Giới Hạn HP" },
  { key: "DEF", labelVi: "Phòng Ngự (DEF)" },
  { key: "Physical DMG Bonus", labelVi: "Sát Thương Vật Lý" },
];

type SortOption = "rarity_desc" | "atk_desc" | "name_asc";

export function WeaponListingClient({ initialWeapons, locale, typeLabels }: WeaponListingClientProps) {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedRarity, setSelectedRarity] = useState<number | "all">("all");
  const [selectedSubstat, setSelectedSubstat] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("rarity_desc");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWeapons = useMemo(() => {
    let result = initialWeapons.filter((w) => {
      // 1. Loại vũ khí
      if (selectedType !== "all" && w.type.toLowerCase() !== selectedType.toLowerCase()) {
        return false;
      }
      // 2. Phẩm cấp
      if (selectedRarity !== "all" && w.rarity !== selectedRarity) {
        return false;
      }
      // 3. Chỉ số phụ
      if (selectedSubstat !== "all") {
        if (!w.subStatName) return false;
        if (selectedSubstat === "ATK" && !w.subStatName.includes("ATK")) return false;
        if (selectedSubstat === "HP" && !w.subStatName.includes("HP")) return false;
        if (selectedSubstat === "DEF" && !w.subStatName.includes("DEF")) return false;
        if (
          !["ATK", "HP", "DEF"].includes(selectedSubstat) &&
          !w.subStatName.toLowerCase().includes(selectedSubstat.toLowerCase())
        ) {
          return false;
        }
      }
      // 4. Tìm kiếm
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = w.name.toLowerCase().includes(q);
        const matchLoc = w.localizedName.toLowerCase().includes(q);
        const matchEffect = (w.effectName ?? "").toLowerCase().includes(q);
        if (!matchName && !matchLoc && !matchEffect) return false;
      }
      return true;
    });

    // Sắp xếp
    result = [...result].sort((a, b) => {
      if (sortBy === "atk_desc") {
        return (b.baseAtk ?? 0) - (a.baseAtk ?? 0);
      }
      if (sortBy === "name_asc") {
        return (a.localizedName || a.name).localeCompare(b.localizedName || b.name);
      }
      // Mặc định: rarity desc, rồi atk desc
      if (b.rarity !== a.rarity) return b.rarity - a.rarity;
      return (b.baseAtk ?? 0) - (a.baseAtk ?? 0);
    });

    return result;
  }, [initialWeapons, selectedType, selectedRarity, selectedSubstat, sortBy, searchQuery]);

  const activeFiltersCount =
    (selectedType !== "all" ? 1 : 0) +
    (selectedRarity !== "all" ? 1 : 0) +
    (selectedSubstat !== "all" ? 1 : 0) +
    (searchQuery.trim().length > 0 ? 1 : 0);

  const resetFilters = () => {
    setSelectedType("all");
    setSelectedRarity("all");
    setSelectedSubstat("all");
    setSortBy("rarity_desc");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOOLBAR BỘ LỌC VŨ KHÍ NÂNG CAO (LEIBO DESIGN SYSTEM V1.0)
          ========================================================================= */}
      <ListFilterToolbar
        activeCount={activeFiltersCount}
        onClear={resetFilters}
        clearLabel="Xóa bộ lọc"
        mobileFilterLabel="Bộ lọc"
        searchSlot={
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between w-full">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm vũ khí theo tên hoặc nội tại..."
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-bg-elevated border border-border focus:border-accent-500 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sắp xếp */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-muted shrink-0">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-xs bg-bg-elevated border border-border rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent-500"
              >
                <option value="rarity_desc">Phẩm cấp (5★ &rarr; 1★)</option>
                <option value="atk_desc">Tấn công căn bản cao nhất</option>
                <option value="name_asc">Tên (A &rarr; Z)</option>
              </select>
            </div>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          {/* Hàng: Loại vũ khí */}
          <div>
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
              Loại vũ khí:
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <FilterChip
                label="Tất cả"
                active={selectedType === "all"}
                onClick={() => setSelectedType("all")}
                size="sm"
              />
              {WEAPON_TYPES.map((wt) => (
                <FilterChip
                  key={wt.key}
                  label={typeLabels[wt.key] ?? wt.key}
                  icon={<WeaponIcon type={wt.key} size={15} />}
                  active={selectedType.toLowerCase() === wt.key.toLowerCase()}
                  onClick={() => setSelectedType(wt.key)}
                  size="sm"
                />
              ))}
            </div>
          </div>

          {/* Hàng: Phẩm cấp sao */}
          <div>
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
              Độ hiếm (Sao):
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <FilterChip
                label="Tất cả"
                active={selectedRarity === "all"}
                onClick={() => setSelectedRarity("all")}
                size="sm"
              />
              {[5, 4, 3, 2, 1].map((r) => (
                <FilterChip
                  key={r}
                  label={`${r}★`}
                  active={selectedRarity === r}
                  onClick={() => setSelectedRarity(r)}
                  size="sm"
                  className={
                    selectedRarity === r
                      ? ""
                      : r === 5
                      ? "!text-amber-400"
                      : r === 4
                      ? "!text-purple-400"
                      : "!text-blue-400"
                  }
                />
              ))}
            </div>
          </div>

          {/* Hàng: Lọc theo Chỉ số phụ (Substat) */}
          <div>
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
              Chỉ số phụ (Substat):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUBSTAT_FILTERS.map((sub) => (
                <FilterChip
                  key={sub.key}
                  label={sub.labelVi}
                  active={selectedSubstat === sub.key}
                  onClick={() => setSelectedSubstat(sub.key)}
                  size="sm"
                />
              ))}
            </div>
          </div>
        </div>
      </ListFilterToolbar>

      {/* =========================================================================
          THỐNG KÊ KẾT QUẢ
          ========================================================================= */}
      <div className="flex items-center justify-between text-xs text-text-muted px-1">
        <span>
          Hiển thị <strong className="text-accent-bright font-semibold tabular-nums">{filteredWeapons.length}</strong> / {initialWeapons.length} vũ khí
        </span>
        {selectedSubstat !== "all" && (
          <span className="text-[11px] text-accent-bright">
            Chỉ số phụ: {SUBSTAT_FILTERS.find((s) => s.key === selectedSubstat)?.labelVi}
          </span>
        )}
      </div>

      {/* =========================================================================
          LƯỚI HIỂN THỊ VŨ KHÍ (ENTITY GRID COMPACT — NO 10 COLUMNS)
          ========================================================================= */}
      {filteredWeapons.length === 0 ? (
        <ListEmptyState
          title="Không tìm thấy vũ khí phù hợp"
          description="Hãy thử nới lỏng bộ lọc hoặc xóa từ khóa tìm kiếm."
          onReset={resetFilters}
        />
      ) : (
        <EntityGrid variant="compact">
          {filteredWeapons.map((w) => {
            const subLabel = w.subStatName ? translateStatName(w.subStatName, locale) : null;

            return (
              <div key={w.id} className="h-full">
                <WeaponCard
                  id={w.id}
                  name={w.localizedName || w.name}
                  type={typeLabels[w.type] ?? w.type}
                  rarity={w.rarity}
                  baseAtk={w.baseAtk}
                  subStatName={subLabel}
                  subStatValue={w.subStatValue}
                  iconUrl={w.iconUrl}
                />
              </div>
            );
          })}
        </EntityGrid>
      )}
    </div>
  );
}
