"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { RarityStars } from "@/components/ui/RarityStars";

interface CharacterOption {
  id: string;
  name: string;
  vision: string;
  rarity: number;
  iconUrl: string | null;
  elementIcon: string | null;
}

interface PlanMaterial {
  materialId?: string;
  name: string;
  quantity: number;
}

interface MatchedDomain {
  id: string;
  name: string;
  category: string;
  daysOfWeek: string[];
  dropsMaterials: string[];
}

interface CalculatorResult {
  characterName: string;
  ascension: { currentLevel: number; targetLevel: number; materials: PlanMaterial[] };
  talent?: { materials: PlanMaterial[] };
  domains: MatchedDomain[];
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Hàm tính ước tính EXP Sách Kinh Nghiệm & Mora theo khoảng level
function estimateExpAndMora(current: number, target: number, includeTalents: boolean, talentLevel: number) {
  // Bảng kinh nghiệm xấp xỉ nhân vật 1-90
  const expTotal = Math.max(0, (target - current) * 93500);
  const herosWitCount = Math.round(expTotal / 20000);
  const charMora = Math.round(herosWitCount * 4000 + (target - current) * 12000);

  // Mora thiên phú (nâng 3 skill từ 1 lên talentLevel)
  const talentMoraTable: Record<number, number> = {
    1: 0,
    2: 12500,
    3: 17500,
    4: 25000,
    5: 30000,
    6: 37500,
    7: 120000,
    8: 260000,
    9: 450000,
    10: 700000,
  };

  let talentMora = 0;
  if (includeTalents) {
    for (let i = 2; i <= talentLevel; i++) {
      talentMora += (talentMoraTable[i] || 0) * 3; // 3 kỹ năng
    }
  }

  return {
    herosWit: herosWitCount,
    totalMora: charMora + talentMora,
  };
}

const PRESETS = [
  { label: "1 → 90 (Tối đa)", current: 1, target: 90, talent: 10 },
  { label: "80 → 90 (Đột phá 6)", current: 80, target: 90, talent: 10 },
  { label: "1 → 80 (Tiết kiệm)", current: 1, target: 80, talent: 8 },
  { label: "70 → 80 (Thăng cấp)", current: 70, target: 80, talent: 8 },
];

export function MaterialCalculatorClient({ characters }: { characters: CharacterOption[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CharacterOption | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [targetLevel, setTargetLevel] = useState(90);
  const [includeTalent, setIncludeTalent] = useState(true);
  const [talentTarget, setTalentTarget] = useState(9);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return characters.slice(0, 12);
    const q = query.toLowerCase();
    return characters.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 12);
  }, [characters, query]);

  const estimates = useMemo(() => {
    return estimateExpAndMora(currentLevel, targetLevel, includeTalent, talentTarget);
  }, [currentLevel, targetLevel, includeTalent, talentTarget]);

