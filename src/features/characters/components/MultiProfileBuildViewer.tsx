"use client";

import { useState } from "react";
import Link from "next/link";
import { EntityVisual } from "@/components/ui/EntityVisual";
import { WeaponIcon } from "@/features/weapons/components/WeaponIcon";
import {
  localWeaponIcon,
  localArtifactSetIcon,
  localCharacterIcon,
  localArtifactPiece,
} from "@/lib/ui/local-assets";
import { rarityTextClass } from "@/lib/ui/theme";
import type {
  CharacterBuildProfile,
  WeaponRankingOption,
  ArtifactRankingOption,
  RecommendedTeamOption,
} from "@/core/build-profile/types";

export interface ResolvedWeapon {
  ranking: WeaponRankingOption;
  data: {
    id: string;
    name: string;
    type: string;
    rarity: number;
    baseAtk: number | null;
    subStatName: string | null;
    subStatValue: string | null;
    effectName: string | null;
    iconUrl: string | null;
    iconUrlOriginal: string | null;
  };
}

export interface ResolvedArtifactSet {
  id: string;
  name: string;
  twoPieceBonus: string | null;
  fourPieceBonus: string | null;
  iconUrl: string | null;
  iconUrlOriginal: string | null;
}

export interface ResolvedArtifactRanking {
  ranking: ArtifactRankingOption;
  sets: ResolvedArtifactSet[];
}

export interface ResolvedTeammate {
  id: string;
  name: string;
  role: string;
}

export interface ResolvedTeam {
  team: RecommendedTeamOption;
  teammates: ResolvedTeammate[];
}

export interface ResolvedBuildProfile {
  profile: CharacterBuildProfile;
  weapons: ResolvedWeapon[];
  artifacts: ResolvedArtifactRanking[];
  teams: ResolvedTeam[];
}

interface MultiProfileBuildViewerProps {
  characterName: string;
  characterId: string;
  weaponType: string;
  elementColor?: string;
  profiles: ResolvedBuildProfile[];
  defaultProfileId?: string;
}

const TIER_STYLES: Record<string, { label: string; bg: string; border: string; text: string }> = {
  S: {
    label: "S",
    bg: "bg-[#c87941]/20",
    border: "border-[#c87941]/60",
    text: "text-[#e8a860]",
  },
  A: {
    label: "A",
    bg: "bg-[#9b59b6]/15",
    border: "border-[#9b59b6]/50",
    text: "text-[#c39bd3]",
  },
  B: {
    label: "B",
    bg: "bg-[#2980b9]/15",
    border: "border-[#2980b9]/50",
    text: "text-[#7fb3d3]",
  },
  C: {
    label: "C",
    bg: "bg-bg-elevated",
    border: "border-border",
    text: "text-text-secondary",
  },
};

const STAR = "★";

