"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { MaterialCard } from "./MaterialCard";
import {
  MATERIAL_CATEGORIES,
  classifyMaterial,
  type MaterialCategoryKey,
} from "@/core/game/material-categories";
import {
  ListFilterToolbar,
  FilterChip,
  EntityGrid,
  ListEmptyState,
} from "@/components/list-layout";

export interface MaterialListingItem {
  id: string;
  name: string;
  localizedName: string;
  iconUrl: string | null;
  iconUrlOriginal: string | null;
  gameVersion: string | null;
}

interface MaterialListingClientProps {
  initialMaterials: MaterialListingItem[];
  locale: string;
}

export function MaterialListingClient({ initialMaterials, locale: _locale }: MaterialListingClientProps) {
  const t = useTranslations("Materials");
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategoryKey>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Gắn danh mục phân loại cho từng nguyên liệu
  const enrichedMaterials = useMemo(() => {
    return initialMaterials.map((m) => {
      const category = classifyMaterial(m.id, m.name);
      return {
        ...m,
        category,
      };
    });
  }, [initialMaterials]);

  // Bộ lọc tức thì
  const filteredMaterials = useMemo(() => {
    return enrichedMaterials.filter((m) => {
      // 1. Danh mục
      if (selectedCategory !== "all" && m.category !== selectedCategory) {
        return false;
      }
      // 2. Tìm kiếm
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = m.name.toLowerCase().includes(q);
        const matchLoc = m.localizedName.toLowerCase().includes(q);
        const matchId = m.id.toLowerCase().includes(q);
        if (!matchName && !matchLoc && !matchId) return false;
      }
      return true;
    });
  }, [enrichedMaterials, selectedCategory, searchQuery]);

  // Đếm số lượng theo từng danh mục
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: initialMaterials.length };
    enrichedMaterials.forEach((m) => {
      counts[m.category] = (counts[m.category] ?? 0) + 1;
    });
    return counts;
  }, [enrichedMaterials, initialMaterials.length]);

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) + (searchQuery.trim().length > 0 ? 1 : 0);

  const resetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOOLBAR BỘ LỌC NGUYÊN LIỆU ĐA NGÔN NGỮ (LEIBO DESIGN SYSTEM V1.0)
          ========================================================================= */}
      <ListFilterToolbar
        activeCount={activeFiltersCount}
        onClear={resetFilters}
        clearLabel={t("clearFilters")}
        mobileFilterLabel="Bộ lọc"
        searchSlot={
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
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
        }
      >
        <div className="space-y-4 pt-2">
          {/* Danh mục nguyên liệu Pills */}
          <div>
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
              {t("filterCategoryLabel")}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MATERIAL_CATEGORIES.map((cat) => {
                const active = selectedCategory === cat.key;
                const count = categoryCounts[cat.key] ?? 0;
                return (
                  <FilterChip
                    key={cat.key}
                    label={t(`categories.${cat.key}`)}
                    count={count}
                    active={active}
                    onClick={() => setSelectedCategory(cat.key)}
                    size="sm"
                  />
                );
              })}
            </div>
          </div>
        </div>
      </ListFilterToolbar>

      {/* Thống kê kết quả */}
      <div className="flex items-center justify-between text-xs text-text-muted px-1">
        <span>
          {t("showingCount", { filtered: filteredMaterials.length, total: initialMaterials.length })}
        </span>
        {selectedCategory !== "all" && (
          <span className="text-[11px] text-accent-bright italic">
            {t(`categories.${selectedCategory}Desc`)}
          </span>
        )}
      </div>

      {/* =========================================================================
          LƯỚI HIỂN THỊ NGUYÊN LIỆU (ENTITY GRID COMPACT — NO 10 COLUMNS)
          ========================================================================= */}
      {filteredMaterials.length === 0 ? (
        <ListEmptyState
          title={t("emptyTitle")}
          description={t("emptyDesc")}
          resetLabel={t("resetBtn")}
          onReset={resetFilters}
        />
      ) : (
        <EntityGrid variant="compact">
          {filteredMaterials.map((m) => (
            <div key={m.id} className="h-full">
              <MaterialCard
                id={m.id}
                name={m.localizedName || m.name}
                category={m.category}
                categoryLabel={t(`categories.${m.category}`)}
                iconUrl={m.iconUrl}
                iconUrlOriginal={m.iconUrlOriginal}
                gameVersion={m.gameVersion}
              />
            </div>
          ))}
        </EntityGrid>
      )}
    </div>
  );
}
