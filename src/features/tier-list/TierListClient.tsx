"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { ElementIcon } from "@/features/characters/components/ElementIcon";
import { WeaponIcon } from "@/features/weapons/components/WeaponIcon";
import {
  META_TIER_LIST,
  ROLE_LABELS,
  TIER_CONFIG,
  type MetaRole,
  type MetaTier,
  type GameMode,
  type TierListCharacterEntry,
} from "@/core/game/tier-list-data";
import { elementColorVar } from "@/lib/ui/theme";

export interface EnrichedTierCharacter extends TierListCharacterEntry {
  name: string;
  localizedName: string;
  iconUrl: string | null;
  vision: string;
  weaponType: string;
  rarity: number;
}

interface TierListClientProps {
  characters: EnrichedTierCharacter[];
  locale: string;
  translations: {
    title: string;
    subtitle: string;
    modeAbyss: string;
    modeTheater: string;
    filterRole: string;
    filterElement: string;
    filterWeapon: string;
    searchPlaceholder: string;
    all: string;
    clearFilters: string;
    noResults: string;
    bestWeaponLabel: string;
    bestArtifactLabel: string;
    viewDetails: string;
  };
}

const ELEMENTS = [
  { key: "Pyro", nameVi: "Hỏa", color: "var(--el-pyro)" },
  { key: "Hydro", nameVi: "Thủy", color: "var(--el-hydro)" },
  { key: "Anemo", nameVi: "Phong", color: "var(--el-anemo)" },
  { key: "Electro", nameVi: "Lôi", color: "var(--el-electro)" },
  { key: "Dendro", nameVi: "Thảo", color: "var(--el-dendro)" },
  { key: "Cryo", nameVi: "Băng", color: "var(--el-cryo)" },
  { key: "Geo", nameVi: "Nham", color: "var(--el-geo)" },
];

const WEAPONS = [
  { key: "Sword", nameVi: "Kiếm Đơn" },
  { key: "Claymore", nameVi: "Trọng Kiếm" },
  { key: "Polearm", nameVi: "Cán Dài" },
  { key: "Bow", nameVi: "Cung" },
  { key: "Catalyst", nameVi: "Pháp Khí" },
];

const TIERS: MetaTier[] = ["SS", "S", "A", "B", "C"];

