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

interface MaterialRequirement {
  materialId: string;
  materialName: string;
  quantity: number;
  tier: number;
  domain?: string;
  dropRate?: number;
}

interface AscensionPlan {
  characterName: string;
  currentLevel: number;
  targetLevel: number;
  materials: MaterialRequirement[];
  totalResinNeeded: number;
  farmingDays: number;
  recommendedDomains: string[];
}

interface TalentPlan {
  characterName: string;
  materials: MaterialRequirement[];
  totalResinNeeded: number;
  recommendedDomains: string[];
}

interface CalculatorResult {
  ascension: AscensionPlan;
  talent?: TalentPlan;
}

export function MaterialCalculatorClient({ characters }: { characters: CharacterOption[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CharacterOption | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [targetLevel, setTargetLevel] = useState(90);
  const [includeTalent, setIncludeTalent] = useState(false);
  const [talentTarget, setTalentTarget] = useState(10);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return characters.slice(0, 8);
    const q = query.toLowerCase();
    return characters.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 8);
  }, [characters, query]);

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
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Chọn nhân vật */}
      <div className="bg-bg-card border-2 border-border rounded-xl p-5">
        <label className="block text-sm font-medium text-text-secondary mb-2">Nhân vật</label>
        {selected ? (
          <div className="flex items-center justify-between bg-bg-primary border border-border rounded-lg p-3">
            <div className="flex items-center gap-3">
              {selected.iconUrl && (
                <Image src={selected.iconUrl} alt={selected.name} width={40} height={40} className="rounded-full" />
              )}
              <div>
                <div className="font-semibold text-text-primary">{selected.name}</div>
                <RarityStars count={selected.rarity} size="sm" />
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              Đổi
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Gõ tên nhân vật..."
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50"
            />
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="flex items-center gap-2 bg-bg-primary border border-border rounded-lg p-2 hover:border-gold/50 transition-colors text-left"
                >
                  {c.iconUrl && (
                    <Image src={c.iconUrl} alt={c.name} width={28} height={28} className="rounded-full shrink-0" />
                  )}
                  <span className="text-sm text-text-primary truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Khoảng cấp độ */}
      <div className="bg-bg-card border-2 border-border rounded-xl p-5">
        <label className="block text-sm font-medium text-text-secondary mb-3">Khoảng cấp độ đột phá</label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <span className="text-xs text-text-muted">Hiện tại</span>
            <input
              type="number"
              min={1}
              max={90}
              value={currentLevel}
              onChange={(e) => setCurrentLevel(Math.min(90, Math.max(1, Number(e.target.value) || 1)))}
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-text-primary mt-1"
            />
          </div>
          <span className="text-text-muted mt-4">→</span>
          <div className="flex-1">
            <span className="text-xs text-text-muted">Mục tiêu</span>
            <input
              type="number"
              min={1}
              max={90}
              value={targetLevel}
              onChange={(e) => setTargetLevel(Math.min(90, Math.max(1, Number(e.target.value) || 90)))}
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-text-primary mt-1"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 mt-4 cursor-pointer">
          <input
            type="checkbox"
            checked={includeTalent}
            onChange={(e) => setIncludeTalent(e.target.checked)}
            className="accent-gold"
          />
          <span className="text-sm text-text-secondary">Tính cả nguyên liệu lên cấp thiên phú (mục tiêu cấp {talentTarget})</span>
        </label>
        {includeTalent && (
          <input
            type="range"
            min={2}
            max={10}
            value={talentTarget}
            onChange={(e) => setTalentTarget(Number(e.target.value))}
            className="w-full mt-2 accent-gold"
          />
        )}
      </div>

      <button
        onClick={handleCalculate}
        disabled={!selected || loading}
        className="w-full bg-gold text-bg-primary font-semibold rounded-lg py-3 hover:bg-gold-bright transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Đang tính..." : "Tính nguyên liệu"}
      </button>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>
      )}

      {result && <ResultPanel result={result} />}
    </div>
  );
}

function ResultPanel({ result }: { result: CalculatorResult }) {
  return (
    <div className="space-y-6">
      <MaterialPlanCard
        title={`Đột phá: cấp ${result.ascension.currentLevel} → ${result.ascension.targetLevel}`}
        plan={result.ascension}
      />
      {result.talent && <MaterialPlanCard title="Nguyên liệu thiên phú" plan={result.talent} />}
    </div>
  );
}

function MaterialPlanCard({
  title,
  plan,
}: {
  title: string;
  plan: { materials: MaterialRequirement[]; totalResinNeeded: number; recommendedDomains: string[]; farmingDays?: number };
}) {
  return (
    <div className="bg-bg-card border-2 border-gold/30 rounded-xl p-5">
      <h3 className="font-display text-lg font-bold text-text-primary mb-3">{title}</h3>

      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <div>
          <span className="text-text-muted">Resin ước tính: </span>
          <span className="text-gold-bright font-semibold">{plan.totalResinNeeded.toLocaleString("vi-VN")}</span>
        </div>
        {plan.farmingDays != null && (
          <div>
            <span className="text-text-muted">Số ngày farm ước tính: </span>
            <span className="text-gold-bright font-semibold">{plan.farmingDays}</span>
          </div>
        )}
        {plan.recommendedDomains.length > 0 && (
          <div>
            <span className="text-text-muted">Bí cảnh gợi ý: </span>
            <span className="text-text-primary">{plan.recommendedDomains.join(", ")}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {plan.materials.map((m) => (
          <div key={`${m.materialId}-${m.tier}`} className="bg-bg-primary border border-border rounded-lg p-3">
            <div className="text-sm text-text-primary font-medium truncate">{m.materialName}</div>
            <div className="text-xs text-text-muted mt-1">×{m.quantity.toLocaleString("vi-VN")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
