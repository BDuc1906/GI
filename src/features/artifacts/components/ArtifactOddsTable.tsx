"use client";

import { useState } from "react";
import {
  ARTIFACT_MAIN_STAT_ODDS,
  ARTIFACT_SUBSTAT_ROLL_TIERS,
  calculateCritValue,
} from "@/core/game/artifact-odds";

export function ArtifactOddsTable() {
  const [activeTab, setActiveTab] = useState<"main" | "sub" | "calculator">("main");
  const [selectedSlot, setSelectedSlot] = useState<"sands" | "goblet" | "circlet" | "flower" | "plume">("sands");
  const [selectedStar, setSelectedStar] = useState<5 | 4>(5);

  // Mini CV Calculator states
  const [calcCr, setCalcCr] = useState<string>("3.9");
  const [calcCd, setCalcCd] = useState<string>("21.0");

  const crNum = parseFloat(calcCr) || 0;
  const cdNum = parseFloat(calcCd) || 0;
  const cvResult = calculateCritValue(crNum, cdNum);

  const slotData = ARTIFACT_MAIN_STAT_ODDS[selectedSlot];

  return (
    <div className="surface-card p-5 sm:p-6 rounded-2xl border border-border bg-bg-card/95 backdrop-blur-sm space-y-6 shadow-sm">
      {/* Header & Tab Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h2 className="text-base sm:text-lg font-bold text-text-primary">
              Cơ Sở Dữ Liệu Xác Suất & Biên Độ Roll Thánh Di Vật (KQM)
            </h2>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Số liệu thống kê thực chứng từ KeqingMains & game client: Tỷ lệ dòng chính, 4 bậc roll dòng phụ và công cụ tính CV.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-bg-elevated/70 p-1 rounded-xl border border-border self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("main")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "main"
                ? "bg-bg-card text-accent-bright shadow-sm border border-accent-500/40"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Tỷ Lệ Dòng Chính
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sub")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "sub"
                ? "bg-bg-card text-accent-bright shadow-sm border border-accent-500/40"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Bậc Roll Dòng Phụ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("calculator")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "calculator"
                ? "bg-bg-card text-accent-bright shadow-sm border border-accent-500/40"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Tính Điểm CV
          </button>
        </div>
      </div>

      {/* TAB 1: TỶ LỆ DÒNG CHÍNH */}
      {activeTab === "main" && (
        <div className="space-y-4">
          {/* Slot selector chips */}
          <div className="flex flex-wrap gap-2">
            {(["sands", "goblet", "circlet", "flower", "plume"] as const).map((slotKey) => {
              const item = ARTIFACT_MAIN_STAT_ODDS[slotKey];
              const isSelected = selectedSlot === slotKey;
              return (
                <button
                  key={slotKey}
                  type="button"
                  onClick={() => setSelectedSlot(slotKey)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? "bg-accent-500/10 border-accent-500 text-accent-bright shadow-sm"
                      : "bg-bg-elevated/50 border-border text-text-secondary hover:text-text-primary hover:border-accent-500/40"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.slotNameVi}</span>
                </button>
              );
            })}
          </div>

          {/* Stats Bar List */}
          <div className="bg-bg-elevated/40 rounded-xl p-4 border border-border/70 space-y-3">
            <div className="flex items-center justify-between text-xs text-text-muted pb-1 border-b border-border/50">
              <span className="font-semibold text-text-primary">{slotData.slotNameVi} ({slotData.slotName})</span>
              <span>Xác Suất Xuất Hiện</span>
            </div>

            <div className="space-y-2.5">
              {slotData.stats.map((s) => {
                const isRare = s.percentage <= 5.0;
                const isVeryRare = s.percentage <= 2.5;

                return (
                  <div key={s.stat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-text-primary flex items-center gap-1.5">
                        {s.statVi}
                        {isVeryRare && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-500/20 text-rose-400 font-bold">
                            Cực Hiếm (2.5%)
                          </span>
                        )}
                        {!isVeryRare && isRare && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-400 font-bold">
                            Hiếm (5.0%)
                          </span>
                        )}
                      </span>
                      <span className="font-mono font-semibold text-text-primary tabular-nums">
                        {s.percentage.toFixed(2)}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-bg-card rounded-full overflow-hidden border border-border/40">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isVeryRare
                            ? "bg-gradient-to-r from-rose-500 to-pink-500"
                            : isRare
                            ? "bg-gradient-to-r from-amber-500 to-orange-400"
                            : "bg-gradient-to-r from-accent-600 to-accent-400"
                        }`}
                        style={{ width: `${Math.max(s.percentage, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Theorycraft Note */}
          <div className="text-[11px] text-text-muted bg-bg-secondary/60 rounded-xl p-3 border border-border/40 flex items-start gap-2">
            <span className="text-accent-bright font-bold">💡 Mẹo KQM:</span>
            <span>
              Ly Sát Thương Nguyên Tố (5%) và Tinh Thông (2.5%) có tỷ lệ rớt cực kỳ thấp. Vì vậy, các Ly Nguyên Tố
              hoàn hảo thường được dùng làm mảnh “Lẻ” (Off-piece) trong set 4 món.
            </span>
          </div>
        </div>
      )}

      {/* TAB 2: BẬC ROLL DÒNG PHỤ */}
      {activeTab === "sub" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-secondary">
              Mỗi dòng phụ khi sinh ra hoặc được đập (+4, +8, +12, +16, +20) nhận ngẫu nhiên 1 trong 4 bậc (xác suất 25% mỗi bậc).
            </p>
            {/* Rarity selector */}
            <div className="flex items-center gap-1 bg-bg-elevated rounded-lg p-0.5 border border-border shrink-0">
              <button
                type="button"
                onClick={() => setSelectedStar(5)}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  selectedStar === 5
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                5★ Vàng
              </button>
              <button
                type="button"
                onClick={() => setSelectedStar(4)}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  selectedStar === 4
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                4★ Tím
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-bg-elevated border-b border-border text-text-muted">
                  <th className="py-2.5 px-3 font-semibold">Chỉ Số Dòng Phụ</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Bậc 1 (70%)</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Bậc 2 (80%)</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Bậc 3 (90%)</th>
                  <th className="py-2.5 px-3 font-semibold text-center text-accent-bright">Bậc 4 (100% Max)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {ARTIFACT_SUBSTAT_ROLL_TIERS.map((tier) => {
                  const values = selectedStar === 5 ? tier.tier5Star : tier.tier4Star;
                  const isCrit = tier.stat.includes("CRIT");

                  return (
                    <tr
                      key={tier.stat}
                      className={`hover:bg-bg-elevated/40 transition-colors ${
                        isCrit ? "bg-accent-500/5 font-medium" : ""
                      }`}
                    >
                      <td className="py-2 px-3 text-text-primary font-medium flex items-center gap-1.5">
                        {isCrit && <span className="text-amber-400">★</span>}
                        {tier.statVi}
                        <span className="text-text-muted text-[10px]">({tier.stat})</span>
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-text-secondary tabular-nums">
                        {values[0].toFixed(tier.isPercent ? 2 : 2)}{tier.unit}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-text-secondary tabular-nums">
                        {values[1].toFixed(tier.isPercent ? 2 : 2)}{tier.unit}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-text-secondary tabular-nums">
                        {values[2].toFixed(tier.isPercent ? 2 : 2)}{tier.unit}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-accent-bright tabular-nums bg-accent-500/10">
                        {values[3].toFixed(tier.isPercent ? 2 : 2)}{tier.unit}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TÍNH ĐIỂM CV */}
      {activeTab === "calculator" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3 bg-bg-elevated/40 p-4 rounded-xl border border-border">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Nhập Chỉ Số Thánh Di Vật
              </h3>
              <div className="space-y-2">
                <label className="block text-xs text-text-muted">
                  Tỷ lệ Bạo Kích (CR) %:
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="30"
                    value={calcCr}
                    onChange={(e) => setCalcCr(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg bg-bg-input border border-border text-text-primary font-mono text-xs focus:border-accent-500 focus:outline-none"
                  />
                </label>
                <label className="block text-xs text-text-muted">
                  Sát Thương Bạo Kích (CD) %:
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={calcCd}
                    onChange={(e) => setCalcCd(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg bg-bg-input border border-border text-text-primary font-mono text-xs focus:border-accent-500 focus:outline-none"
                  />
                </label>
              </div>
            </div>

            {/* Result display */}
            <div className="bg-bg-elevated/40 p-4 rounded-xl border border-border flex flex-col justify-center items-center text-center space-y-2">
              <span className="text-xs text-text-muted">Chỉ Số Crit Value (CV):</span>
              <div
                className="text-3xl font-extrabold font-mono tabular-nums"
                style={{ color: cvResult.color }}
              >
                {cvResult.cv.toFixed(1)}
              </div>
              <span
                className="text-xs px-2.5 py-0.5 rounded-full font-semibold border"
                style={{
                  color: cvResult.color,
                  backgroundColor: `${cvResult.color}15`,
                  borderColor: `${cvResult.color}40`,
                }}
              >
                {cvResult.tier}
              </span>
              <span className="text-[10px] text-text-muted">
                Công thức: CV = (2 × CR) + CD
              </span>
            </div>
          </div>

          {/* Reference Scale */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] text-center pt-2">
            <div className="p-2 rounded-lg bg-bg-secondary/50 border border-border/50">
              <div className="font-semibold text-slate-400">&lt; 20 CV</div>
              <div className="text-[10px] text-text-muted">Tạm Ổn</div>
            </div>
            <div className="p-2 rounded-lg bg-bg-secondary/50 border border-border/50">
              <div className="font-semibold text-blue-400">20 - 30 CV</div>
              <div className="text-[10px] text-text-muted">Khá</div>
            </div>
            <div className="p-2 rounded-lg bg-bg-secondary/50 border border-border/50">
              <div className="font-semibold text-purple-400">30 - 40 CV</div>
              <div className="text-[10px] text-text-muted">Rất Tốt</div>
            </div>
            <div className="p-2 rounded-lg bg-bg-secondary/50 border border-border/50">
              <div className="font-semibold text-pink-400">40 - 50 CV</div>
              <div className="text-[10px] text-text-muted">God Tier</div>
            </div>
            <div className="p-2 rounded-lg bg-bg-secondary/50 border border-border/50">
              <div className="font-semibold text-amber-400">&gt; 50 CV</div>
              <div className="text-[10px] text-text-muted">Kỳ Lân (Top 0.01%)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
