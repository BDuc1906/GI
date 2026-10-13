"use client";

import { useState, useMemo } from "react";
import { EntityCard } from "@/components/ui/EntityCard";
import { rarityColorVar } from "@/lib/ui/theme";
import { translateStatName } from "@/core/game/stat-name-translations";
import { WeaponIcon } from "@/features/weapons/components/WeaponIcon";

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

const DENSE_GRID = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3";

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

  const hasActiveFilters =
    selectedType !== "all" || selectedRarity !== "all" || selectedSubstat !== "all" || searchQuery.trim().length > 0;

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
          TOOLBAR BỘ LỌC VŨ KHÍ NÂNG CAO
          ========================================================================= */}
      <div className="surface-card p-5 rounded-2xl border border-border bg-bg-card/90 backdrop-blur-sm space-y-4 shadow-sm">
        {/* Hàng 1: Ô tìm kiếm + Sắp xếp */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm vũ khí theo tên hoặc nội tại..."
              className="w-full text-xs px-3 py-2.5 rounded-xl bg-bg-elevated border border-border focus:border-accent-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sắp xếp */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-text-muted shrink-0">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs bg-bg-elevated border border-border rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent-500"
            >
              <option value="rarity_desc">Phẩm cấp (5★ &rarr; 1★)</option>
              <option value="atk_desc">Tấn Công Căn Bản cao nhất</option>
              <option value="name_asc">Tên (A &rarr; Z)</option>
            </select>
          </div>
        </div>

        {/* Hàng 2: Loại vũ khí + Phẩm cấp sao */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-border/60">
          {/* 5 Loại vũ khí */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-text-muted mr-1">Loại:</span>
            <button
              type="button"
              onClick={() => setSelectedType("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                selectedType === "all"
                  ? "bg-accent-500 text-white border-accent-500 font-semibold shadow-sm"
                  : "bg-bg-elevated text-text-secondary border-border hover:border-accent-500/40"
              }`}
            >
              Tất cả
            </button>
            {WEAPON_TYPES.map((wt) => {
              const active = selectedType.toLowerCase() === wt.key.toLowerCase();
              return (
                <button
                  key={wt.key}
                  type="button"
                  onClick={() => setSelectedType(wt.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all border ${
                    active
                      ? "bg-accent-500 text-white border-accent-500 font-semibold shadow-sm"
                      : "bg-bg-elevated text-text-secondary border-border hover:border-accent-500/40 hover:text-text-primary"
                  }`}
                >
                  <WeaponIcon type={wt.key} size={16} />
                  <span>{typeLabels[wt.key] ?? wt.key}</span>
                </button>
              );
            })}
          </div>

          {/* Phẩm cấp 5★, 4★, 3★ */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-bg-elevated border border-border shrink-0 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setSelectedRarity("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedRarity === "all"
                  ? "bg-accent-500 text-white font-semibold shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Tất cả
            </button>
            {[5, 4, 3, 2, 1].map((r) => {
              const active = selectedRarity === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRarity(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    active
                      ? r === 5
                        ? "bg-amber-500 text-white shadow-sm"
                        : r === 4
                          ? "bg-purple-500 text-white shadow-sm"
                          : "bg-blue-500 text-white shadow-sm"
                      : r === 5
                        ? "text-amber-400 hover:text-amber-300"
                        : r === 4
                          ? "text-purple-400 hover:text-purple-300"
                          : "text-blue-400 hover:text-blue-300"
                  }`}
                >
                  {r}★
                </button>
              );
            })}
          </div>
        </div>

        {/* Hàng 3: Lọc theo Chỉ số phụ (Substat) */}
        <div>
          <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Chỉ số phụ (Substat):</span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-accent-bright hover:underline font-medium lowercase"
              >
                ✕ Xóa bộ lọc
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUBSTAT_FILTERS.map((sub) => {
              const active = selectedSubstat === sub.key;
              return (
                <button
                  key={sub.key}
                  type="button"
                  onClick={() => setSelectedSubstat(sub.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all border ${
                    active
                      ? "bg-accent-500 text-white border-accent-500 font-semibold shadow-sm"
                      : "bg-bg-elevated/70 text-text-secondary border-border hover:border-accent-500/50 hover:text-text-primary"
                  }`}
                >
                  <span>{sub.labelVi}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Thống kê số lượng */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-text-muted">
          <span>
            Hiển thị <strong className="text-accent-bright font-semibold">{filteredWeapons.length}</strong> / {initialWeapons.length} vũ khí
          </span>
          {selectedSubstat !== "all" && (
            <span className="text-[11px] bg-accent-500/10 text-accent-bright px-2 py-0.5 rounded border border-accent-500/20">
              Chỉ số phụ: {SUBSTAT_FILTERS.find((s) => s.key === selectedSubstat)?.labelVi}
            </span>
          )}
        </div>
      </div>

      {/* =========================================================================
          LƯỚI HIỂN THỊ VŨ KHÍ
          ========================================================================= */}
      {filteredWeapons.length === 0 ? (
        <div className="text-center py-16 surface-card rounded-2xl border border-dashed border-border p-8">
          <div className="text-base font-semibold text-text-primary mb-1">
            Không tìm thấy vũ khí phù hợp
          </div>
          <p className="text-xs text-text-muted mb-4 max-w-sm mx-auto">
            Hãy thử nới lỏng bộ lọc hoặc xóa từ khóa tìm kiếm.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-accent-500 text-white hover:bg-accent-bright transition-colors"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className={DENSE_GRID}>
          {filteredWeapons.map((w) => {
            const subLabel = w.subStatName ? translateStatName(w.subStatName, locale) : null;
            const subtitleText = subLabel
              ? `${subLabel} ${w.subStatValue ? `(${w.subStatValue})` : ""}`
              : `${typeLabels[w.type] ?? w.type}`;

            return (
              <div key={w.id} className="grid-card-item">
                <EntityCard
                  href={`/weapons/${w.id}`}
                  name={w.localizedName || w.name}
                  subtitle={subtitleText}
                  rarity={w.rarity}
                  imageSrc={w.iconUrl}
                  imageFit="contain"
                  compact
                  elementColor={rarityColorVar(w.rarity)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
