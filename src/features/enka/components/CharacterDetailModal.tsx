"use client";

import { useState, useMemo } from "react";
import type { EnkaShowcaseCharacter } from "../types";
import { evaluateCharacterBuild } from "../services/build-evaluator";
import { WeaponIcon } from "@/features/weapons/components/WeaponIcon";

interface CharacterDetailModalProps {
  char: EnkaShowcaseCharacter | null;
  onClose: () => void;
  onUseForDpsCalculator: (char: EnkaShowcaseCharacter) => void;
}

type ModalTab = "overview" | "stats" | "artifacts" | "weapon" | "evaluator";

export function CharacterDetailModal({
  char,
  onClose,
  onUseForDpsCalculator,
}: CharacterDetailModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>("overview");
  const [selectedProfileId, setSelectedProfileId] = useState<string | undefined>(undefined);

  const evaluation = useMemo(() => {
    if (!char) return null;
    return evaluateCharacterBuild(char, selectedProfileId);
  }, [char, selectedProfileId]);

  if (!char) return null;

  const fp = char.fightProps;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-bg-card border border-border rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-border bg-bg-elevated/40">
          <div className="flex items-center gap-3.5 min-w-0">
            {char.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={char.iconUrl}
                alt={char.characterName ?? `Avatar ${char.avatarId}`}
                className="w-14 h-14 rounded-2xl object-cover bg-bg-elevated border-2 border-accent-500/40 shrink-0 shadow-md"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center text-text-muted text-base shrink-0 font-bold">
                ?
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display text-xl font-bold text-text-primary truncate">
                  {char.characterName ?? `Avatar ${char.avatarId}`}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-500/15 text-accent-bright border border-accent-500/30">
                  C{char.constellations}
                </span>
                <span className="text-xs font-mono font-medium text-text-secondary bg-bg-elevated px-2 py-0.5 rounded-md border border-border">
                  Lv. {char.level}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-1 truncate">
                {char.weapon ? `${char.weapon.name} (R${char.weapon.refinement})` : "Chưa trang bị vũ khí"} ·{" "}
                {char.activeSetSummary.length > 0 ? char.activeSetSummary.join(" + ") : "Chưa đủ bộ TDV"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-border bg-bg-elevated hover:bg-bg-card text-text-muted hover:text-text-primary flex items-center justify-center text-sm font-bold transition-colors shrink-0"
            aria-label="Đóng chi tiết"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-5 md:px-6 py-2.5 border-b border-border bg-bg-elevated/20 overflow-x-auto text-xs font-semibold select-none">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-1.5 rounded-xl transition-all shrink-0 ${
              activeTab === "overview"
                ? "bg-accent-500 text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
            }`}
          >
            Tổng quan (Overview)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("stats")}
            className={`px-3.5 py-1.5 rounded-xl transition-all shrink-0 ${
              activeTab === "stats"
                ? "bg-accent-500 text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
            }`}
          >
            Chỉ số chiến đấu (Stats)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("artifacts")}
            className={`px-3.5 py-1.5 rounded-xl transition-all shrink-0 ${
              activeTab === "artifacts"
                ? "bg-accent-500 text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
            }`}
          >
            Thánh di vật ({char.artifacts.length}/5)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("weapon")}
            className={`px-3.5 py-1.5 rounded-xl transition-all shrink-0 ${
              activeTab === "weapon"
                ? "bg-accent-500 text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
            }`}
          >
            Vũ khí (Weapon)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("evaluator")}
            className={`px-3.5 py-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === "evaluator"
                ? "bg-amber-500 text-bg-primary font-bold shadow-sm"
                : "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30"
            }`}
          >
            <span>⚖️</span>
            <span>So sánh Build LEIBO</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-5 md:p-6 overflow-y-auto space-y-5">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Quick highlight grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-bg-elevated border border-border">
                  <div className="text-[11px] text-text-muted">Lượng Máu (HP)</div>
                  <div className="text-lg font-mono font-bold text-text-primary mt-0.5">
                    {fp.hp.toLocaleString()}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-bg-elevated border border-border">
                  <div className="text-[11px] text-text-muted">Tấn Công (ATK)</div>
                  <div className="text-lg font-mono font-bold text-text-primary mt-0.5">
                    {fp.atk.toLocaleString()}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-bg-elevated border border-border">
                  <div className="text-[11px] text-text-muted">Tỉ Lệ / Sát Thương Bạo</div>
                  <div className="text-lg font-mono font-bold text-text-primary mt-0.5">
                    {fp.critRate}% / {fp.critDmg}%
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-bg-elevated border border-border">
                  <div className="text-[11px] text-text-muted">Hiệu Quả Nạp (ER)</div>
                  <div className="text-lg font-mono font-bold text-text-primary mt-0.5">
                    {fp.er}%
                  </div>
                </div>
              </div>

              {/* Weapon preview */}
              {char.weapon && (
                <div className="p-4 rounded-2xl bg-bg-elevated/70 border border-border flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {char.weapon.iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={char.weapon.iconUrl}
                        alt={char.weapon.name}
                        className="w-12 h-12 rounded-xl object-contain bg-bg-card border border-border p-1"
                      />
                    ) : (
                      <WeaponIcon type="Sword" size={28} />
                    )}
                    <div>
                      <div className="font-semibold text-sm text-text-primary">{char.weapon.name}</div>
                      <div className="text-xs text-text-secondary mt-0.5">
                        Cấp {char.weapon.level}/90 · Tinh luyện {char.weapon.refinement} · {char.weapon.rarity}★
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("weapon")}
                    className="text-xs text-accent-bright hover:underline font-semibold shrink-0"
                  >
                    Xem vũ khí &rarr;
                  </button>
                </div>
              )}

              {/* Talents preview */}
              {char.talentLevels.length > 0 && (
                <div className="p-4 rounded-2xl bg-bg-elevated/70 border border-border flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-xs font-semibold text-text-secondary">
                    Cấp độ Thiên phú (Đánh thường / Kỹ năng / Nộ):
                  </div>
                  <div className="flex items-center gap-2">
                    {char.talentLevels.map((lv, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-bg-card border border-border font-mono font-bold text-xs text-accent-bright"
                      >
                        Lv.{lv}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Artifact summary */}
              <div className="p-4 rounded-2xl bg-bg-elevated/70 border border-border space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-text-secondary">Chất lượng Thánh di vật:</span>
                  <span className="font-mono text-accent-bright font-bold">
                    {char.totalCritValue} CV ({char.totalCvRating}) · {char.totalRollValue}% RV
                  </span>
                </div>
                <div className="text-xs text-text-muted">
                  Hiệu ứng bộ:{" "}
                  {char.activeSetSummary.length > 0 ? (
                    <strong className="text-text-primary">{char.activeSetSummary.join(", ")}</strong>
                  ) : (
                    <span>Chưa kích hoạt đủ 2 hoặc 4 món của bộ nào</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED STATS */}
          {activeTab === "stats" && (
            <div className="space-y-4">
              <div className="text-xs text-text-muted">
                Bảng thông số chi tiết trích xuất trực tiếp từ engine thuộc tính chiến đấu (FightPropMap) của người chơi:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-bg-elevated border border-border flex justify-between">
                  <span className="text-text-muted">Lượng Máu Tối Đa (Max HP)</span>
                  <span className="font-mono font-bold text-text-primary">{fp.hp.toLocaleString()} (Cơ bản: {fp.baseHp.toLocaleString()})</span>
                </div>
                <div className="p-3.5 rounded-xl bg-bg-elevated border border-border flex justify-between">
                  <span className="text-text-muted">Sức Tấn Công (ATK)</span>
                  <span className="font-mono font-bold text-text-primary">{fp.atk.toLocaleString()} (Cơ bản: {fp.baseAtk.toLocaleString()})</span>
                </div>
                <div className="p-3.5 rounded-xl bg-bg-elevated border border-border flex justify-between">
                  <span className="text-text-muted">Phòng Ngự (DEF)</span>
                  <span className="font-mono font-bold text-text-primary">{fp.def.toLocaleString()} (Cơ bản: {fp.baseDef.toLocaleString()})</span>
                </div>
                <div className="p-3.5 rounded-xl bg-bg-elevated border border-border flex justify-between">
                  <span className="text-text-muted">Tinh Thông Nguyên Tố (EM)</span>
                  <span className="font-mono font-bold text-text-primary">{fp.em}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-bg-elevated border border-border flex justify-between">
                  <span className="text-text-muted">Tỉ Lệ Bạo Kích (CRIT Rate)</span>
                  <span className="font-mono font-bold text-text-primary">{fp.critRate}%</span>
                </div>
                <div className="p-3.5 rounded-xl bg-bg-elevated border border-border flex justify-between">
                  <span className="text-text-muted">Sát Thương Bạo Kích (CRIT DMG)</span>
                  <span className="font-mono font-bold text-text-primary">{fp.critDmg}%</span>
                </div>
                <div className="p-3.5 rounded-xl bg-bg-elevated border border-border flex justify-between">
                  <span className="text-text-muted">Hiệu Quả Nạp (Energy Recharge)</span>
                  <span className="font-mono font-bold text-text-primary">{fp.er}%</span>
                </div>
                <div className="p-3.5 rounded-xl bg-bg-elevated border border-border flex justify-between">
                  <span className="text-text-muted">Tăng ST Nguyên Tố ({char.vision || "Chính"})</span>
                  <span className="font-mono font-bold text-text-primary">{fp.damageBonus}%</span>
                </div>
                <div className="p-3.5 rounded-xl bg-bg-elevated border border-border flex justify-between">
                  <span className="text-text-muted">Tăng Trị Liệu (Healing Bonus)</span>
                  <span className="font-mono font-bold text-text-primary">{fp.healingBonus}%</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ARTIFACTS */}
          {activeTab === "artifacts" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Chi tiết 5 vị trí Thánh di vật, điểm CV và Roll Value (RV%):</span>
                <span className="font-mono text-accent-bright font-bold">
                  Tổng CV: {char.totalCritValue} · Tổng RV: {char.totalRollValue}%
                </span>
              </div>

              {char.artifacts.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border rounded-2xl text-xs text-text-muted">
                  Người chơi chưa trang bị Thánh di vật nào trên nhân vật này.
                </div>
              ) : (
                <div className="space-y-3">
                  {char.artifacts.map((art, idx) => {
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-bg-elevated border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          {art.iconUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={art.iconUrl}
                              alt={art.name}
                              className="w-12 h-12 rounded-xl object-contain bg-bg-card border border-border p-1"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-bg-card border border-border flex items-center justify-center font-bold text-text-muted">
                              {art.slot[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-text-primary text-sm">{art.slotName}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-card border border-border text-accent-bright">
                                +{art.level}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-500/10 text-accent-bright border border-accent-500/20">
                                {art.cvRating}
                              </span>
                            </div>
                            <div className="text-[11px] text-accent-bright/90 font-medium mt-0.5">
                              Chính: <strong>{art.mainStat.label}</strong> +{art.mainStat.value}
                            </div>
                            {art.setName && (
                              <div className="text-[10px] text-text-muted italic">{art.setName}</div>
                            )}
                          </div>
                        </div>

                        {/* Substats */}
                        <div className="w-full sm:w-auto min-w-[220px] bg-bg-card p-2.5 rounded-xl border border-border/60">
                          <div className="flex items-center justify-between text-[10px] text-text-muted mb-1 pb-1 border-b border-border/40 font-mono">
                            <span>DÒNG PHỤ</span>
                            <span className="text-accent-bright font-bold">
                              {art.critValue > 0 ? `${art.critValue} CV` : ""} ({art.rollValue}% RV)
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                            {art.substats.map((sub, sIdx) => (
                              <div key={sIdx} className="text-text-secondary truncate">
                                • {sub.label}: <strong className="text-text-primary">{sub.value}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WEAPON */}
          {activeTab === "weapon" && (
            <div className="space-y-4">
              {char.weapon ? (
                <div className="p-6 rounded-2xl bg-bg-elevated border border-border space-y-4">
                  <div className="flex items-center gap-4">
                    {char.weapon.iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={char.weapon.iconUrl}
                        alt={char.weapon.name}
                        className="w-16 h-16 rounded-2xl object-contain bg-bg-card border border-border p-2 shadow-sm"
                      />
                    ) : (
                      <WeaponIcon type="Sword" size={40} />
                    )}
                    <div>
                      <h4 className="font-display text-lg font-bold text-text-primary">
                        {char.weapon.name}
                      </h4>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Cấp độ: <strong className="text-text-primary font-mono">{char.weapon.level}/90</strong> ·
                        Tinh luyện: <strong className="text-accent-bright font-mono">Hạng {char.weapon.refinement}</strong> ·
                        Độ hiếm: {char.weapon.rarity}★
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-bg-card border border-border/60 text-xs text-text-secondary">
                    Vũ khí đang được trang bị cho nhân vật trong game. Tinh luyện R{char.weapon.refinement} đã được
                    tính toán tự động vào bộ chỉ số chiến đấu và sát thương kỳ vọng.
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-border rounded-2xl text-xs text-text-muted">
                  Không tìm thấy thông tin vũ khí.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: LEIBO BUILD EVALUATOR & BENCHMARK */}
          {activeTab === "evaluator" && evaluation && (
            <div className="space-y-5">
              {/* Profile selector pill (Hỗ trợ đa lối chơi) */}
              {evaluation.hasMultiProfiles && (
                <div className="p-3.5 rounded-2xl bg-bg-elevated border border-border space-y-2">
                  <div className="text-xs font-semibold text-text-secondary">
                    Chọn Hồ Sơ Lối Chơi Đối Chiếu (Multi-Profile Benchmark):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {evaluation.availableProfiles.map((p) => {
                      const active = evaluation.activeProfileId === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedProfileId(p.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs transition-all border ${
                            active
                              ? "bg-accent-500 text-white border-accent-500 font-bold shadow-sm"
                              : "bg-bg-card text-text-secondary border-border hover:border-accent-500/50 hover:text-text-primary"
                          }`}
                        >
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Overall Grade Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-accent-500/15 via-bg-elevated to-bg-elevated border border-accent-500/30 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-xs text-text-muted uppercase font-semibold tracking-wider">
                    ĐÁNH GIÁ CHUẨN KQM &amp; LEIBO PROFILE
                  </div>
                  <div className="font-display text-xl font-bold text-text-primary mt-1">
                    {evaluation.activeProfileName}
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    Vai trò: <strong className="text-accent-bright">{evaluation.activeProfileRole}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3.5 py-1.5 rounded-xl font-display font-bold text-sm bg-accent-500 text-white shadow-md">
                    {evaluation.overallGrade}
                  </span>
                </div>
              </div>

              {/* Grid 4 cards so sánh */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {/* 1. Vũ khí */}
                <div className="p-4 rounded-2xl bg-bg-elevated border border-border space-y-2">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-text-secondary">1. Vũ khí đang dùng:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        evaluation.weapon.matchTier.includes("BiS")
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : evaluation.weapon.matchTier.includes("A")
                            ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {evaluation.weapon.matchTier}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-text-primary">
                    {evaluation.weapon.name} (R{evaluation.weapon.refinement})
                  </div>
                  {evaluation.weapon.recommendedTopWeapons.length > 0 && (
                    <div className="text-[11px] text-text-muted pt-1 border-t border-border/50">
                      Top vũ khí BiS/S-Tier: {evaluation.weapon.recommendedTopWeapons.join(", ")}
                    </div>
                  )}
                </div>

                {/* 2. Thánh di vật */}
                <div className="p-4 rounded-2xl bg-bg-elevated border border-border space-y-2">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-text-secondary">2. Bộ Thánh di vật:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        evaluation.artifactSet.isRecommended
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {evaluation.artifactSet.matchStatus}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-text-primary">
                    {evaluation.artifactSet.equippedSummary.length > 0
                      ? evaluation.artifactSet.equippedSummary.join(" + ")
                      : "Chưa kích hoạt bộ"}
                  </div>
                  {evaluation.artifactSet.recommendedSets.length > 0 && (
                    <div className="text-[11px] text-text-muted pt-1 border-t border-border/50">
                      Khuyến nghị chuẩn: {evaluation.artifactSet.recommendedSets.slice(0, 2).join(" / ")}
                    </div>
                  )}
                </div>

                {/* 3. Main Stats */}
                <div className="p-4 rounded-2xl bg-bg-elevated border border-border space-y-2">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-text-secondary">3. Chỉ số chính 3 món:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        evaluation.mainStats.matchCount === 3
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-amber-500/15 text-amber-400"
                      }`}
                    >
                      Khớp {evaluation.mainStats.matchCount}/3 món
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div>
                      • Đồng hồ: <strong>{evaluation.mainStats.sands.actual || "Thiếu"}</strong>{" "}
                      {evaluation.mainStats.sands.isMatch ? "✅" : "⚠️ (cần: " + evaluation.mainStats.sands.recommended.join("/") + ")"}
                    </div>
                    <div>
                      • Ly: <strong>{evaluation.mainStats.goblet.actual || "Thiếu"}</strong>{" "}
                      {evaluation.mainStats.goblet.isMatch ? "✅" : "⚠️ (cần: " + evaluation.mainStats.goblet.recommended.join("/") + ")"}
                    </div>
                    <div>
                      • Nón: <strong>{evaluation.mainStats.circlet.actual || "Thiếu"}</strong>{" "}
                      {evaluation.mainStats.circlet.isMatch ? "✅" : "⚠️ (cần: " + evaluation.mainStats.circlet.recommended.join("/") + ")"}
                    </div>
                  </div>
                </div>

                {/* 4. Stat Benchmarks */}
                <div className="p-4 rounded-2xl bg-bg-elevated border border-border space-y-2">
                  <div className="font-semibold text-text-secondary">4. Mốc chỉ số quan trọng:</div>
                  <div className="space-y-1.5 text-[11px]">
                    <div>
                      <strong>Tỉ lệ Bạo:</strong> {evaluation.statBenchmarks.critRatio.actual} —{" "}
                      <span className="text-accent-bright font-semibold">{evaluation.statBenchmarks.critRatio.rating}</span>
                      <p className="text-[10px] text-text-muted mt-0.5">{evaluation.statBenchmarks.critRatio.note}</p>
                    </div>
                    <div>
                      <strong>Hiệu Quả Nạp:</strong> {evaluation.statBenchmarks.energyRecharge.actual}%{" "}
                      (Mục tiêu: {evaluation.statBenchmarks.energyRecharge.targetRange}){" "}
                      {evaluation.statBenchmarks.energyRecharge.isMet ? "✅" : "⚠️"}
                      <p className="text-[10px] text-text-muted mt-0.5">{evaluation.statBenchmarks.energyRecharge.note}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actionable Tips */}
              <div className="p-4 rounded-2xl bg-bg-card border border-border space-y-2">
                <h4 className="text-xs font-bold text-accent-bright uppercase tracking-wider">
                  💡 GỢI Ý NÂNG CẤP THỰC TẾ CHO BUILD NÀY:
                </h4>
                <ul className="space-y-1.5 text-xs text-text-secondary">
                  {evaluation.actionableTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-accent-bright font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 md:p-5 border-t border-border bg-bg-elevated/40 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-text-muted">
            Dữ liệu được xác thực bởi <strong>LEIBO Build Gate</strong>.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onUseForDpsCalculator(char)}
              className="px-4 py-2 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-semibold text-xs transition-colors"
            >
              Nạp vào DPS Calculator &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
