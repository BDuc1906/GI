"use client";

import { useState, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { EntityCard } from "@/components/ui/EntityCard";
import { ElementIcon } from "@/features/characters/components/ElementIcon";
import { elementColorVar } from "@/lib/ui/theme";

export interface HomeCharacterItem {
  id: string;
  name: string;
  vision: string;
  weaponType: string;
  rarity: number;
  iconUrl: string | null;
}

interface HomeCharacterExplorerProps {
  characters: HomeCharacterItem[];
  charCount: number;
  locale: string;
}

const ELEMENTS = [
  { key: "ALL", label: "Tất cả" },
  { key: "Anemo", label: "Phong" },
  { key: "Pyro", label: "Hỏa" },
  { key: "Hydro", label: "Thủy" },
  { key: "Electro", label: "Lôi" },
  { key: "Dendro", label: "Thảo" },
  { key: "Cryo", label: "Băng" },
  { key: "Geo", label: "Nham" },
] as const;

export function HomeCharacterExplorer({
  characters,
  charCount,
}: HomeCharacterExplorerProps) {
  const [selectedElement, setSelectedElement] = useState<string>("ALL");
  const [selectedRarity, setSelectedRarity] = useState<number | "ALL">("ALL");

  const filtered = useMemo(() => {
    return characters.filter((c) => {
      const matchElement = selectedElement === "ALL" || c.vision.toLowerCase() === selectedElement.toLowerCase();
      const matchRarity = selectedRarity === "ALL" || c.rarity === selectedRarity;
      return matchElement && matchRarity;
    });
  }, [characters, selectedElement, selectedRarity]);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-accent-500" />
            <span className="text-xs font-mono uppercase tracking-wider text-accent-bright font-semibold">
              Kho Dữ Liệu Nhân Vật
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold text-text-primary tracking-tight">
            Khám Phá Nhân Vật Theo Nguyên Tố
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Xem thiên phú, chỉ số đột phá và vũ khí khuyên dùng theo từng nguyên tố
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-sm">
          <Link
            href="/characters"
            className="text-xs sm:text-sm font-semibold text-text-secondary hover:text-text-primary hover:underline flex items-center gap-1"
          >
            Xem tất cả {charCount} nhân vật &rarr;
          </Link>
        </div>
      </div>

      {/* Filter Control Bar: 7 Game Elements + Rarity Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-2 rounded-xl bg-bg-card/70 border border-border/70 backdrop-blur-sm">
        {/* Elemental Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {ELEMENTS.map((el) => {
            const active = selectedElement === el.key;
            return (
              <button
                key={el.key}
                type="button"
                onClick={() => setSelectedElement(el.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-accent-500 text-bg-primary shadow-sm"
                    : "bg-bg-elevated/60 text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-border/40"
                }`}
              >
                {el.key !== "ALL" && (
                  <ElementIcon vision={el.key} size={15} glow={false} />
                )}
                <span>{el.label}</span>
              </button>
            );
          })}
        </div>

        {/* Rarity Filters */}
        <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
          <button
            type="button"
            onClick={() => setSelectedRarity("ALL")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              selectedRarity === "ALL"
                ? "bg-bg-elevated text-text-primary border border-border"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            Tất cả sao
          </button>
          <button
            type="button"
            onClick={() => setSelectedRarity(5)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedRarity === 5
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                : "text-amber-400/70 hover:text-amber-300"
            }`}
          >
            5★
          </button>
          <button
            type="button"
            onClick={() => setSelectedRarity(4)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedRarity === 4
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                : "text-purple-400/70 hover:text-purple-300"
            }`}
          >
            4★
          </button>
        </div>
      </div>

      {/* Characters Matrix Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {filtered.map((c) => (
            <EntityCard
              key={c.id}
              href={`/characters/${c.id}`}
              name={c.name}
              subtitle={c.weaponType}
              rarity={c.rarity}
              imageSrc={c.iconUrl}
              imageFit="contain"
              element={c.vision}
              elementColor={elementColorVar(c.vision)}
              useEnhancedStars={true}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-text-muted rounded-xl bg-bg-card/40 border border-border/40">
          <p className="text-sm">Không có nhân vật nào phù hợp với bộ lọc hiện tại.</p>
        </div>
      )}
    </section>
  );
}