export function MultiProfileBuildViewer({
  characterName,
  characterId,
  weaponType,
  elementColor,
  profiles,
  defaultProfileId,
}: MultiProfileBuildViewerProps) {
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    defaultProfileId || profiles[0]?.profile.profileId || ""
  );

  const activeEntry =
    profiles.find((p) => p.profile.profileId === selectedProfileId) || profiles[0];

  if (!activeEntry) return null;

  const { profile, weapons, artifacts, teams } = activeEntry;

  // Tách thánh di vật thành 4pc và 2+2
  const fourPieceArtifacts = artifacts.filter((a) => a.ranking.mode === "4pc");
  const twoPieceCombos = artifacts.filter((a) => a.ranking.mode === "2+2");

  return (
    <div className="space-y-6">
      {/* ── BỘ CHỌN LỐI CHƠI (PLAYSTYLE TABS) ── */}
      {profiles.length > 1 && (
        <div className="p-2 rounded-2xl border border-border/80 bg-bg-card/90 backdrop-blur-sm">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-2 flex items-center gap-2">
            <span>Chọn lối chơi (Playstyle Profile):</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent-500/10 text-accent-bright font-mono">
              {profiles.length} phong cách
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {profiles.map((p) => {
              const isSelected = p.profile.profileId === selectedProfileId;
              return (
                <button
                  key={p.profile.profileId}
                  onClick={() => setSelectedProfileId(p.profile.profileId)}
                  className={`flex-1 min-w-[220px] text-left px-4 py-3 rounded-xl border text-sm transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-accent-500/15 border-accent-500 text-text-primary shadow-sm ring-1 ring-accent-500/30"
                      : "bg-bg-elevated/60 border-border/70 text-text-secondary hover:bg-bg-elevated hover:text-text-primary hover:border-border"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-sm leading-tight truncate">
                      {p.profile.nameVi}
                    </span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-bg-secondary text-text-muted shrink-0">
                      {p.profile.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted line-clamp-1">
                    {p.profile.playstyleVi}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── THẺ THÔNG TIN NGUỒN KQM & KIỂM ĐỊNH (KQM CITATION & VERIFICATION BANNER) ── */}
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 text-xs leading-relaxed text-emerald-200 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/30 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
              ✓
            </span>
            <span className="font-bold text-sm text-emerald-100">
              Build đã kiểm định KQM &amp; KQMS 20-Roll
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/30 font-semibold text-[11px] text-emerald-200 border border-emerald-400/30">
              VERIFIED
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-emerald-300/90">
            <span>
              <strong>Phiên bản game:</strong> {profile.sourceMetadata.gameVersionVerified}
            </span>
            <span>•</span>
            <span>
              <strong>Xác minh:</strong> {profile.sourceMetadata.verifiedAt}
            </span>
            <span>•</span>
            <span>
              <strong>Biên tập:</strong> {profile.sourceMetadata.reviewer}
            </span>
          </div>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <p>
            <strong className="text-emerald-100">Nguồn tham khảo:</strong>{" "}
            <a
              href={profile.sourceMetadata.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-bright underline hover:text-accent-bright/80 font-medium inline-flex items-center gap-1"
            >
              {profile.sourceMetadata.primarySource} ({profile.sourceMetadata.sourceVersion}) ↗
            </a>
          </p>
          <p className="text-emerald-300/80 leading-normal">
            <strong className="text-emerald-200">Giả định tính toán &amp; Điều kiện KQMS:</strong>{" "}
            {profile.conditionsAndAssumptionsVi}
          </p>
        </div>
      </div>

      {/* ── MÔ TẢ LỐI CHƠI & ĐIỀU KIỆN ÁP DỤNG ── */}
      <div
        className="p-4 rounded-xl border text-sm text-text-secondary leading-relaxed"
        style={{
          borderColor: elementColor
            ? `color-mix(in srgb, ${elementColor} 40%, var(--border-color))`
            : "var(--border-color)",
          background: elementColor
            ? `color-mix(in srgb, ${elementColor} 6%, var(--bg-elevated))`
            : "var(--bg-elevated)",
        }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-bold text-text-primary text-base">
            {profile.nameVi}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-accent-500/20 text-accent-bright border border-accent-500/30">
            {profile.role}
          </span>
        </div>
        <p className="text-text-secondary leading-relaxed">{profile.playstyleVi}</p>
      </div>

      {/* ── BẢNG NHU CẦU NẠP NĂNG LƯỢNG (ENERGY RECHARGE REQUIREMENTS) ── */}
      {profile.erRequirements.length > 0 && (
        <div className="rounded-2xl border border-border/80 bg-bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="font-semibold text-text-primary text-sm flex items-center gap-2">
              <span className="w-2 h-4 rounded-full bg-cyan-500" />
              <span>Yêu cầu Hiệu Quả Nạp Năng Lượng (Energy Recharge - ER)</span>
            </h3>
            <span className="text-[11px] text-text-muted">
              Chuẩn rotation KQM đề xuất
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {profile.erRequirements.map((er, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-border/60 bg-bg-elevated/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-text-primary">
                      {er.teamScenarioVi}
                    </span>
                    <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
                      {er.recommendedERPercent}%+
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed mt-1">
                    {er.assumedRotationVi}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-text-muted mt-2.5 pl-1 italic">
            * Cần đảm bảo đạt ngưỡng ER tối thiểu cho đội hình đang chơi trước khi đầu tư chỉ số tấn công khác (CRIT/ATK/EM).
          </p>
        </div>
      )}

      {/* ── LƯỚI TRÊN: VŨ KHÍ & THÁNH DI VẬT ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ── VŨ KHÍ ĐỀ XUẤT ── */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            {weaponType && <WeaponIcon type={weaponType} size={18} />}
            <span>Xếp hạng Vũ khí đề xuất</span>
            <span className="text-xs text-text-secondary font-normal">({weaponType})</span>
          </h3>

          <div className="flex flex-col gap-2.5">
            {weapons.map(({ ranking, data }, idx) => {
              const style = TIER_STYLES[ranking.tier] || TIER_STYLES.B;
              const localIcon = localWeaponIcon(data.id);
              const isSignature = idx === 0 && data.rarity === 5;

              return (
                <Link
                  key={data.id}
                  href={`/weapons/${data.id}`}
                  className={`flex items-start gap-3 rounded-xl border p-3 hover:brightness-105 transition-all group ${style.bg} ${style.border}`}
                >
                  {/* Tier badge */}
                  <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${style.bg} ${style.border} ${style.text}`}
                    >
                      {style.label}
                    </span>
                    {ranking.relativeDpsPercent && (
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-bg-card/80 text-accent-bright border border-border/50">
                        {ranking.relativeDpsPercent}%
                      </span>
                    )}
                  </div>

                  {/* Weapon icon */}
                  <EntityVisual
                    entityType="weapon"
                    entityId={data.id}
                    alt={data.name}
                    initialSrc={localIcon}
                    fallbackSrcs={[data.iconUrl, data.iconUrlOriginal]}
                    size="md"
                    wrapperClassName="rounded-lg overflow-hidden bg-bg-elevated border border-border shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm text-text-primary group-hover:text-accent-bright transition-colors truncate">
                        {data.name}
                      </span>
                      <span className={`text-xs shrink-0 ${rarityTextClass(data.rarity)}`}>
                        {STAR.repeat(data.rarity)}
                      </span>
                      {isSignature && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          TRẤN PHÁI
                        </span>
                      )}
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-bg-secondary text-text-muted border border-border/40">
                        {ranking.refinement}
                      </span>
                    </div>

                    <div className="text-xs text-text-secondary flex flex-wrap items-center gap-2 mt-0.5">
                      {data.baseAtk && <span>ATK Cơ bản: {Math.round(data.baseAtk)}</span>}
                      {data.subStatName && data.subStatValue && (
                        <span>
                          {data.subStatName}: {data.subStatValue}
                        </span>
                      )}
                    </div>

                    {ranking.conditionVi && (
                      <div className="text-[11px] text-amber-200/90 mt-1 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-500/20">
                        <strong>Điều kiện:</strong> {ranking.conditionVi}
                      </div>
                    )}

                    <p className="text-[11px] text-text-secondary mt-1 leading-normal">
                      {ranking.noteVi}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
          <p className="text-[11px] text-text-muted mt-2 pl-1">
            * Tỷ lệ % DPS tính theo chuẩn KQMS 20-Roll với vũ khí cơ sở (100% Baseline) trong rotation đề xuất.
          </p>
        </div>

        {/* ── THÁNH DI VẬT ĐỀ XUẤT ── */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3">
            Thánh Di Vật đề xuất (Bộ 4 món &amp; 2+2)
          </h3>

          <div className="flex flex-col gap-2.5">
            {fourPieceArtifacts.map(({ ranking, sets }, idx) => {
              const art = sets[0];
              if (!art) return null;
              const localIcon = localArtifactSetIcon(art.id);

              return (
                <Link
                  key={art.id}
                  href={`/artifacts/${art.id}`}
                  className="flex items-start gap-3 rounded-xl border border-border bg-bg-elevated p-3 hover:border-accent-500/60 transition-colors group"
                >
                  <span
                    className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0 mt-0.5"
                    style={{
                      background:
                        idx === 0
                          ? "var(--rarity-5)"
                          : idx === 1
                          ? "var(--rarity-4)"
                          : "var(--border-color)",
                      color: idx < 2 ? "#fff" : "var(--text-secondary)",
                    }}
                  >
                    #{idx + 1}
                  </span>

                  <EntityVisual
                    entityType="artifact"
                    entityId={art.id}
                    alt={art.name}
                    initialSrc={localIcon}
                    fallbackSrcs={[art.iconUrl, art.iconUrlOriginal]}
                    size="md"
                    wrapperClassName="rounded-lg overflow-hidden bg-bg-secondary border border-border mt-0.5 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-text-primary group-hover:text-accent-bright transition-colors">
                        {art.name}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent-500/20 text-accent-bright">
                        Bộ 4 món
                      </span>
                    </div>

                    <p className="text-[11px] text-accent-bright font-medium mt-0.5">
                      {ranking.noteVi}
                    </p>

                    {art.fourPieceBonus && (
                      <div className="text-xs text-text-secondary mt-1 line-clamp-2">
                        <span className="font-medium text-text-primary">Hiệu ứng 4 món:</span>{" "}
                        {art.fourPieceBonus}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* 2+2 ALTERNATIVE COMBOS */}
          {twoPieceCombos.length > 0 && (
            <div className="mt-4 p-3.5 rounded-2xl border border-border/70 bg-bg-card/80 backdrop-blur-sm shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-3.5 rounded-full bg-accent-500" />
                <p className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Kết hợp 2+2 món thay thế (Chuyển tiếp):
                </p>
              </div>

              <div className="space-y-2.5">
                {twoPieceCombos.map(({ ranking, sets }, ci) => {
                  const setA = sets[0];
                  const setB = sets[1] || sets[0];
                  if (!setA) return null;
                  const iconA = localArtifactSetIcon(setA.id);
                  const iconB = localArtifactSetIcon(setB.id);

                  return (
                    <div
                      key={ci}
                      className="p-3 rounded-xl border border-border/60 bg-bg-elevated/40 hover:bg-bg-elevated/70 transition-colors flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="text-xs font-bold font-mono text-accent-bright shrink-0">
                            #{ci + 1}
                          </span>

                          {/* Set A */}
                          <div className="flex items-center gap-2 bg-bg-card px-2.5 py-1.5 rounded-lg border border-border/50 shrink-0">
                            <EntityVisual
                              entityType="artifact"
                              entityId={setA.id}
                              alt={setA.name}
                              initialSrc={iconA}
                              fallbackSrcs={[setA.iconUrl, setA.iconUrlOriginal]}
                              size="custom"
                              wrapperClassName="w-7 h-7 rounded overflow-hidden bg-bg-secondary shrink-0"
                            />
                            <span className="text-xs font-semibold text-text-primary truncate max-w-[140px]">
                              {setA.name}
                            </span>
                            <span className="text-[10px] font-bold text-accent-bright">2 món</span>
                          </div>

                          <span className="text-accent-bright font-bold text-sm px-1">+</span>

                          {/* Set B */}
                          <div className="flex items-center gap-2 bg-bg-card px-2.5 py-1.5 rounded-lg border border-border/50 shrink-0">
                            <EntityVisual
                              entityType="artifact"
                              entityId={setB.id}
                              alt={setB.name}
                              initialSrc={iconB}
                              fallbackSrcs={[setB.iconUrl, setB.iconUrlOriginal]}
                              size="custom"
                              wrapperClassName="w-7 h-7 rounded overflow-hidden bg-bg-secondary shrink-0"
                            />
                            <span className="text-xs font-semibold text-text-primary truncate max-w-[140px]">
                              {setB.name}
                            </span>
                            <span className="text-[10px] font-bold text-accent-bright">2 món</span>
                          </div>
                        </div>

                        {ranking.noteVi && (
                          <div className="text-[11px] text-text-secondary">
                            {ranking.noteVi}
                          </div>
                        )}
                      </div>

                      {/* Hiển thị chi tiết 2 món */}
                      {(setA.twoPieceBonus || setB.twoPieceBonus) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 border-t border-border/40 text-[11px] text-text-secondary">
                          {setA.twoPieceBonus && (
                            <div className="truncate">
                              <span className="font-medium text-text-primary">{setA.name}:</span>{" "}
                              {setA.twoPieceBonus}
                            </div>
                          )}
                          {setB.twoPieceBonus && (
                            <div className="truncate">
                              <span className="font-medium text-text-primary">{setB.name}:</span>{" "}
                              {setB.twoPieceBonus}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── LƯỚI DƯỚI: MAIN STATS + SUB STATS + THIÊN PHÚ & ROTATION ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ── MAIN STATS (3 Thẻ ngang chuẩn mockup KQM) ── */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3 flex items-center justify-between">
            <span>Main Stat khuyên dùng</span>
            <span className="text-[11px] text-text-muted font-normal">Đồng hồ · Ly · Nón</span>
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              {
                slot: "Đồng hồ",
                subLabel: "Sands",
                piece: "sands" as const,
                fallbackIcon: "/local-genshin-assets/artifacts/10001-sands.png",
                value: profile.mainStats.sands.join(" / "),
              },
              {
                slot: "Ly",
                subLabel: "Goblet",
                piece: "goblet" as const,
                fallbackIcon: "/local-genshin-assets/artifacts/10001-goblet.png",
                value: profile.mainStats.goblet.join(" / "),
              },
              {
                slot: "Nón",
                subLabel: "Circlet",
                piece: "circlet" as const,
                fallbackIcon: "/local-genshin-assets/artifacts/10001-circlet.png",
                value: profile.mainStats.circlet.join(" / "),
              },
            ].map(({ slot, subLabel, piece, fallbackIcon, value }) => {
              const primarySetId = fourPieceArtifacts[0]?.sets[0]?.id || "viridescent-venerer";
              const pieceIcon = localArtifactPiece(primarySetId, piece);

              return (
                <div
                  key={slot}
                  className="p-3 rounded-xl border border-border/70 bg-bg-card flex flex-col items-center text-center justify-between gap-2 shadow-sm hover:border-border transition-colors"
                >
                  <EntityVisual
                    entityType="artifact"
                    entityId={primarySetId}
                    piece={piece}
                    alt={slot}
                    initialSrc={pieceIcon}
                    fallbackSrcs={[fallbackIcon]}
                    size="md"
                    wrapperClassName="rounded-lg bg-bg-elevated/70 border border-border/50 p-1 flex items-center justify-center shrink-0"
                  />
                  <div className="w-full">
                    <span className="text-xs font-bold text-text-primary block truncate">
                      {slot}
                    </span>
                    <span className="text-[10px] text-text-muted block">
                      {subLabel}
                    </span>
                    <span
                      className="text-xs font-bold mt-1 block truncate px-1 py-0.5 rounded bg-bg-elevated/80 border border-border/40"
                      style={{ color: elementColor ?? "var(--accent-bright)" }}
                      title={value}
                    >
                      {value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 p-3 rounded-xl bg-bg-elevated/40 border border-border/60">
            <p className="text-[11px] text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Lưu ý dòng chính:</strong>{" "}
              {profile.conditionsAndAssumptionsVi}
            </p>
          </div>
        </div>

        {/* ── SUB STATS ── */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3">Sub Stat ưu tiên</h3>
          <div className="rounded-xl border border-border bg-bg-elevated overflow-hidden">
            <ol className="flex flex-col">
              {profile.substatsPriority.map((stat, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 px-4 py-3 border-b last:border-b-0 border-border"
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{
                      background:
                        i === 0
                          ? "var(--rarity-5)"
                          : i === 1
                          ? elementColor ?? "var(--accent-500)"
                          : "var(--border-color)",
                      color: i <= 1 ? "#fff" : "var(--text-secondary)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm text-text-primary leading-snug">{stat}</span>
                </li>
              ))}
            </ol>
            <div className="px-4 py-3 bg-bg-overlay/40 border-t border-border">
              <p className="text-xs text-text-secondary leading-relaxed">
                Đạt mốc ER mục tiêu trước, sau đó tối đa hóa sát thương theo tỷ lệ CR:CD 1:2.
              </p>
            </div>
          </div>
        </div>

        {/* ── TALENT PRIORITY & ROTATION ── */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3">Thứ tự nâng Thiên Phú</h3>
          <div className="rounded-xl border border-border bg-bg-elevated overflow-hidden">
            <ol className="flex flex-col">
              {profile.talentPriority.order.map((talent, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 border-border"
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border"
                    style={{
                      background:
                        i === 0
                          ? elementColor ?? "var(--accent-500)"
                          : i === 1
                          ? "var(--rarity-4)"
                          : "var(--bg-secondary)",
                      color: i <= 1 ? "#fff" : "var(--text-secondary)",
                      borderColor:
                        i === 0 ? elementColor ?? "var(--accent-500)" : "var(--border-color)",
                    }}
                  >
                    {i === 0 ? "1st" : i === 1 ? "2nd" : "3rd"}
                  </span>
                  <span className="text-sm text-text-primary font-medium">{talent}</span>
                </li>
              ))}
            </ol>
            <div className="px-4 py-3 bg-bg-overlay/40 border-t border-border">
              <p className="text-xs text-text-secondary leading-relaxed">
                {profile.talentPriority.noteVi}
              </p>
            </div>
          </div>

          {/* Action Links */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Link
              href={`/tools/team-builder?character=${characterId}`}
              className="inline-flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border border-accent-500/60 bg-bg-elevated text-accent-bright hover:border-accent-500 hover:bg-bg-elevated/90 transition-all justify-center font-semibold shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/local-genshin-assets/ui/party.png"
                alt=""
                width={18}
                height={18}
                className="w-[18px] h-[18px] object-contain"
              />
              <span>Dựng đội hình cho {characterName}</span>
            </Link>
            <Link
              href="/tools/dps-calculator"
              className="inline-flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border border-border/80 bg-bg-card/75 text-text-secondary hover:border-accent-500 hover:text-text-primary transition-all justify-center font-medium"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/local-genshin-assets/ui/calculator.png"
                alt=""
                width={16}
                height={16}
                className="w-4 h-4 object-contain"
              />
              <span>Mô phỏng &amp; tính DPS</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── ĐỘI HÌNH ĐỀ XUẤT CHO LỐI CHƠI NÀY (RECOMMENDED TEAMS) ── */}
      {teams.length > 0 && (
        <div className="rounded-2xl border border-border/80 bg-bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="font-semibold text-text-primary text-sm flex items-center gap-2">
              <span className="w-2 h-4 rounded-full bg-accent-500" />
              <span>Đội hình đề xuất phù hợp lối chơi này</span>
            </h3>
            <span className="text-[11px] text-text-muted">
              Đã xác minh cơ chế phản ứng thực tế
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {teams.map(({ team, teammates }, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-border/70 bg-bg-elevated/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-bold text-sm text-text-primary">
                      {team.nameVi}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-accent-500/20 text-accent-bright border border-accent-500/30">
                      {team.archetypeVi}
                    </span>
                  </div>

                  {/* Teammates avatars */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {/* Bản thân nhân vật */}
                    <div className="flex flex-col items-center text-center p-2 rounded-lg bg-bg-card border border-accent-500/40">
                      <EntityVisual
                        entityType="character"
                        entityId={characterId}
                        alt={characterName}
                        initialSrc={localCharacterIcon(characterId)}
                        size="custom"
                        wrapperClassName="w-10 h-10 rounded-full overflow-hidden bg-bg-secondary border border-accent-500 mb-1"
                      />
                      <span className="text-xs font-semibold text-text-primary truncate w-full">
                        {characterName}
                      </span>
                      <span className="text-[10px] text-accent-bright font-mono">Chủ thể</span>
                    </div>

                    {/* 3 Đồng đội */}
                    {teammates.map((tm, tIdx) => (
                      <Link
                        key={tIdx}
                        href={`/characters/${tm.id}`}
                        className="flex flex-col items-center text-center p-2 rounded-lg bg-bg-card border border-border/60 hover:border-accent-500/50 transition-colors group"
                      >
                        <EntityVisual
                          entityType="character"
                          entityId={tm.id}
                          alt={tm.name}
                          initialSrc={localCharacterIcon(tm.id)}
                          size="custom"
                          wrapperClassName="w-10 h-10 rounded-full overflow-hidden bg-bg-secondary border border-border group-hover:border-accent-500 mb-1"
                        />
                        <span className="text-xs font-medium text-text-primary group-hover:text-accent-bright truncate w-full">
                          {tm.name}
                        </span>
                        <span className="text-[10px] text-text-muted truncate w-full">
                          {tm.role}
                        </span>
                      </Link>
                    ))}
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed bg-bg-card/70 p-2.5 rounded-lg border border-border/50">
                    <strong className="text-text-primary">Hiệu ứng phối hợp:</strong>{" "}
                    {team.synergyReasonVi}
                  </p>
                </div>

                {team.sampleRotationVi && (
                  <div className="mt-3 pt-2.5 border-t border-border/40 text-[11px] text-text-muted">
                    <strong className="text-text-secondary">Rotation:</strong> {team.sampleRotationVi}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
