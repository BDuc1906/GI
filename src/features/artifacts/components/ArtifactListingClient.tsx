"use client";

import { useState, useMemo } from "react";
import { EntityCard } from "@/components/ui/EntityCard";
import { rarityColorVar } from "@/lib/ui/theme";
import {
  ARTIFACT_CATEGORIES,
  categorizeArtifactSet,
  type ArtifactStatCategory,
} from "@/core/game/artifact-filter-categories";

export interface ArtifactListingItem {
  id: string;
  name: string;
  localizedName: string;
  rarityRange: number[];
  twoPieceBonus: string | null;
  fourPieceBonus: string | null;
  imageSrc: string | null;
}

interface ArtifactListingClientProps {
  initialSets: ArtifactListingItem[];
  locale: string;
}

const DENSE_GRID = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3";

export function ArtifactListingClient({ initialSets, locale: _locale }: ArtifactListingClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<number | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<ArtifactStatCategory>("all");

  // Gắn nhãn phân loại cho từng bộ
  const enrichedSets = useMemo(() => {
    return initialSets.map((set) => {
      const maxRarity = Math.max(...(set.rarityRange || [4]));
      const categories = categorizeArtifactSet(set.twoPieceBonus, set.fourPieceBonus, set.name);
      return {
        ...set,
        maxRarity,
        categories,
      };
    });
  }, [initialSets]);

  // Bộ lọc tương tác tức thì
  const filteredSets = useMemo(() => {
    return enrichedSets.filter((set) => {
      // 1. Lọc theo Phẩm cấp
      if (selectedRarity !== "all") {
        if (selectedRarity === 5 && set.maxRarity < 5) return false;
        if (selectedRarity === 4 && (set.maxRarity !== 4 || set.rarityRange.includes(5))) return false;
        if (selectedRarity <= 3 && set.maxRarity > 3) return false;
      }

      // 2. Lọc theo Danh mục hiệu ứng
      if (selectedCategory !== "all" && !set.categories.includes(selectedCategory)) {
        return false;
      }

      // 3. Lọc theo Tìm kiếm
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = set.name.toLowerCase().includes(q);
        const matchLoc = set.localizedName.toLowerCase().includes(q);
        const matchBonus = `${set.twoPieceBonus ?? ""} ${set.fourPieceBonus ?? ""}`.toLowerCase().includes(q);
        if (!matchName && !matchLoc && !matchBonus) return false;
      }

      return true;
    });
  }, [enrichedSets, selectedRarity, selectedCategory, searchQuery]);

  const hasActiveFilters = selectedRarity !== "all" || selectedCategory !== "all" || searchQuery.trim().length > 0;

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedRarity("all");
    setSelectedCategory("all");
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOOLBAR BỘ LỌC CHUYÊN NGHIỆP
          ========================================================================= */}
      <div className="surface-card p-5 rounded-2xl border border-border bg-bg-card/90 backdrop-blur-sm space-y-4 shadow-sm">
        {/* Hàng 1: Ô tìm kiếm + Lọc Rarity */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên bộ, hiệu ứng 2 mảnh / 4 mảnh..."
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

          {/* Phẩm cấp Rarity */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-bg-elevated border border-border shrink-0 self-start sm:self-auto">
            <span className="text-[11px] font-semibold text-text-muted px-2 hidden sm:inline">Phẩm cấp:</span>
            <button
              type="button"
              onClick={() => setSelectedRarity("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedRarity === "all"
                  ? "bg-accent-500 text-white font-semibold shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setSelectedRarity(5)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRarity === 5
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-amber-400 hover:text-amber-300"
              }`}
            >
              5★
            </button>
            <button
              type="button"
              onClick={() => setSelectedRarity(4)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRarity === 4
                  ? "bg-purple-500 text-white shadow-sm"
                  : "text-purple-400 hover:text-purple-300"
              }`}
            >
              4★
            </button>
            <button
              type="button"
              onClick={() => setSelectedRarity(3)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedRarity === 3
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-blue-400 hover:text-blue-300"
              }`}
            >
              3★
            </button>
          </div>
        </div>

        {/* Hàng 2: Lọc theo Cơ Chế Hiệu Ứng Bộ (Stat Category Pills) */}
        <div>
          <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Loại hiệu ứng & Chỉ số tăng cường:</span>
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
            {ARTIFACT_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                    active
                      ? "bg-accent-500 text-white border-accent-500 font-semibold shadow-sm"
                      : "bg-bg-elevated/70 text-text-secondary border-border hover:border-accent-500/50 hover:text-text-primary"
                  }`}
                >
                  <span>{cat.nameVi}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Báo cáo số lượng */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-text-muted">
          <span>
            Hiển thị <strong className="text-accent-bright font-semibold">{filteredSets.length}</strong> / {initialSets.length} bộ Thánh Di Vật
          </span>
          {selectedCategory !== "all" && (
            <span className="text-[11px] bg-accent-500/10 text-accent-bright px-2 py-0.5 rounded border border-accent-500/20">
              Đang lọc: {ARTIFACT_CATEGORIES.find((c) => c.key === selectedCategory)?.nameVi}
            </span>
          )}
        </div>
      </div>

      {/* =========================================================================
          LƯỚI HIỂN THỊ THÁNH DI VẬT
          ========================================================================= */}
      {filteredSets.length === 0 ? (
        <div className="text-center py-16 surface-card rounded-2xl border border-dashed border-border p-8">
          <div className="text-base font-semibold text-text-primary mb-1">
            Không tìm thấy bộ Thánh Di Vật phù hợp
          </div>
          <p className="text-xs text-text-muted mb-4 max-w-sm mx-auto">
            Hãy thử xóa bớt tiêu chí lọc hoặc thay đổi từ khóa tìm kiếm.
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
          {filteredSets.map((a) => (
            <div key={a.id} className="grid-card-item">
              <EntityCard
                href={`/artifacts/${a.id}`}
                name={a.localizedName || a.name}
                subtitle={`${a.rarityRange.join("/")}★`}
                rarity={a.maxRarity}
                imageSrc={a.imageSrc}
                imageFit="contain"
                compact
                elementColor={rarityColorVar(a.maxRarity)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