export function TierListClient({ characters, locale, translations: t }: TierListClientProps) {
  const [mode, setMode] = useState<GameMode>("abyss");
  const [selectedRole, setSelectedRole] = useState<MetaRole | "all">("all");
  const [selectedElement, setSelectedElement] = useState<string>("all");
  const [selectedWeapon, setSelectedWeapon] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalChar, setActiveModalChar] = useState<EnrichedTierCharacter | null>(null);

  // Lọc dữ liệu theo toàn bộ tiêu chí
  const filteredCharacters = useMemo(() => {
    return characters.filter((c) => {
      // 1. Lọc Role
      if (selectedRole !== "all" && !c.roles.includes(selectedRole)) {
        return false;
      }
      // 2. Lọc Hệ
      if (selectedElement !== "all" && c.vision.toLowerCase() !== selectedElement.toLowerCase()) {
        return false;
      }
      // 3. Lọc Vũ Khí
      if (selectedWeapon !== "all" && c.weaponType.toLowerCase() !== selectedWeapon.toLowerCase()) {
        return false;
      }
      // 4. Lọc Tìm Kiếm (Tên tiếng Việt hoặc tiếng Anh)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchName = c.name.toLowerCase().includes(query);
        const matchLocalized = c.localizedName.toLowerCase().includes(query);
        const matchId = c.characterId.toLowerCase().includes(query);
        if (!matchName && !matchLocalized && !matchId) return false;
      }
      return true;
    });
  }, [characters, selectedRole, selectedElement, selectedWeapon, searchQuery]);

  // Gom nhóm theo từng Tier dựa theo chế độ chơi hiện tại
  const groupedByTier = useMemo(() => {
    const map: Record<MetaTier, EnrichedTierCharacter[]> = {
      SS: [],
      S: [],
      A: [],
      B: [],
      C: [],
    };

    filteredCharacters.forEach((c) => {
      const tier = mode === "abyss" ? c.tier : c.theaterTier;
      if (map[tier]) {
        map[tier].push(c);
      }
    });

    return map;
  }, [filteredCharacters, mode]);

  const hasActiveFilters =
    selectedRole !== "all" || selectedElement !== "all" || selectedWeapon !== "all" || searchQuery.trim().length > 0;

  const resetFilters = () => {
    setSelectedRole("all");
    setSelectedElement("all");
    setSelectedWeapon("all");
    setSearchQuery("");
  };

  return (
    <div className="space-y-8">
      {/* =========================================================================
          CONTROL PANEL: CHỌN CHẾ ĐỘ & BỘ LỌC ĐA CHIỀU (Role, Element, Weapon, Search)
          ========================================================================= */}
      <div className="surface-card p-6 rounded-2xl border border-border bg-bg-card/90 backdrop-blur-sm shadow-md space-y-6">
        {/* Hàng 1: Chuyển đổi Chế Độ Chơi (La Hoàn vs Nhà Hát) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
          <div>
            <div className="text-eyebrow text-accent-bright mb-1">CHẾ ĐỘ ENDGAME</div>
            <div className="text-xs text-text-secondary">
              Bảng xếp hạng cập nhật theo chu kỳ meta mới nhất, phản ánh chính xác hiệu quả chiến đấu thực tế.
            </div>
          </div>
          <div className="flex rounded-xl p-1 bg-bg-elevated border border-border shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setMode("abyss")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === "abyss"
                  ? "bg-accent-500 text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {t.modeAbyss}
            </button>
            <button
              type="button"
              onClick={() => setMode("theater")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === "theater"
                  ? "bg-accent-500 text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {t.modeTheater}
            </button>
          </div>
        </div>

        {/* Hàng 2: Lọc theo Vai Trò (Roles) */}
        <div>
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2.5">
            {t.filterRole}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedRole("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                selectedRole === "all"
                  ? "bg-accent-500 text-white border-accent-500"
                  : "bg-bg-elevated/70 text-text-secondary border-border hover:border-accent-bright/50"
              }`}
            >
              {t.all}
            </button>
            {(["main_dps", "sub_dps", "support", "sustain"] as MetaRole[]).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  selectedRole === role
                    ? "bg-accent-500 text-white border-accent-500"
                    : "bg-bg-elevated/70 text-text-secondary border-border hover:border-accent-bright/50"
                }`}
              >
                {ROLE_LABELS[role].vi}
              </button>
            ))}
          </div>
        </div>

        {/* Hàng 3: Lọc theo Nguyên Tố & Vũ Khí & Ô Tìm Kiếm */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end pt-2">
          {/* Lọc Nguyên tố — Sử dụng icon thật trong game từ ElementIcon */}
          <div className="lg:col-span-5">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              {t.filterElement}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedElement("all")}
                className={`px-2.5 py-1.5 rounded text-xs transition-colors border ${
                  selectedElement === "all"
                    ? "bg-accent-500 text-white border-accent-500 font-semibold"
                    : "bg-bg-elevated/60 text-text-secondary border-border hover:text-text-primary"
                }`}
              >
                {t.all}
              </button>
              {ELEMENTS.map((el) => {
                const isSelected = selectedElement.toLowerCase() === el.key.toLowerCase();
                return (
                  <button
                    key={el.key}
                    type="button"
                    onClick={() => setSelectedElement(el.key)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all border ${
                      isSelected
                        ? "text-white font-semibold shadow-sm border-transparent"
                        : "bg-bg-elevated/60 text-text-secondary border-border hover:border-accent-500/40"
                    }`}
                    style={isSelected ? { backgroundColor: el.color } : {}}
                  >
                    <ElementIcon vision={el.key} size={16} glow={false} />
                    <span>{el.nameVi}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lọc Vũ khí — Sử dụng icon thật trong game từ WeaponIcon */}
          <div className="lg:col-span-4">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              {t.filterWeapon}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedWeapon("all")}
                className={`px-2.5 py-1.5 rounded text-xs transition-colors border ${
                  selectedWeapon === "all"
                    ? "bg-accent-500 text-white border-accent-500 font-semibold"
                    : "bg-bg-elevated/60 text-text-secondary border-border hover:text-text-primary"
                }`}
              >
                {t.all}
              </button>
              {WEAPONS.map((w) => (
                <button
                  key={w.key}
                  type="button"
                  onClick={() => setSelectedWeapon(w.key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors border ${
                    selectedWeapon === w.key
                      ? "bg-accent-500 text-white border-accent-500 font-semibold"
                      : "bg-bg-elevated/60 text-text-secondary border-border hover:text-text-primary"
                  }`}
                >
                  <WeaponIcon type={w.key} size={16} />
                  <span>{w.nameVi}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ô tìm kiếm */}
          <div className="lg:col-span-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full text-xs px-3 py-2.5 rounded-lg bg-bg-elevated border border-border focus:border-accent-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Báo cáo trạng thái bộ lọc */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
            <span className="text-text-secondary">
              Tìm thấy <strong className="text-accent-bright">{filteredCharacters.length}</strong> nhân vật phù hợp
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="text-accent-bright hover:underline font-medium"
            >
              {t.clearFilters}
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          TIER ROWS DISPLAY (SS -> S -> A -> B -> C)
          ========================================================================= */}
      {filteredCharacters.length === 0 ? (
        <div className="text-center py-16 surface-card rounded-2xl border border-dashed border-border p-8">
          <div className="text-base font-semibold text-text-primary mb-1">{t.noResults}</div>
          <div className="text-xs text-text-muted mb-4">
            Không tìm thấy nhân vật nào khớp với tiêu chí lọc hiện tại.
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-accent-500 text-white hover:bg-accent-bright transition-colors"
          >
            {t.clearFilters}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {TIERS.map((tier) => {
            const tierChars = groupedByTier[tier];
            if (tierChars.length === 0) return null;

            const config = TIER_CONFIG[tier];

            return (
              <div
                key={tier}
                className={`surface-card rounded-2xl border ${config.border} overflow-hidden shadow-sm transition-all`}
              >
                {/* Header của Tier */}
                <div className="p-4 sm:p-5 border-b border-border bg-bg-elevated/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-black tracking-wider shadow-sm ${config.badgeBg} ${config.badgeText}`}
                    >
                      TIER {tier}
                    </span>
                    <div>
                      <h2 className="font-display font-bold text-sm sm:text-base text-text-primary">
                        {config.labelVi}
                      </h2>
                      <p className="text-xs text-text-muted hidden sm:block">
                        {config.descriptionVi}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-text-secondary bg-bg-elevated px-2.5 py-1 rounded-md border border-border self-start md:self-auto">
                    {tierChars.length} nhân vật
                  </div>
                </div>

                {/* Grid các nhân vật trong Tier */}
                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                    {tierChars.map((c) => {
                      const elColor = elementColorVar(c.vision);
                      const roleConfig = ROLE_LABELS[c.primaryRole];

                      return (
                        <div
                          key={c.characterId}
                          className="group relative flex flex-col rounded-xl border border-border hover:border-accent-500/70 bg-bg-elevated/40 hover:bg-bg-elevated transition-all overflow-hidden cursor-pointer"
                          onClick={() => setActiveModalChar(c)}
                        >
                          {/* Khung avatar ảnh thật */}
                          <div
                            className="relative aspect-square w-full overflow-hidden bg-bg-elevated"
                            style={{
                              background: `radial-gradient(circle at 50% 120%, ${elColor}30 0%, transparent 70%)`,
                            }}
                          >
                            {c.iconUrl ? (
                              <SafeImage
                                src={c.iconUrl}
                                alt={c.name}
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 160px"
                                className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-text-muted">
                                {c.name}
                              </div>
                            )}

                            {/* Badge Nguyên Tố ở góc trên trái — icon thật trong game */}
                            <div
                              className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-sm flex items-center gap-1"
                              style={{ backgroundColor: elColor }}
                            >
                              <ElementIcon vision={c.vision} size={14} glow={false} />
                              <span>{c.vision}</span>
                            </div>

                            {/* Badge Phẩm cấp ở góc trên phải */}
                            <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-300">
                              {"★".repeat(c.rarity)}
                            </div>
                          </div>

                          {/* Thông tin vắn tắt */}
                          <div className="p-2.5 flex flex-col justify-between flex-1 space-y-1.5">
                            <div>
                              <div className="font-semibold text-xs text-text-primary truncate">
                                {c.localizedName || c.name}
                              </div>
                              <div className="text-[10px] text-text-muted mt-0.5">
                                <span className="truncate">{roleConfig.vi.split(" ")[0]}</span>
                              </div>
                            </div>

                            {/* Nút xem nhanh / link */}
                            <div className="pt-1.5 border-t border-border/60 flex items-center justify-between text-[10px]">
                              <div className="flex items-center gap-1 text-text-muted truncate max-w-[80px]">
                                <WeaponIcon type={c.weaponType} size={13} />
                                <span>{c.weaponType}</span>
                              </div>
                              <span className="text-accent-bright font-medium group-hover:underline">
                                Chi tiết &rarr;
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          MODAL CHI TIẾT ĐỊNH VỊ SỨC MẠNH & PROS/CONS
          ========================================================================= */}
      {activeModalChar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveModalChar(null)}
        >
          <div
            className="surface-card w-full max-w-lg rounded-2xl border border-accent-500/40 p-6 shadow-2xl relative space-y-5 bg-bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-start gap-4">
              <div
                className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border"
                style={{ borderColor: elementColorVar(activeModalChar.vision) }}
              >
                {activeModalChar.iconUrl && (
                  <SafeImage
                    src={activeModalChar.iconUrl}
                    alt={activeModalChar.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-lg text-text-primary truncate">
                    {activeModalChar.localizedName || activeModalChar.name}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      TIER_CONFIG[mode === "abyss" ? activeModalChar.tier : activeModalChar.theaterTier].badgeBg
                    } text-white`}
                  >
                    TIER {mode === "abyss" ? activeModalChar.tier : activeModalChar.theaterTier}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted mt-1">
                  <ElementIcon vision={activeModalChar.vision} size={15} glow={false} />
                  <span>{activeModalChar.vision}</span>
                  <span>·</span>
                  <WeaponIcon type={activeModalChar.weaponType} size={15} />
                  <span>{activeModalChar.weaponType}</span>
                  <span>·</span>
                  <span>{ROLE_LABELS[activeModalChar.primaryRole].vi}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalChar(null)}
                className="text-text-muted hover:text-text-primary p-1 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Tóm tắt sức mạnh */}
            <div className="p-3 rounded-xl bg-bg-elevated border border-border text-xs leading-relaxed text-text-secondary">
              {activeModalChar.summaryVi}
            </div>

            {/* Ưu điểm & Nhược điểm */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Điểm mạnh nổi bật (Pros):</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-text-secondary pl-1">
                  {activeModalChar.prosVi.map((pro, i) => (
                    <li key={i}>{pro}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>Lưu ý / Nhược điểm (Cons):</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-text-secondary pl-1">
                  {activeModalChar.consVi.map((con, i) => (
                    <li key={i}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Đề xuất Vũ khí & Thánh di vật */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border text-xs">
              <div className="p-2.5 rounded-lg bg-bg-elevated border border-border">
                <div className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">
                  {t.bestWeaponLabel}
                </div>
                <div className="font-medium text-text-primary truncate">
                  {activeModalChar.bestWeaponVi}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-bg-elevated border border-border">
                <div className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">
                  {t.bestArtifactLabel}
                </div>
                <div className="font-medium text-text-primary truncate">
                  {activeModalChar.bestArtifactVi}
                </div>
              </div>
            </div>

            {/* Nút Xem Trang Chi Tiết */}
            <div className="pt-2 flex gap-3">
              <Link
                href={`/characters/${activeModalChar.characterId}`}
                className="flex-1 text-center py-2.5 px-4 rounded-xl text-xs font-semibold bg-accent-500 text-white hover:bg-accent-bright transition-colors shadow-sm"
              >
                {t.viewDetails} &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