  async function handleCalculate() {
    if (!selected) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/tools/material-calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: selected.id,
          currentLevel,
          targetLevel,
          includeTalent,
          talentLevels: { normalAttack: 1, elementalSkill: 1, elementalBurst: 1 },
          targetTalentLevels: {
            normalAttack: talentTarget,
            elementalSkill: talentTarget,
            elementalBurst: talentTarget,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || "Tính toán thất bại");
      }
      setResult(json.data as CalculatorResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tính toán");
    } finally {
      setLoading(false);
    }
  }

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setCurrentLevel(preset.current);
    setTargetLevel(preset.target);
    setTalentTarget(preset.talent);
  };

  return (
    <div className="space-y-6">
      {/* 1. Chọn nhân vật */}
      <div className="bg-bg-card border border-border rounded-2xl p-5 shadow-sm">
        <label className="block text-sm font-semibold text-text-primary mb-2">
          1. Chọn nhân vật mục tiêu
        </label>
        {selected ? (
          <div className="flex items-center justify-between bg-bg-elevated border border-accent-500/40 rounded-xl p-3.5">
            <div className="flex items-center gap-3.5">
              {selected.iconUrl && (
                <Image
                  src={selected.iconUrl}
                  alt={selected.name}
                  width={46}
                  height={46}
                  className="rounded-full ring-2 ring-accent-500/40 bg-bg-primary"
                />
              )}
              <div>
                <div className="font-bold text-text-primary text-base flex items-center gap-2">
                  {selected.name}
                  <span className="text-xs px-2 py-0.5 rounded bg-bg-secondary text-text-secondary border border-border">
                    {selected.vision}
                  </span>
                </div>
                <RarityStars count={selected.rarity} size="sm" />
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-bg-secondary text-text-muted hover:text-text-primary transition-colors"
            >
              Đổi nhân vật
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="🔍 Nhập tên nhân vật (ví dụ: Kazuha, Raiden, Hu Tao, Furina...)"
              className="w-full bg-bg-primary border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-500 transition-colors"
            />
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="flex items-center gap-2.5 bg-bg-primary border border-border/80 rounded-xl p-2 hover:border-accent-500/50 hover:bg-bg-elevated transition-all text-left group"
                >
                  {c.iconUrl && (
                    <Image
                      src={c.iconUrl}
                      alt={c.name}
                      width={32}
                      height={32}
                      className="rounded-full shrink-0 group-hover:scale-105 transition-transform"
                    />
                  )}
                  <span className="text-xs font-medium text-text-primary truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 2. Khoảng cấp độ & Thiết lập nâng cấp */}
      <div className="bg-bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-text-primary">
            2. Thiết lập mục tiêu nâng cấp
          </label>
          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg border border-border bg-bg-primary hover:bg-bg-elevated hover:border-accent-500/50 text-text-secondary hover:text-accent-bright transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-bg-primary border border-border/70 rounded-xl p-3">
            <span className="text-xs text-text-muted font-medium block mb-1">Cấp độ hiện tại</span>
            <input
              type="number"
              min={1}
              max={90}
              value={currentLevel}
              onChange={(e) => setCurrentLevel(Math.min(90, Math.max(1, Number(e.target.value) || 1)))}
              className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-1.5 text-text-primary font-mono font-bold text-sm"
            />
          </div>
          <div className="bg-bg-primary border border-border/70 rounded-xl p-3">
            <span className="text-xs text-text-muted font-medium block mb-1">Cấp độ mục tiêu</span>
            <input
              type="number"
              min={1}
              max={90}
              value={targetLevel}
              onChange={(e) => setTargetLevel(Math.min(90, Math.max(1, Number(e.target.value) || 90)))}
              className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-1.5 text-text-primary font-mono font-bold text-sm"
            />
          </div>
        </div>

        <div className="bg-bg-primary border border-border/70 rounded-xl p-3.5 space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={includeTalent}
              onChange={(e) => setIncludeTalent(e.target.checked)}
              className="accent-amber-400 w-4 h-4 rounded"
            />
            <span className="text-sm font-medium text-text-primary">
              Bao gồm nguyên liệu nâng Thiên phú (3 kỹ năng chính lên cấp {talentTarget})
            </span>
          </label>
          {includeTalent && (
            <div className="pl-6 space-y-1">
              <div className="flex justify-between text-xs text-text-muted font-mono">
                <span>Cấp 2</span>
                <span className="text-accent-bright font-bold">Mục tiêu: Cấp {talentTarget}</span>
                <span>Cấp 10 (Vương miện)</span>
              </div>
              <input
                type="range"
                min={2}
                max={10}
                value={talentTarget}
                onChange={(e) => setTalentTarget(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>
          )}
        </div>

        {/* Ước tính EXP & Mora */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-bg-primary/60 border border-border/50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
              <span className="text-lg">📜</span>
            </div>
            <div>
              <div className="text-[11px] text-text-muted font-medium">Kinh Nghiệm Anh Hùng</div>
              <div className="text-sm font-bold font-mono text-purple-300">
                ~{estimates.herosWit.toLocaleString("vi-VN")} cuốn
              </div>
            </div>
          </div>
          <div className="bg-bg-primary/60 border border-border/50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <span className="text-lg">🪙</span>
            </div>
            <div>
              <div className="text-[11px] text-text-muted font-medium">Tổng Mora Ước Tính</div>
              <div className="text-sm font-bold font-mono text-amber-300">
                ~{estimates.totalMora.toLocaleString("vi-VN")} Mora
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleCalculate}
        disabled={!selected || loading}
        className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-bg-primary font-bold text-sm rounded-xl py-3.5 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "⏳ Đang tính toán dữ liệu chính thức..." : "🚀 Tính Tổng Nguyên Liệu Cần Farm"}
      </button>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && <ResultPanel result={result} />}
    </div>
  );
}

const DAY_VI: Record<string, string> = {
  Monday: "Thứ 2",
  Tuesday: "Thứ 3",
  Wednesday: "Thứ 4",
  Thursday: "Thứ 5",
  Friday: "Thứ 6",
  Saturday: "Thứ 7",
  Sunday: "Chủ nhật",
};

function ResultPanel({ result }: { result: CalculatorResult }) {
  // Kho đồ cá nhân lưu trong localStorage
  const [inventory, setInventory] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const stored = window.localStorage.getItem("leibo-user-inventory");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const updateInventory = (name: string, count: number) => {
    setInventory((prev) => {
      const next = { ...prev, [name]: Math.max(0, count) };
      try {
        window.localStorage.setItem("leibo-user-inventory", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Tính tổng Nhựa ước tính
  const allMaterials = [
    ...result.ascension.materials,
    ...(result.talent?.materials ?? []),
  ];

  let totalResinEstimate = 0;
  for (const m of allMaterials) {
    const owned = inventory[m.name] || 0;
    const missing = Math.max(0, m.quantity - owned);
    if (missing > 0) {
      // Boss drop: 40 resin per ~2.5 drops
      if (m.name.includes("Seed") || m.name.includes("Core") || m.name.includes("Regalia") || m.name.includes("Scale") || m.name.includes("Prism")) {
        totalResinEstimate += Math.ceil(missing / 2.5) * 40;
      } else if (m.name.includes("Teachings") || m.name.includes("Guide") || m.name.includes("Philosophies")) {
        // Talent books: ~20 resin per 2.2 purple-equivalent
        totalResinEstimate += Math.ceil(missing / 2.2) * 20;
      }
    }
  }

  const estimatedDays = Math.max(1, Math.ceil(totalResinEstimate / 180));
  const currentDayOfWeek = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Thẻ Kế hoạch Nhựa & Thời gian */}
      {totalResinEstimate > 0 && (
        <div className="bg-gradient-to-r from-bg-card via-bg-card/95 to-bg-elevated border border-accent-500/40 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🧪</span>
              <h3 className="font-display text-base font-bold text-text-primary">
                Kế Hoạch Nông Nghiệp &amp; Ước Tính Nhựa
              </h3>
            </div>
            <p className="text-xs text-text-muted mt-1 max-w-xl">
              Dựa trên số lượng còn thiếu sau khi trừ số lượng bạn đang có sẵn trong túi đồ.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-bg-primary/80 border border-border px-4 py-2.5 rounded-xl shrink-0">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-text-muted">Ước tính Nhựa</div>
              <div className="text-lg font-bold font-mono text-amber-400">~{totalResinEstimate.toLocaleString("vi-VN")} Resin</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-text-muted">Thời gian farm</div>
              <div className="text-lg font-bold font-mono text-emerald-400">~{estimatedDays} ngày</div>
            </div>
          </div>
        </div>
      )}

      <MaterialPlanCard
        title={`🌟 Nguyên Liệu Đột Phá Nhân Vật (Cấp ${result.ascension.currentLevel} → ${result.ascension.targetLevel})`}
        materials={result.ascension.materials}
        inventory={inventory}
        onUpdateInventory={updateInventory}
      />
      {result.talent && (
        <MaterialPlanCard
          title="⚡ Nguyên Liệu Nâng Cấp Kỹ Năng / Thiên Phú"
          materials={result.talent.materials}
          inventory={inventory}
          onUpdateInventory={updateInventory}
        />
      )}
      {result.domains.length > 0 && (
        <div className="bg-bg-card border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="font-display text-base font-bold text-text-primary mb-3 flex items-center gap-2">
            🏛️ Bí Cảnh Rơi Nguyên Liệu Phù Hợp ({result.domains.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.domains.map((d) => {
              const isOpenToday = d.daysOfWeek.length === 0 || d.daysOfWeek.includes(currentDayOfWeek);
              return (
                <div key={d.id} className="bg-bg-primary border border-border/80 rounded-xl p-3.5 text-xs space-y-1.5">
                  <div className="text-text-primary font-bold text-sm flex items-center justify-between">
                    <span>{d.name}</span>
                    <div className="flex items-center gap-1.5">
                      {isOpenToday && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          Đang mở hôm nay!
                        </span>
                      )}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-secondary text-text-muted border border-border">
                        {d.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-amber-400 font-mono text-[11px]">
                    📅 Lịch mở:{" "}
                    {d.daysOfWeek.length > 0
                      ? d.daysOfWeek.map((day) => DAY_VI[day] ?? day).join(", ")
                      : "Mở tất cả các ngày"}
                  </div>
                  <div className="text-text-muted text-[11px] truncate">
                    Rơi: {d.dropsMaterials.join(", ")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MaterialPlanCard({
  title,
  materials,
  inventory,
  onUpdateInventory,
}: {
  title: string;
  materials: PlanMaterial[];
  inventory: Record<string, number>;
  onUpdateInventory: (name: string, count: number) => void;
}) {
  return (
    <div className="bg-bg-card border border-amber-500/30 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <h3 className="font-display text-base font-bold text-text-primary">{title}</h3>
        <span className="text-[11px] text-text-muted italic">
          💡 Bạn có thể nhập số lượng có sẵn trong túi vào ô &quot;Có&quot; để tính số lượng còn thiếu
        </span>
      </div>
      {materials.length === 0 ? (
        <p className="text-xs text-text-muted">Không cần thêm nguyên liệu nào trong khoảng này.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {materials.map((m) => {
            const iconPath = `/local-genshin-assets/materials/${slugify(m.name)}.png`;
            const owned = inventory[m.name] || 0;
            const missing = Math.max(0, m.quantity - owned);
            const isCompleted = owned >= m.quantity;

            return (
              <div
                key={m.name}
                className={`bg-bg-primary border rounded-xl p-3 transition-colors ${
                  isCompleted ? "border-emerald-500/50 bg-emerald-500/5" : "border-border hover:border-amber-500/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative w-10 h-10 rounded-lg bg-bg-secondary border border-border/60 shrink-0 overflow-hidden flex items-center justify-center p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={iconPath}
                      alt={m.name}
                      className="w-full h-full object-contain filter drop-shadow-sm"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-text-primary truncate" title={m.name}>
                      {m.name}
                    </div>
                    <div className="flex items-baseline justify-between mt-1 text-xs">
                      <span className="font-mono text-text-muted">Cần: <strong className="text-text-primary">{m.quantity}</strong></span>
                      {isCompleted ? (
                        <span className="font-semibold text-emerald-400 text-[11px] flex items-center gap-1">
                          <span>✓ Đủ</span>
                        </span>
                      ) : (
                        <span className="font-mono text-rose-400 text-[11px]">Thiếu: {missing}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Input nhập số lượng có sẵn trong kho */}
                <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
                  <span className="text-text-muted">Có sẵn:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={9999}
                      value={owned || ""}
                      placeholder="0"
                      onChange={(e) => onUpdateInventory(m.name, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-0.5 rounded bg-bg-secondary border border-border text-center font-mono text-xs text-text-primary focus:outline-none focus:border-accent-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
