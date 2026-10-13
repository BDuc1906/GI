"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import {
  MATERIAL_CATEGORIES,
  classifyMaterial,
  type MaterialCategoryKey,
} from "@/core/game/material-categories";

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

const DENSE_GRID = "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3";

export function MaterialListingClient({ initialMaterials, locale }: MaterialListingClientProps) {
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

  const hasActiveFilters = selectedCategory !== "all" || searchQuery.trim().length > 0;

  const resetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOOLBAR BỘ LỌC NGUYÊN LIỆU CHUYÊN NGHIỆP
          ========================================================================= */}
      <div className="surface-card p-5 rounded-2xl border border-border bg-bg-card/90 backdrop-blur-sm space-y-4 shadow-sm">
        {/* Hàng 1: Ô tìm kiếm */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên nguyên liệu (Việt, Anh, v.v.)..."
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

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-accent-bright hover:underline text-xs font-medium self-start sm:self-auto"
            >
              ✕ Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Hàng 2: Danh mục nguyên liệu Pills */}
        <div>
          <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
            Phân loại nguyên liệu:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {MATERIAL_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.key;
              const count = categoryCounts[cat.key] ?? 0;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all border ${
                    active
                      ? "bg-accent-500 text-white border-accent-500 font-semibold shadow-sm"
                      : "bg-bg-elevated/70 text-text-secondary border-border hover:border-accent-500/50 hover:text-text-primary"
                  }`}
                >
                  <span>{cat.nameVi}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      active ? "bg-white/20 text-white" : "bg-bg-card text-text-muted"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Thống kê kết quả */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-text-muted">
          <span>
            Hiển thị <strong className="text-accent-bright font-semibold">{filteredMaterials.length}</strong> / {initialMaterials.length} nguyên liệu
          </span>
          {selectedCategory !== "all" && (
            <span className="text-[11px] text-text-secondary italic">
              {MATERIAL_CATEGORIES.find((c) => c.key === selectedCategory)?.descriptionVi}
            </span>
          )}
        </div>
      </div>

      {/* =========================================================================
          LƯỚI HIỂN THỊ NGUYÊN LIỆU
          ========================================================================= */}
      {filteredMaterials.length === 0 ? (
        <div className="text-center py-16 surface-card rounded-2xl border border-dashed border-border p-8">
          <div className="text-base font-semibold text-text-primary mb-1">
            Không tìm thấy nguyên liệu phù hợp
          </div>
          <p className="text-xs text-text-muted mb-4 max-w-sm mx-auto">
            Hãy thử chọn danh mục khác hoặc xóa từ khóa tìm kiếm.
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
          {filteredMaterials.map((m) => {
            const catDef = MATERIAL_CATEGORIES.find((c) => c.key === m.category);

            return (
              <div key={m.id} className="grid-card-item">
                <Link
                  href={`/materials/${m.id}`}
                  className="surface-card flex flex-col items-center p-3 rounded-xl hover:border-accent-500 transition-all group h-full text-center"
                >
                  <div className="relative w-14 h-14 mb-2 rounded-lg overflow-hidden bg-bg-elevated p-1 group-hover:scale-105 transition-transform">
                    {m.iconUrl ? (
                      <SafeImage
                        src={m.iconUrl}
                        alt={m.name}
                        fallbackSrcs={[m.iconUrlOriginal]}
                        fill
                        sizes="56px"
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-text-muted">
                        {m.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="font-semibold text-xs text-text-primary line-clamp-2 mb-1 group-hover:text-accent-bright transition-colors">
                    {m.localizedName || m.name}
                  </div>

                  {catDef && (
                    <span className="text-[10px] text-text-muted mt-auto pt-1 border-t border-border/40 w-full truncate">
                      {catDef.nameVi}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
