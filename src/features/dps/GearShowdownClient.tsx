"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { ShowdownResult } from "@/core/game/dps/types";

export interface CharacterOption {
  id: string;
  name: string;
  vision: string;
  weaponType: string;
  rarity: number;
  iconUrl: string | null;
}

export interface WeaponOption {
  id: string;
  name: string;
  type: string;
  rarity: number;
  iconUrl: string | null;
}

interface GearShowdownClientProps {
  characters: CharacterOption[];
  weapons: WeaponOption[];
}

const REACTIONS = ["Vaporize", "Melt", "Overload", "Superconduct", "Electro-Charged", "Aggravate", "Spread"];

export function GearShowdownClient({ characters, weapons }: GearShowdownClientProps) {
  const [charQuery, setCharQuery] = useState("");
  const [selectedChar, setSelectedChar] = useState<CharacterOption | null>(null);

  // Chế độ: So sánh 2 Vũ khí hoặc So sánh 2 Bảng chỉ số
  const [compareMode, setCompareMode] = useState<"weapons" | "totalStats">("weapons");

  // Vũ khí A vs B
  const [weaponA, setWeaponA] = useState<WeaponOption | null>(null);
  const [refinementA, setRefinementA] = useState(1);
  const [weaponB, setWeaponB] = useState<WeaponOption | null>(null);
  const [refinementB, setRefinementB] = useState(1);

  // Chỉ số A vs B
  const [labelA, setLabelA] = useState("Phương án A (Vd: Nón Crit Rate)");
  const [statsA, setStatsA] = useState({
    totalATK: 2100,
    critRate: 75.0,
    critDmg: 140.0,
    em: 100,
    er: 120,
    damageBonus: 46.6,
  });

  const [labelB, setLabelB] = useState("Phương án B (Vd: Nón Crit DMG)");
  const [statsB, setStatsB] = useState({
    totalATK: 2100,
    critRate: 50.0,
    critDmg: 190.0,
    em: 100,
    er: 120,
    damageBonus: 46.6,
  });

  // Môi trường
  const [reaction, setReaction] = useState("Vaporize");
  const [reactionDirection, setReactionDirection] = useState<"forward" | "reverse">("forward");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showdown, setShowdown] = useState<ShowdownResult | null>(null);

  const filteredCharacters = useMemo(() => {
    if (!charQuery.trim()) return characters.slice(0, 8);
    const q = charQuery.toLowerCase();
    return characters.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 8);
  }, [characters, charQuery]);

  const compatibleWeapons = useMemo(() => {
    if (!selectedChar) return weapons.slice(0, 10);
    return weapons.filter((w) => w.type === selectedChar.weaponType).slice(0, 12);
  }, [weapons, selectedChar]);

  async function handleRunShowdown() {
    if (!selectedChar) return;
    if (compareMode === "weapons" && (!weaponA || !weaponB)) return;

    setLoading(true);
    setError(null);
    setShowdown(null);

    try {
      const payload: Record<string, unknown> = {
        characterId: selectedChar.id,
        characterLevel: 90,
        talentLevels: { normalAttack: 10, elementalSkill: 10, elementalBurst: 10 },
        mode: compareMode,
        modifiers: {
          enemyRes: 10,
          defenseReduction: 0,
          damageBonus: 0,
          vulnerability: 0,
          reaction,
          reactionDirection,
        },
      };

      if (compareMode === "weapons") {
        payload.weaponA = { weaponId: weaponA!.id, weaponLevel: 90, weaponRefinement: refinementA };
        payload.weaponB = { weaponId: weaponB!.id, weaponLevel: 90, weaponRefinement: refinementB };
      } else {
        payload.labelA = labelA;
        payload.labelB = labelB;
        payload.totalStatsA = statsA;
        payload.totalStatsB = statsB;
      }

      const res = await fetch("/api/tools/dps/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || "So sánh thất bại");
      }

      setShowdown(json.data.showdown as ShowdownResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  const nameA = compareMode === "weapons" ? (weaponA ? `${weaponA.name} (R${refinementA})` : "Vũ khí A") : labelA;
  const nameB = compareMode === "weapons" ? (weaponB ? `${weaponB.name} (R${refinementB})` : "Vũ khí B") : labelB;

  return (
    <div className="space-y-6">
      {/* 1. Chọn Nhân vật mục tiêu */}
      <div className="bg-bg-card border-2 border-border rounded-xl p-5">
        <label className="block text-sm font-semibold text-text-primary mb-2">
          1. Chọn nhân vật để thử nghiệm đối đầu
        </label>
        {selectedChar ? (
          <div className="flex items-center justify-between bg-bg-primary border border-border rounded-lg p-3">
            <div className="flex items-center gap-3">
              {selectedChar.iconUrl && (
                <Image src={selectedChar.iconUrl} alt={selectedChar.name} width={40} height={40} className="rounded-full" />
              )}
              <div>
                <span className="font-bold text-text-primary text-base">{selectedChar.name}</span>
                <span className="text-xs text-text-muted ml-2">★{selectedChar.rarity} · {selectedChar.vision} · {selectedChar.weaponType}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedChar(null);
                setWeaponA(null);
                setWeaponB(null);
              }}
              className="text-xs text-text-muted hover:text-text-primary px-2 py-1 rounded border border-border"
            >
              Đổi nhân vật
            </button>
          </div>
        ) : (
          <div>
            <input
              type="search"
              placeholder="Tìm theo tên nhân vật (vd: Hu Tao, Raiden, Ayaka)..."
              value={charQuery}
              onChange={(e) => setCharQuery(e.target.value)}
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-text-primary text-sm mb-3"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {filteredCharacters.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedChar(c)}
                  className="flex items-center gap-2 bg-bg-primary border border-border rounded-lg p-2 hover:border-gold/60 text-left transition-colors"
                >
                  {c.iconUrl && <Image src={c.iconUrl} alt={c.name} width={28} height={28} className="rounded-full shrink-0" />}
                  <span className="text-xs text-text-primary truncate font-medium">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Chọn hình thức đối đầu: So sánh 2 Vũ Khí hay 2 Hướng Build */}
      <div className="flex flex-col sm:flex-row rounded-xl bg-bg-card border-2 border-border p-1.5 gap-2">
        <button
          type="button"
          onClick={() => setCompareMode("weapons")}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            compareMode === "weapons" ? "bg-gold text-bg-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <span>⚔️</span>
          <span>So sánh 2 Vũ khí (Vd: Hộ Ma vs Tai Ương)</span>
        </button>
        <button
          type="button"
          onClick={() => setCompareMode("totalStats")}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            compareMode === "totalStats" ? "bg-gold text-bg-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <span>⚖️</span>
          <span>So sánh 2 Hướng Chỉ số (Vd: Nón CR vs Nón CD)</span>
        </button>
      </div>

      {/* 3. Khung cấu hình 2 Cột Đối Đầu Song Song (Side-by-Side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CỘT A */}
        <div className="bg-bg-card border-2 border-border/80 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
          <h3 className="font-bold text-sm text-cyan-400 mb-3 flex items-center justify-between">
            <span>PHƯƠNG ÁN A</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300">Slot A</span>
          </h3>

          {compareMode === "weapons" ? (
            <div>
              <label className="block text-xs text-text-muted mb-1.5">Chọn Vũ khí A:</label>
              {weaponA ? (
                <div className="flex items-center justify-between bg-bg-primary border border-border rounded-lg p-2.5 mb-3">
                  <div className="flex items-center gap-2.5">
                    {weaponA.iconUrl && <Image src={weaponA.iconUrl} alt={weaponA.name} width={32} height={32} className="rounded-full" />}
                    <span className="font-semibold text-text-primary text-xs sm:text-sm">{weaponA.name}</span>
                  </div>
                  <button onClick={() => setWeaponA(null)} className="text-xs text-text-muted hover:text-text-primary">Đổi</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {compatibleWeapons.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setWeaponA(w)}
                      className="flex items-center gap-1.5 bg-bg-primary border border-border rounded-lg p-1.5 hover:border-cyan-400 text-left text-xs"
                    >
                      {w.iconUrl && <Image src={w.iconUrl} alt={w.name} width={20} height={20} className="rounded-full shrink-0" />}
                      <span className="truncate">{w.name}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3">
                <label className="text-xs text-text-muted">Tinh luyện R:</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRefinementA(r)}
                      className={`w-7 h-7 rounded text-xs font-semibold ${
                        refinementA === r ? "bg-cyan-500 text-bg-primary" : "bg-bg-input border border-border text-text-secondary"
                      }`}
                    >
                      R{r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={labelA}
                onChange={(e) => setLabelA(e.target.value)}
                placeholder="Tên phương án A"
                className="w-full bg-bg-primary border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary font-semibold"
              />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] text-text-muted">Tổng ATK</label>
                  <input
                    type="number"
                    value={statsA.totalATK}
                    onChange={(e) => setStatsA({ ...statsA, totalATK: Number(e.target.value) || 0 })}
                    className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-text-muted">Tỉ lệ CRIT (%)</label>
                  <input
                    type="number"
                    value={statsA.critRate}
                    step={0.1}
                    onChange={(e) => setStatsA({ ...statsA, critRate: Number(e.target.value) || 0 })}
                    className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-text-muted">CRIT DMG (%)</label>
                  <input
                    type="number"
                    value={statsA.critDmg}
                    step={0.1}
                    onChange={(e) => setStatsA({ ...statsA, critDmg: Number(e.target.value) || 0 })}
                    className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-text-muted">Tinh thông (EM)</label>
                  <input
                    type="number"
                    value={statsA.em}
                    onChange={(e) => setStatsA({ ...statsA, em: Number(e.target.value) || 0 })}
                    className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-text-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CỘT B */}
        <div className="bg-bg-card border-2 border-border/80 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-rose-400" />
          <h3 className="font-bold text-sm text-rose-400 mb-3 flex items-center justify-between">
            <span>PHƯƠNG ÁN B</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300">Slot B</span>
          </h3>

          {compareMode === "weapons" ? (
            <div>
              <label className="block text-xs text-text-muted mb-1.5">Chọn Vũ khí B:</label>
              {weaponB ? (
                <div className="flex items-center justify-between bg-bg-primary border border-border rounded-lg p-2.5 mb-3">
                  <div className="flex items-center gap-2.5">
                    {weaponB.iconUrl && <Image src={weaponB.iconUrl} alt={weaponB.name} width={32} height={32} className="rounded-full" />}
                    <span className="font-semibold text-text-primary text-xs sm:text-sm">{weaponB.name}</span>
                  </div>
                  <button onClick={() => setWeaponB(null)} className="text-xs text-text-muted hover:text-text-primary">Đổi</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {compatibleWeapons.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setWeaponB(w)}
                      className="flex items-center gap-1.5 bg-bg-primary border border-border rounded-lg p-1.5 hover:border-rose-400 text-left text-xs"
                    >
                      {w.iconUrl && <Image src={w.iconUrl} alt={w.name} width={20} height={20} className="rounded-full shrink-0" />}
                      <span className="truncate">{w.name}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3">
                <label className="text-xs text-text-muted">Tinh luyện R:</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRefinementB(r)}
                      className={`w-7 h-7 rounded text-xs font-semibold ${
                        refinementB === r ? "bg-rose-500 text-bg-primary" : "bg-bg-input border border-border text-text-secondary"
                      }`}
                    >
                      R{r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={labelB}
                onChange={(e) => setLabelB(e.target.value)}
                placeholder="Tên phương án B"
                className="w-full bg-bg-primary border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary font-semibold"
              />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] text-text-muted">Tổng ATK</label>
                  <input
                    type="number"
                    value={statsB.totalATK}
                    onChange={(e) => setStatsB({ ...statsB, totalATK: Number(e.target.value) || 0 })}
                    className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-text-muted">Tỉ lệ CRIT (%)</label>
                  <input
                    type="number"
                    value={statsB.critRate}
                    step={0.1}
                    onChange={(e) => setStatsB({ ...statsB, critRate: Number(e.target.value) || 0 })}
                    className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-text-muted">CRIT DMG (%)</label>
                  <input
                    type="number"
                    value={statsB.critDmg}
                    step={0.1}
                    onChange={(e) => setStatsB({ ...statsB, critDmg: Number(e.target.value) || 0 })}
                    className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-text-muted">Tinh thông (EM)</label>
                  <input
                    type="number"
                    value={statsB.em}
                    onChange={(e) => setStatsB({ ...statsB, em: Number(e.target.value) || 0 })}
                    className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-text-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Tùy chọn Phản ứng & Nút Bắt đầu */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-bg-card border-2 border-border rounded-xl p-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs text-text-muted shrink-0">Phản ứng nguyên tố:</label>
          <select
            value={reaction}
            onChange={(e) => setReaction(e.target.value)}
            className="bg-bg-primary border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary"
          >
            {REACTIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select
            value={reactionDirection}
            onChange={(e) => setReactionDirection(e.target.value as "forward" | "reverse")}
            className="bg-bg-primary border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary"
          >
            <option value="forward">Thuận (2.0x)</option>
            <option value="reverse">Nghịch (1.5x)</option>
          </select>
        </div>

        <button
          onClick={handleRunShowdown}
          disabled={!selectedChar || (compareMode === "weapons" && (!weaponA || !weaponB)) || loading}
          className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-gold text-bg-primary font-bold text-sm rounded-lg hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-gold/10"
        >
          {loading ? "Đang đối đầu..." : "⚔️ Bắt đầu Đối đầu"}
        </button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>}

      {/* 5. KẾT QUẢ ĐỐI ĐẦU CHI TIẾT (Showdown Arena Result) */}
      {showdown && (
        <div className="bg-bg-card border-2 border-gold/50 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Banner Kẻ Chiến Thắng */}
          <div className="text-center p-5 rounded-xl bg-gradient-to-b from-gold/15 to-bg-primary border border-gold/40">
            <div className="text-xs font-bold tracking-widest uppercase text-gold mb-1">KẾT QUẢ ĐỐI ĐẦU CHÍNH THỨC</div>
            <div className="text-2xl sm:text-3xl font-display font-extrabold text-gold-bright flex items-center justify-center gap-2">
              <span>{showdown.winner === "TIE" ? "🤝 KẾT QUẢ HÒA" : `🏆 ${showdown.winner === "A" ? nameA : nameB} CHIẾN THẮNG`}</span>
            </div>
            {showdown.winner !== "TIE" && (
              <p className="text-sm font-semibold text-emerald-400 mt-1">
                Vượt trội hơn +{showdown.improvementPercent}% sát thương kỳ vọng (+{Math.abs(showdown.dpsDiff).toLocaleString("vi-VN")} DPS)
              </p>
            )}
            <p className="text-xs text-text-secondary mt-3 max-w-2xl mx-auto leading-relaxed">
              {showdown.verdict}
            </p>
          </div>

          {/* So Sánh Song Song Từng Hạng Mục */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">So sánh chi tiết từng đòn đánh:</h4>

            {[
              { label: "Sát thương kỳ vọng (DPS)", valA: showdown.buildA.expectedDPS, valB: showdown.buildB.expectedDPS, unit: "DPS" },
              { label: "Kỹ năng Nộ (Burst)", valA: showdown.buildA.damageBreakdown.burst, valB: showdown.buildB.damageBreakdown.burst, unit: "DMG" },
              { label: "Kỹ năng Nguyên tố (Skill)", valA: showdown.buildA.damageBreakdown.skill, valB: showdown.buildB.damageBreakdown.skill, unit: "DMG" },
              { label: "Đòn đánh thường", valA: showdown.buildA.damageBreakdown.normalAttack, valB: showdown.buildB.damageBreakdown.normalAttack, unit: "DMG" },
              { label: "Sát thương phản ứng", valA: showdown.buildA.damageBreakdown.reactions, valB: showdown.buildB.damageBreakdown.reactions, unit: "DMG" },
            ].map((row, idx) => {
              const maxVal = Math.max(row.valA, row.valB, 1);
              const pctA = Math.round((row.valA / maxVal) * 100);
              const pctB = Math.round((row.valB / maxVal) * 100);
              const diff = row.valA - row.valB;

              return (
                <div key={idx} className="bg-bg-primary border border-border/70 rounded-xl p-3.5 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-text-primary">{row.label}</span>
                    <span className="font-mono text-[11px] text-text-muted">
                      {diff > 0 ? (
                        <span className="text-cyan-400">A cao hơn +{diff.toLocaleString("vi-VN")}</span>
                      ) : diff < 0 ? (
                        <span className="text-rose-400">B cao hơn +{Math.abs(diff).toLocaleString("vi-VN")}</span>
                      ) : (
                        <span>Ngang nhau</span>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-center">
                    {/* Cột A */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-cyan-400 font-medium truncate max-w-[120px]">{nameA}</span>
                        <span className="font-bold font-mono text-text-primary">{row.valA.toLocaleString("vi-VN")} {row.unit}</span>
                      </div>
                      <div className="w-full h-2 bg-bg-card rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 transition-all rounded-full" style={{ width: `${pctA}%` }} />
                      </div>
                    </div>

                    {/* Cột B */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-rose-400 font-medium truncate max-w-[120px]">{nameB}</span>
                        <span className="font-bold font-mono text-text-primary">{row.valB.toLocaleString("vi-VN")} {row.unit}</span>
                      </div>
                      <div className="w-full h-2 bg-bg-card rounded-full overflow-hidden">
                        <div className="h-full bg-rose-400 transition-all rounded-full" style={{ width: `${pctB}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Nhận định chuyên sâu */}
          {showdown.insights.length > 0 && (
            <div className="p-4 rounded-xl bg-bg-primary/80 border border-border">
              <h4 className="text-xs font-bold text-gold uppercase tracking-wider mb-2">💡 Ghi chú phân tích chuyên sâu:</h4>
              <ul className="list-disc list-inside text-xs text-text-secondary space-y-1.5">
                {showdown.insights.map((ins, i) => (
                  <li key={i}>{ins}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
