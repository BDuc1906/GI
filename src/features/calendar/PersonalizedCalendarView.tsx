"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { SafeImage } from "@/components/ui/SafeImage";
import { useFarmRoster, type PinnedTargetItem } from "./roster-storage";

export interface CalendarDomainItem {
  id: string;
  name: string;
  localizedName: string;
  category: "talent" | "weapon";
  regionName: string | null;
  daysOfWeek: string[];
  materials: Array<{
    name: string;
    materialId?: string | null;
    iconUrl?: string | null;
  }>;
}

export interface SelectableTarget {
  id: string;
  name: string;
  type: "character" | "weapon";
  rarity: number;
  iconUrl: string | null;
  visionOrWeaponType: string;
  materialNames: string[];
}

interface PersonalizedCalendarViewProps {
  selectedDay: string;
  weekdayLabel: string;
  categoryLabels: Record<string, string>;
  domains: CalendarDomainItem[];
  allTargets: SelectableTarget[];
}

const MAX_MATERIALS_SHOWN = 6;

export function PersonalizedCalendarView({
  selectedDay,
  weekdayLabel,
  categoryLabels,
  domains,
  allTargets,
}: PersonalizedCalendarViewProps) {
  const { targets, addTarget, removeTarget, clearAll } = useFarmRoster();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "character" | "weapon">("all");
  const [onlyShowMyDomains, setOnlyShowMyDomains] = useState(false);

  // Tập hợp các tên nguyên liệu của toàn bộ mục tiêu đã ghim
  const pinnedMaterialNames = useMemo(() => {
    const set = new Set<string>();
    targets.forEach((t) => {
      t.materialNames.forEach((m) => set.add(m.toLowerCase()));
    });
    return set;
  }, [targets]);

  // Map từ tên nguyên liệu -> danh sách các mục tiêu cần nó
  const materialToTargetsMap = useMemo(() => {
    const map = new Map<string, PinnedTargetItem[]>();
    targets.forEach((t) => {
      t.materialNames.forEach((mat) => {
        const key = mat.toLowerCase();
        const list = map.get(key) ?? [];
        list.push(t);
        map.set(key, list);
      });
    });
    return map;
  }, [targets]);

  // Kiểm tra bí cảnh có rớt nguyên liệu của mục tiêu đã ghim không
  const getDomainTargetMatches = (domain: CalendarDomainItem): PinnedTargetItem[] => {
    const matched = new Map<string, PinnedTargetItem>();
    domain.materials.forEach((m) => {
      const targetsForMat = materialToTargetsMap.get(m.name.toLowerCase());
      if (targetsForMat) {
        targetsForMat.forEach((t) => matched.set(t.id, t));
      }
    });
    return Array.from(matched.values());
  };

  // Danh sách bí cảnh mở cho mục tiêu đã ghim trong ngày đang chọn
  const domainsWithMatches = useMemo(() => {
    return domains.map((d) => ({
      domain: d,
      matchedTargets: getDomainTargetMatches(d),
    }));
  }, [domains, materialToTargetsMap]);

  const myDomainsCount = useMemo(() => {
    return domainsWithMatches.filter((item) => item.matchedTargets.length > 0).length;
  }, [domainsWithMatches]);

  // Lọc theo chế độ "Chỉ hiện bí cảnh của tôi"
  const visibleDomainItems = useMemo(() => {
    if (!onlyShowMyDomains) return domainsWithMatches;
    return domainsWithMatches.filter((item) => item.matchedTargets.length > 0);
  }, [domainsWithMatches, onlyShowMyDomains]);

  // Danh sách tìm kiếm trong Modal thêm mục tiêu
  const filteredSearchTargets = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allTargets
      .filter((t) => {
        if (activeTab !== "all" && t.type !== activeTab) return false;
        if (!q) return true;
        return t.name.toLowerCase().includes(q) || t.visionOrWeaponType.toLowerCase().includes(q);
      })
      .slice(0, 36);
  }, [allTargets, searchQuery, activeTab]);

  const talentDomains = visibleDomainItems.filter((i) => i.domain.category === "talent");
  const weaponDomains = visibleDomainItems.filter((i) => i.domain.category === "weapon");

  return (
    <div>
      {/* 1. Thanh Quản lý Mục tiêu đã ghim */}
      <div className="bg-bg-card border-2 border-border rounded-2xl p-4 md:p-5 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div>
            <h2 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
              <span>Mục tiêu cần farm của bạn</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold font-semibold">
                {targets.length} đã ghim
              </span>
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Ghim nhân vật hoặc vũ khí bạn đang nuôi để xem ngay bí cảnh hôm nay có mở không.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="btn-primary text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5"
            >
              <span>+</span>
              <span>Ghim mục tiêu</span>
            </button>
            {targets.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs px-2.5 py-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-bg-input transition-colors"
                title="Xoá tất cả mục tiêu đã ghim"
              >
                Xoá hết
              </button>
            )}
          </div>
        </div>

        {/* Danh sách chip mục tiêu đã ghim */}
        {targets.length === 0 ? (
          <div className="py-6 text-center text-xs text-text-muted">
            Chưa ghim mục tiêu nào. Hãy bấm <strong className="text-accent-bright font-semibold">+ Ghim mục tiêu</strong> để chọn nhân vật hoặc vũ khí của bạn!
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 pt-3">
            {targets.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 bg-bg-input border border-border/80 rounded-xl px-2.5 py-1 text-xs text-text-primary hover:border-gold/50 transition-colors"
              >
                {t.iconUrl && (
                  <div className="relative w-6 h-6 rounded-full overflow-hidden bg-bg-elevated shrink-0">
                    <Image src={t.iconUrl} alt={t.name} fill sizes="24px" className="object-cover" />
                  </div>
                )}
                <span className="font-medium text-xs">{t.name}</span>
                <span className="text-[10px] text-text-muted">
                  {t.type === "character" ? "Nhân vật" : "Vũ khí"}
                </span>
                <button
                  type="button"
                  onClick={() => removeTarget(t.id)}
                  className="text-text-muted hover:text-red-400 ml-1 text-sm font-bold leading-none p-0.5"
                  title={`Bỏ ghim ${t.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Banner Thông báo Kết quả Đối chiếu Hôm nay */}
      {targets.length > 0 && (
        <div className={`p-4 rounded-xl border mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          myDomainsCount > 0
            ? "bg-gold/10 border-gold/40 text-text-primary"
            : "bg-bg-card border-border text-text-secondary"
        }`}>
          <div>
            <div className="font-semibold text-sm">
              <span>
                {myDomainsCount > 0
                  ? `Hôm nay mở ${myDomainsCount} bí cảnh cho các mục tiêu của bạn!`
                  : "Hôm nay không có bí cảnh nào mở cho mục tiêu bạn đã ghim."}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              {myDomainsCount > 0
                ? "Các bí cảnh liên quan đã được đánh dấu viền vàng bên dưới."
                : "Bạn có thể dành Nhựa hôm nay để đánh Boss thế giới hoặc farm Thánh Di Vật."}
            </p>
          </div>

          {myDomainsCount > 0 && (
            <button
              type="button"
              onClick={() => setOnlyShowMyDomains(!onlyShowMyDomains)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                onlyShowMyDomains
                  ? "bg-gold text-bg-primary"
                  : "bg-bg-input border border-gold/50 text-gold hover:bg-gold/20"
              }`}
            >
              {onlyShowMyDomains ? "✕ Hiện tất cả bí cảnh" : "Chỉ hiện bí cảnh của tôi"}
            </button>
          )}
        </div>
      )}

      {/* 3. Danh sách bí cảnh (Phân theo Thiên Phú và Vũ Khí) */}
      {[
        { cat: "talent" as const, title: categoryLabels.talent, items: talentDomains },
        { cat: "weapon" as const, title: categoryLabels.weapon, items: weaponDomains },
      ].map(({ cat, title, items }) => (
        <section key={cat} className="mb-10">
          <h2 className="font-display text-xl font-bold mb-4 text-accent-bright border-b border-border pb-2 flex items-center justify-between">
            <span>
              {title} — {weekdayLabel}
              <span className="ml-2 text-sm font-normal text-text-muted">({items.length})</span>
            </span>
          </h2>

          {items.length === 0 ? (
            <p className="text-sm text-text-muted">
              {onlyShowMyDomains
                ? "Không có bí cảnh loại này mở cho mục tiêu của bạn hôm nay."
                : "Không có bí cảnh nào mở ngày này."}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map(({ domain: d, matchedTargets }) => {
                const hasMatch = matchedTargets.length > 0;
                const mats = d.materials.filter((m) => m.name);

                return (
                  <Link
                    key={d.id}
                    href={`/domains/${d.id}`}
                    className={`surface-card p-4 flex flex-col gap-3 group transition-all relative ${
                      hasMatch
                        ? "border-gold ring-1 ring-gold/40 shadow-sm shadow-gold/10 bg-gold/5"
                        : "border-border hover:border-accent-500"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-text-primary group-hover:text-accent-bright transition-colors">
                          {d.localizedName}
                        </div>
                        {hasMatch && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold text-bg-primary">
                            MỤC TIÊU CỦA BẠN
                          </span>
                        )}
                      </div>
                      {d.regionName && (
                        <div className="text-xs text-text-muted mt-0.5">{d.regionName}</div>
                      )}
                    </div>

                    {/* Huy hiệu mục tiêu liên quan */}
                    {hasMatch && (
                      <div className="flex flex-wrap gap-1.5 items-center pt-1 border-t border-gold/20 text-xs">
                        <span className="text-[11px] text-gold font-semibold">Cần bởi:</span>
                        {matchedTargets.map((tgt) => (
                          <span
                            key={tgt.id}
                            className="inline-flex items-center gap-1 bg-gold/15 text-gold px-2 py-0.5 rounded-md text-[11px] font-medium"
                          >
                            {tgt.iconUrl && (
                              <span className="relative w-3.5 h-3.5 rounded-full overflow-hidden inline-block shrink-0">
                                <Image src={tgt.iconUrl} alt={tgt.name} fill sizes="14px" className="object-cover" />
                              </span>
                            )}
                            <span>{tgt.name}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Danh sách nguyên liệu rớt */}
                    {mats.length > 0 && (
                      <ul className="flex flex-wrap gap-2">
                        {mats.slice(0, MAX_MATERIALS_SHOWN).map((m) => {
                          const isNeeded = pinnedMaterialNames.has(m.name.toLowerCase());
                          return (
                            <li
                              key={`${d.id}-${m.name}`}
                              title={m.name}
                              className={`relative w-10 h-10 rounded-lg overflow-hidden ${
                                isNeeded
                                  ? "bg-gold/20 ring-2 ring-gold"
                                  : "bg-bg-elevated"
                              }`}
                            >
                              <SafeImage
                                src={m.iconUrl}
                                alt={m.name}
                                fill
                                sizes="40px"
                                className="object-contain p-0.5"
                              />
                            </li>
                          );
                        })}
                        {mats.length > MAX_MATERIALS_SHOWN && (
                          <li className="w-10 h-10 rounded-lg border border-border text-xs text-text-muted flex items-center justify-center">
                            +{mats.length - MAX_MATERIALS_SHOWN}
                          </li>
                        )}
                      </ul>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      ))}

      {/* 4. Modal Chọn Nhân vật / Vũ khí để ghim */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-bg-card border-2 border-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-text-primary">Ghim Mục Tiêu Farm</h3>
                <p className="text-xs text-text-muted">Chọn nhân vật hoặc vũ khí bạn muốn theo dõi lịch bí cảnh</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-muted hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            {/* Modal Search & Tabs */}
            <div className="p-4 border-b border-border/60 bg-bg-primary/50 flex flex-col sm:flex-row gap-3">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên nhân vật hoặc vũ khí..."
                className="flex-1 px-3 py-2 rounded-lg bg-bg-input border border-border text-text-primary text-sm placeholder:text-text-muted"
                autoFocus
              />
              <div className="inline-flex rounded-lg border border-border bg-bg-card p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1 rounded-md ${activeTab === "all" ? "bg-accent-500 text-bg-primary font-bold" : "text-text-muted"}`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("character")}
                  className={`px-3 py-1 rounded-md ${activeTab === "character" ? "bg-accent-500 text-bg-primary font-bold" : "text-text-muted"}`}
                >
                  Nhân vật
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("weapon")}
                  className={`px-3 py-1 rounded-md ${activeTab === "weapon" ? "bg-accent-500 text-bg-primary font-bold" : "text-text-muted"}`}
                >
                  Vũ khí
                </button>
              </div>
            </div>

            {/* Modal Items Grid */}
            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {filteredSearchTargets.map((item) => {
                const isAlreadyPinned = targets.some((t) => t.id === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (isAlreadyPinned) {
                        removeTarget(item.id);
                      } else {
                        addTarget(item);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      isAlreadyPinned
                        ? "bg-gold/15 border-gold ring-1 ring-gold text-text-primary"
                        : "bg-bg-input border-border/80 hover:border-gold/50 text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {item.iconUrl ? (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-bg-elevated shrink-0">
                        <Image src={item.iconUrl} alt={item.name} fill sizes="40px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-bg-elevated flex items-center justify-center text-xs shrink-0">
                        ★{item.rarity}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate leading-tight">{item.name}</div>
                      <div className="text-[10px] text-text-muted mt-0.5 truncate">
                        {item.visionOrWeaponType} · ★{item.rarity}
                      </div>
                      <div className="text-[10px] font-bold mt-1 text-gold">
                        {isAlreadyPinned ? "✓ Đã ghim" : "+ Ghim"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="btn-primary text-xs px-5 py-2 rounded-lg"
              >
                Hoàn tất ({targets.length} mục tiêu)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
