"use client";

import { useState, useMemo } from "react";
import { ArtifactSetCard } from "./ArtifactSetCard";
import {
  ARTIFACT_CATEGORIES,
  categorizeArtifactSet,
  type ArtifactStatCategory,
} from "@/core/game/artifact-filter-categories";
import { ArtifactOddsTable } from "./ArtifactOddsTable";
import {
  ListFilterToolbar,
  FilterChip,
  EntityGrid,
  ListEmptyState,
} from "@/components/list-layout";

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

export function ArtifactListingClient({ initialSets, locale: _locale }: ArtifactListingClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<number | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<ArtifactStatCategory>("all");
  const [showOddsTable, setShowOddsTable] = useState(false);

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

  const activeFiltersCount =
    (selectedRarity !== "all" ? 1 : 0) +
    (selectedCategory !== "all" ? 1 : 0) +
    (searchQuery.trim().length > 0 ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedRarity("all");
    setSelectedCategory("all");
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOOLBAR BỘ LỌC CHUYÊN NGHIỆP (LEIBO DESIGN SYSTEM V1.0)
          ========================================================================= */}
      <ListFilterToolbar
        activeCount={activeFiltersCount}
        onClear={resetFilters}
        clearLabel="Xóa bộ lọc"
        mobileFilterLabel="Bộ lọc"
        searchSlot={
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên bộ, hiệu ứng 2 mảnh / 4 mảnh..."
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
          {/* Hàng: Phẩm cấp Rarity */}
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
              <FilterChip
                label="5★"
                active={selectedRarity === 5}
                onClick={() => setSelectedRarity(5)}
                size="sm"
                className={selectedRarity === 5 ? "" : "!text-amber-400"}
              />
              <FilterChip
                label="4★"
                active={selectedRarity === 4}
                onClick={() => setSelectedRarity(4)}
                size="sm"
                className={selectedRarity === 4 ? "" : "!text-purple-400"}
              />
              <FilterChip
                label="3★"
                active={selectedRarity === 3}
                onClick={() => setSelectedRarity(3)}
                size="sm"
                className={selectedRarity === 3 ? "" : "!text-blue-400"}
              />
            </div>
          </div>

          {/* Hàng: Lọc theo Cơ Chế Hiệu Ứng Bộ (Stat Category Pills) */}
          <div>
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
              Loại hiệu ứng & Chỉ số tăng cường:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ARTIFACT_CATEGORIES.map((cat) => (
                <FilterChip
                  key={cat.key}
                  label={cat.nameVi}
                  active={selectedCategory === cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  size="sm"
                />
              ))}
            </div>
          </div>
        </div>
      </ListFilterToolbar>

      {/* Báo cáo số lượng & Toggle Bảng Xác Suất */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted px-1">
        <div className="flex items-center gap-3">
          <span>
            Hiển thị <strong className="text-accent-bright font-semibold tabular-nums">{filteredSets.length}</strong> / {initialSets.length} bộ Thánh Di Vật
          </span>
          {selectedCategory !== "all" && (
            <span className="text-[11px] text-accent-bright">
              Đang lọc: {ARTIFACT_CATEGORIES.find((c) => c.key === selectedCategory)?.nameVi}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowOddsTable((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            showOddsTable
              ? "bg-accent-500 text-white border-accent-500 shadow-sm"
              : "bg-bg-elevated border-border text-text-primary hover:border-accent-500 hover:text-accent-bright"
          }`}
        >
          <span>📊</span>
          <span>{showOddsTable ? "Đóng Bảng Xác Suất KQM" : "Bảng Xác Suất & Bậc Roll Dòng Phụ (KQM)"}</span>
        </button>
      </div>

      {showOddsTable && <ArtifactOddsTable />}

      {/* =========================================================================
          LƯỚI HIỂN THỊ THÁNH DI VẬT (ENTITY GRID COMPACT — NO 10 COLUMNS)
          ========================================================================= */}
      {filteredSets.length === 0 ? (
        <ListEmptyState
          title="Không tìm thấy bộ Thánh Di Vật phù hợp"
          description="Hãy thử xóa bớt tiêu chí lọc hoặc thay đổi từ khóa tìm kiếm."
          onReset={resetFilters}
        />
      ) : (
        <EntityGrid variant="compact">
          {filteredSets.map((a) => (
            <div key={a.id} className="h-full">
              <ArtifactSetCard
                id={a.id}
                name={a.localizedName || a.name}
                rarityRange={a.rarityRange}
                twoPieceBonus={a.twoPieceBonus}
                fourPieceBonus={a.fourPieceBonus}
                imageSrc={a.imageSrc}
              />
            </div>
          ))}
        </EntityGrid>
      )}
    </div>
  );
}
