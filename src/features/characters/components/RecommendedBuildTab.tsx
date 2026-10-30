/**
 * src/features/characters/components/RecommendedBuildTab.tsx
 *
 * Tab "Build Khuyên Dùng" — Server component, hiển thị trên trang chi tiết nhân vật.
 *
 * Nguồn dữ liệu: 100% Prisma DB thật
 * - Weapon: query theo weaponType + rarity DESC, top 5 (phân tầng S/A/B)
 * - Artifact: query 5★ sets, score theo nguyên tố, top 4 + gợi ý kết hợp 2+2
 * - Main stats: logic theo KQM meta dựa trên vision + weaponType
 * - Sub stats: ưu tiên theo role DPS / Support / Reaction
 * - Talent priority: thứ tự nâng thiên phú theo kiểu nhân vật
 * - Playstyle notes: mô tả ngắn theo nguyên tố + weapon type
 */

import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db/prisma";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { SafeImage } from "@/components/ui/SafeImage";
import { WeaponIcon } from "@/features/weapons/components/WeaponIcon";
import type { Character } from "@prisma/client";
import {
  localWeaponIcon,
  localArtifactSetIcon,
} from "@/lib/ui/local-assets";
import { rarityTextClass } from "@/lib/ui/theme";
import { getCharacterBuild } from "@/data/character-builds-data";

// ─── Tier system ────────────────────────────────────────────────────────────

type WeaponTier = "S" | "A" | "B" | "C";

interface TierConfig {
  label: string;
  bg: string;
  border: string;
  text: string;
}

const TIER_STYLES: Record<WeaponTier, TierConfig> = {
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

function getTierForRank(idx: number, rarity: number): WeaponTier {
  if (idx === 0 && rarity === 5) return "S";
  if (idx <= 1 && rarity >= 4) return "A";
  if (idx <= 3) return "B";
  return "C";
}

// ─── Build-guide helpers ─────────────────────────────────────────────────────

type CharacterRole = "dps" | "subdps" | "support" | "healer" | "shielder";

/** Xác định vai trò chính dựa trên nguyên tố + weapon type */
function detectRole(vision: string, weaponType: string): CharacterRole {
  // Catalyst + Hydro/Anemo thường là support/healer
  if (weaponType === "Catalyst" && (vision === "Hydro" || vision === "Anemo"))
    return "support";
  // Geo claymore thường là shielder/DPS
  if (vision === "Geo" && weaponType === "Claymore") return "dps";
  // Sword + Geo thường shielder (Noelle, Albedo exception)
  if (vision === "Geo") return "support";
  // Anemo: buffer/VV shredder
  if (vision === "Anemo") return "support";
  return "dps";
}

/** Main stat recommendation theo KQM meta */
function getMainStats(vision: string, weaponType: string) {
  // Catalyst Hydro => thường là heal/support (Kokomi, Barbara)
  if (weaponType === "Catalyst" && vision === "Hydro") {
    return {
      sands: "HP% hoặc ER%",
      goblet: "HP% hoặc Hydro DMG%",
      circlet: "Chữa lành (Healing Bonus) hoặc HP%",
      note: "Kokomi/Barbara: HP% cho max heal. DPS Hydro Catalyst: HP% + Hydro DMG%.",
    };
  }
  if (vision === "Anemo") {
    return {
      sands: "ATK% hoặc ER%",
      goblet: "Anemo DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Support Anemo (Kazuha, Venti): thay Goblet bằng ER% nếu thiếu Năng lượng. DPS: dùng đủ combo.",
    };
  }
  if (vision === "Geo") {
    return {
      sands: "ATK% hoặc ER%",
      goblet: "Geo DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Zhongli: HP% toàn bộ để max khiên. Albedo/Navia: ATK% + Geo DMG% + CR/CD.",
    };
  }
  if (vision === "Dendro") {
    return {
      sands: "EM hoặc ATK%",
      goblet: "Dendro DMG% hoặc EM",
      circlet: "CRIT Rate, CRIT DMG hoặc EM",
      note: "Phản ứng Bloom/Quicken: ưu tiên EM. DPS trực tiếp (Alhaitham): CR > CD > ATK%.",
    };
  }
  if (vision === "Electro") {
    return {
      sands: "ATK% hoặc ER%",
      goblet: "Electro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Hyperbloom trigger (Kuki): EM 3 slots. Sub-DPS (Fischl): ATK% + Electro DMG%.",
    };
  }
  if (vision === "Hydro") {
    return {
      sands: "ATK% hoặc HP%",
      goblet: "Hydro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "DPS: CR/CD combo. Phụ trợ Thần Hộ Pháp Furina: HP% ưu tiên hơn ATK%.",
    };
  }
  if (vision === "Pyro") {
    return {
      sands: "ATK%",
      goblet: "Pyro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Vaporize/Melt DPS: CR ≥ 70% trước khi stack CD. Melt cryo (Ganyu): CR rất quan trọng.",
    };
  }
  if (vision === "Cryo") {
    return {
      sands: "ATK% hoặc ER%",
      goblet: "Cryo DMG%",
      circlet: "CRIT Rate",
      note: "Ganyu: CR ≥ 60% để Melt hiệu quả, không cần quá nhiều CD nhờ Melt x2. Ayaka/Eula: CR/CD 1:2.",
    };
  }
  // Physical (Bow Cryo, Physical Claymore...)
  if (weaponType === "Bow" && vision === "Cryo") {
    return {
      sands: "ATK%",
      goblet: "Physical DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Physical bow sniper: Physical DMG% Goblet luôn tốt hơn Cryo DMG% nếu build Physical.",
    };
  }
  // Fallback
  return {
    sands: "ATK%",
    goblet: `${vision} DMG%`,
    circlet: "CRIT Rate hoặc CRIT DMG",
    note: "Tỉ lệ mục tiêu: CR ≥ 60% - CD ≥ 120% (chuẩn 1:2 KQM).",
  };
}

/** Sub-stat priority theo role */
function getSubStatPriority(
  vision: string,
  _weaponType: string
): { stats: string[]; note: string } {
  // Reaction-based: EM là quan trọng
  if (["Dendro", "Electro"].includes(vision)) {
    return {
      stats: [
        "CRIT Rate / CRIT DMG (tỉ lệ 1:2)",
        "Elemental Mastery (EM)",
        "ATK%",
        "Energy Recharge (ER%)",
        "Flat ATK",
      ],
      note: "Nhân vật kích Hyperbloom/Quicken: ưu tiên EM > CR/CD. DPS trực tiếp: CR/CD trước.",
    };
  }
  if (vision === "Anemo") {
    return {
      stats: [
        "Energy Recharge (ER%)",
        "CRIT Rate / CRIT DMG",
        "ATK%",
        "Elemental Mastery (EM)",
        "Flat ATK",
      ],
      note: "VV Shredder (Kazuha, Sucrose): EM x3 slot nếu muốn tối đa Swirl DMG + buff.",
    };
  }
  if (vision === "Geo") {
    return {
      stats: [
        "CRIT Rate / CRIT DMG (tỉ lệ 1:2)",
        "ATK%",
        "Energy Recharge (ER%)",
        "Flat ATK",
        "DEF% (nếu là Zhongli/Noelle)",
      ],
      note: "Zhongli/Noelle: DEF% thay ATK%. Albedo: hưởng lợi từ DEF% cho skill.",
    };
  }
  // Pyro / Hydro / Cryo — reaction amp
  if (["Pyro", "Hydro", "Cryo"].includes(vision)) {
    return {
      stats: [
        "CRIT Rate / CRIT DMG (tỉ lệ 1:2)",
        "ATK%",
        "Elemental Mastery (EM) — nếu build phản ứng",
        "Energy Recharge (ER%)",
        "Flat ATK",
      ],
      note: "Phản ứng khuếch đại (Vaporize/Melt): thêm EM nếu thường xuyên kích phản ứng. Sub DPS: ER% thêm.",
    };
  }
  return {
    stats: [
      "CRIT Rate / CRIT DMG (tỉ lệ 1:2)",
      "ATK%",
      "Energy Recharge (ER%)",
      "Elemental Mastery (EM)",
      "Flat ATK",
    ],
    note: "Mục tiêu: CR ≥ 60% - CD ≥ 120% (chuẩn 1:2 KQM). ER đủ để burst liên tục.",
  };
}

/** Talent priority theo vai trò */
function getTalentPriority(
  vision: string,
  weaponType: string
): { order: string[]; note: string } {
  const role = detectRole(vision, weaponType);

  if (role === "support" || role === "healer") {
    return {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "Support ưu tiên E hoặc Q tùy skill nào buff/heal nhiều hơn. Đòn thường thường không quan trọng.",
    };
  }
  if (vision === "Anemo") {
    return {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Kazuha/Venti: Q là nguồn Swirl chính. Wanderer: NA quan trọng hơn E.",
    };
  }
  if (vision === "Geo") {
    return {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "Albedo: E là nguồn sát thương chính (Transient Blossom). Zhongli: E (khiên) > Q.",
    };
  }
  if (weaponType === "Catalyst") {
    return {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Catalyst DPS thường dùng Q rồi spam NA. Nahida/Alhaitham: E là nguồn chính.",
    };
  }
  if (weaponType === "Bow") {
    return {
      order: ["Đòn thường (NA)", "Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)"],
      note: "Bow DPS: Charged Attack (thuộc NA) là nguồn sát thương chính. Fischl: E đặc biệt quan trọng.",
    };
  }
  // Claymore/Polearm/Sword DPS
  return {
    order: ["Đòn thường (NA)", "Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)"],
    note: "Polearm/Claymore DPS: NA là nguồn chính. Một số nhân vật có Q mạnh hơn NA (Eula, Hu Tao).",
  };
}

/** Gợi ý phong cách thi triển */
function getPlaystyleNote(vision: string, weaponType: string): string {
  const map: Partial<Record<string, string>> = {
    Anemo:
      "Gom địch + giảm kháng (VV set). Xoay E/Q để khuếch đại nguyên tố của đồng đội, tận dụng cộng hưởng Swirl. Không cần CR/CD cao nếu chơi support thuần.",
    Geo:
      "Tạo Crystallize shield bảo vệ đội. Một số Geo DPS (Navia, Itto) tối đa hóa chỉ số riêng. Zhongli: chú trọng HP% để shield dày.",
    Dendro:
      "Kích thích phản ứng Bloom, Hyperbloom, Quicken. EM cực kỳ quan trọng cho nhân vật kích phản ứng. Phối hợp Hydro + Electro để có Hyperbloom.",
    Electro:
      "Đa dụng: kích Superconduct (giảm DEF Physical), Quicken, Hyperbloom. Fischl + Oz: Sub-DPS off-field. Raiden: Q buff đội sau khi nạp Resolve.",
    Hydro:
      "Áp Wet lên địch cho Vaporize/Freeze. Neuvillette: hold Charged Attack. Furina: thao túng HP đội để stack buff Náo Nhiệt.",
    Pyro:
      "Vaporize (x1.5/x2) hoặc Melt (x1.5/x2) để nhân sát thương. Hu Tao: đánh khi HP thấp. Xiangling: Q off-field xoay Pyronado.",
    Cryo:
      "Freeze để kiểm soát địch hoặc Melt để nhân sát thương. Ganyu: Charged Shot Lv2 nguy hiểm. Ayaka: dash để áp Cryo + Q.",
  };
  const visionNote = map[vision];
  if (visionNote) return visionNote;
  if (weaponType === "Bow")
    return "Bow: Charged Attack là đòn chính (Level 2 Charged Shot mạnh nhất). Canh góc nhắm để tối đa sát thương.";
  if (weaponType === "Catalyst")
    return "Catalyst: tất cả đòn đều gắn nguyên tố. Tận dụng để áp nguyên tố liên tục, combo Q → E → NA spam.";
  return "Chú trọng combo E → Q → NA để tối đa hóa uptime buff và sát thương. Quản lý năng lượng để Q luôn sẵn sàng.";
}

/** Score artifact set theo nguyên tố nhân vật */
function artifactMatchScore(
  vision: string,
  two: string | null,
  four: string | null
): number {
  const text = `${two ?? ""} ${four ?? ""}`.toLowerCase();
  const v = vision.toLowerCase();
  // Exact element bonus
  if (text.includes(v)) return 3;
  // Universal buffs (ATK, EM, Healing, ER)
  if (text.includes("atk")) return 2;
  if (text.includes("elemental mastery") || text.includes(" em")) return 2;
  if (text.includes("healing") || text.includes("hp")) return 1;
  if (text.includes("energy recharge") || text.includes("recharge")) return 1;
  return 0;
}

const STAR = "★";

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  character: Pick<Character, "id" | "name" | "vision" | "weaponType" | "rarity">;
  locale: string;
  elementColor?: string;
}

export async function RecommendedBuildTab({ character, locale, elementColor }: Props) {
  const vision = character.vision ?? "Anemo";
  const weaponType = character.weaponType ?? "Sword";

  const specificBuild = getCharacterBuild(character.id);

  // ── 1. Weapons: Specific build if available, else top 5 from DB ────────
  type DisplayWeapon = {
    id: string;
    name: string;
    rarity: number;
    baseAtk: number | null;
    subStatName: string | null;
    subStatValue: string | null;
    effectName: string | null;
    iconUrl: string | null;
    iconUrlOriginal: string | null;
    tier: WeaponTier;
    customNote?: string;
  };

  let weaponsToDisplay: DisplayWeapon[] = [];

  if (specificBuild?.weapons && specificBuild.weapons.length > 0) {
    const specificWeaponIds = specificBuild.weapons.map((w) => w.weaponId);
    const dbWeapons = await prisma.weapon.findMany({
      where: { id: { in: specificWeaponIds } },
      select: {
        id: true,
        name: true,
        rarity: true,
        baseAtk: true,
        subStatName: true,
        subStatValue: true,
        effectName: true,
        iconUrl: true,
        iconUrlOriginal: true,
      },
    });
    const weaponMap = new Map(dbWeapons.map((w) => [w.id, w]));
    const mappedWeapons: DisplayWeapon[] = [];
    for (const sw of specificBuild.weapons) {
      const w = weaponMap.get(sw.weaponId);
      if (w) {
        mappedWeapons.push({
          ...w,
          tier: sw.tier,
          customNote: sw.noteVi,
        });
      }
    }
    weaponsToDisplay = mappedWeapons;
  }

  if (weaponsToDisplay.length === 0) {
    const topWeapons = await prisma.weapon.findMany({
      where: {
        type: weaponType,
        rarity: { gte: 4 },
      },
      orderBy: [{ rarity: "desc" }, { baseAtk: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        rarity: true,
        baseAtk: true,
        subStatName: true,
        subStatValue: true,
        effectName: true,
        iconUrl: true,
        iconUrlOriginal: true,
      },
      take: 5,
    });
    weaponsToDisplay = topWeapons.map((w, idx) => ({
      ...w,
      tier: getTierForRank(idx, w.rarity),
    }));
  }

  // ── 2. Artifact sets: Specific build if available, else scored ────────
  type DisplayArtifact = {
    id: string;
    name: string;
    twoPieceBonus: string | null;
    fourPieceBonus: string | null;
    iconUrl: string | null;
    iconUrlOriginal: string | null;
    customNote?: string;
  };

  type DisplayCombo = {
    a: { name: string };
    b: { name: string };
    customNote?: string;
  };

  let artifactsToDisplay: DisplayArtifact[] = [];
  let twoTwoCombosToDisplay: DisplayCombo[] = [];

  if (specificBuild?.artifacts && specificBuild.artifacts.length > 0) {
    const specificSetIds = Array.from(new Set(specificBuild.artifacts.flatMap((a) => a.setIds)));
    const dbArtifacts = await prisma.artifactSet.findMany({
      where: { id: { in: specificSetIds } },
      select: {
        id: true,
        name: true,
        twoPieceBonus: true,
        fourPieceBonus: true,
        iconUrl: true,
        iconUrlOriginal: true,
      },
    });
    const artifactMap = new Map(dbArtifacts.map((a) => [a.id, a]));

    const mappedArtifacts: DisplayArtifact[] = [];
    for (const a of specificBuild.artifacts) {
      if (a.mode === "4pc" || a.setIds.length === 1) {
        const art = artifactMap.get(a.setIds[0]);
        if (art) {
          mappedArtifacts.push({
            ...art,
            customNote: a.noteVi,
          });
        }
      }
    }
    artifactsToDisplay = mappedArtifacts;

    const mappedCombos: DisplayCombo[] = [];
    for (const a of specificBuild.artifacts) {
      if (a.mode === "2+2" && a.setIds.length >= 2) {
        const aSet = artifactMap.get(a.setIds[0]);
        const bSet = artifactMap.get(a.setIds[1]);
        if (aSet && bSet) {
          mappedCombos.push({
            a: { name: aSet.name },
            b: { name: bSet.name },
            customNote: a.noteVi,
          });
        }
      }
    }
    twoTwoCombosToDisplay = mappedCombos;
  }

  if (artifactsToDisplay.length === 0) {
    const allArtifacts = await prisma.artifactSet.findMany({
      where: { rarityRange: { hasSome: [5] } },
      select: {
        id: true,
        name: true,
        twoPieceBonus: true,
        fourPieceBonus: true,
        iconUrl: true,
        iconUrlOriginal: true,
      },
      orderBy: { name: "asc" },
      take: 50,
    });

    artifactsToDisplay = allArtifacts
      .map((a) => ({
        ...a,
        _score: artifactMatchScore(vision, a.twoPieceBonus, a.fourPieceBonus),
      }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 4);

    if (artifactsToDisplay.length >= 2) {
      twoTwoCombosToDisplay = [
        { a: { name: artifactsToDisplay[0].name }, b: { name: artifactsToDisplay[1].name } },
        artifactsToDisplay.length >= 4
          ? { a: { name: artifactsToDisplay[2].name }, b: { name: artifactsToDisplay[3].name } }
          : null,
      ].filter((c): c is DisplayCombo => c !== null);
    }
  }

  // ── 3. Build-guide data ───────────────────────────────────────────────
  const mainStats = specificBuild?.mainStats ?? getMainStats(vision, weaponType);
  const subStats = specificBuild?.subStats ?? getSubStatPriority(vision, weaponType);
  const talentPriority = specificBuild?.talentPriority ?? getTalentPriority(vision, weaponType);
  const playstyleNote = specificBuild?.playstyleNoteVi ?? getPlaystyleNote(vision, weaponType);

  return (
    <section className="mb-10">
      <SectionHeading elementColor={elementColor}>
        Build Khuyên Dùng
      </SectionHeading>

      {/* ── Playstyle note ── */}
      <div
        className="mb-6 p-4 rounded-xl border text-sm text-text-secondary leading-relaxed"
        style={{
          borderColor: elementColor
            ? `color-mix(in srgb, ${elementColor} 40%, var(--border-color))`
            : "var(--border-color)",
          background: elementColor
            ? `color-mix(in srgb, ${elementColor} 6%, var(--bg-elevated))`
            : "var(--bg-elevated)",
        }}
      >
        <span className="font-semibold text-text-primary">Phong cách thi triển: </span>
        {playstyleNote}
      </div>

      {/* ── Top grid: Weapons + Artifacts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

        {/* ── Weapons ── */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            {weaponType && <WeaponIcon type={weaponType} size={18} />}
            <span>Vũ khí đề xuất</span>
            <span className="text-xs text-text-secondary font-normal">({weaponType})</span>
          </h3>
          <div className="flex flex-col gap-2">
            {weaponsToDisplay.length === 0 ? (
              <p className="text-text-secondary text-sm">Chưa có dữ liệu vũ khí.</p>
            ) : (
              weaponsToDisplay.map((w) => {
                const style = TIER_STYLES[w.tier];
                const localIcon = localWeaponIcon(w.id);
                return (
                  <Link
                    key={w.id}
                    href={`/weapons/${w.id}`}
                    className={`flex items-center gap-3 rounded-xl border p-3 hover:brightness-110 transition-all group ${style.bg} ${style.border}`}
                  >
                    {/* Tier badge */}
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${style.bg} ${style.border} ${style.text}`}
                    >
                      {style.label}
                    </span>

                    {/* Weapon icon */}
                    <div className="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-bg-elevated border border-border">
                      <SafeImage
                        src={localIcon}
                        fallbackSrcs={[w.iconUrl, w.iconUrlOriginal]}
                        alt={w.name}
                        fill
                        sizes="40px"
                        className="object-contain p-0.5"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-sm text-text-primary group-hover:text-accent-bright transition-colors truncate">
                          {w.name}
                        </span>
                        <span className={`text-xs shrink-0 ${rarityTextClass(w.rarity)}`}>
                          {STAR.repeat(w.rarity)}
                        </span>
                      </div>
                      <div className="text-xs text-text-secondary flex flex-wrap items-center gap-2 mt-0.5">
                        {w.baseAtk && <span>ATK: {Math.round(w.baseAtk)}</span>}
                        {w.subStatName && w.subStatValue && (
                          <span>
                            {w.subStatName}: {w.subStatValue}
                          </span>
                        )}
                        {w.customNote ? (
                          <span className="text-accent-bright font-medium truncate max-w-[200px]">
                            • {w.customNote}
                          </span>
                        ) : w.effectName ? (
                          <span className="text-accent-bright/80 truncate max-w-[160px]">
                            {w.effectName}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
          <p className="text-[11px] text-text-muted mt-2 pl-1">
            Xếp hạng theo độ hiếm + hiệu quả tối ưu cho nhân vật. Tier S = tốt nhất.
          </p>
        </div>

        {/* ── Artifact Sets ── */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3">
            Thánh di vật đề xuất
          </h3>
          <div className="flex flex-col gap-2">
            {artifactsToDisplay.length === 0 ? (
              <p className="text-text-secondary text-sm">Chưa có dữ liệu thánh di vật.</p>
            ) : (
              artifactsToDisplay.map((a, idx) => {
                const localIcon = localArtifactSetIcon(a.id);
                return (
                  <Link
                    key={a.id}
                    href={`/artifacts/${a.id}`}
                    className="flex items-start gap-3 rounded-xl border border-border bg-bg-elevated p-3 hover:border-accent-500/60 transition-colors group"
                  >
                    {/* Rank badge */}
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
                      {idx + 1}
                    </span>

                    {/* Set icon */}
                    <div className="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-bg-secondary border border-border mt-0.5">
                      <SafeImage
                        src={localIcon}
                        fallbackSrcs={[a.iconUrl, a.iconUrlOriginal]}
                        alt={a.name}
                        fill
                        sizes="40px"
                        className="object-contain p-0.5"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-text-primary group-hover:text-accent-bright transition-colors">
                          {a.name}
                        </span>
                        {a.customNote && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-accent-500/10 text-accent-bright border border-accent-500/30 truncate">
                            {a.customNote}
                          </span>
                        )}
                      </div>
                      {a.twoPieceBonus && (
                        <div className="text-xs text-text-secondary mt-1 line-clamp-1">
                          <span className="font-medium text-accent-bright/70">2 món:</span>{" "}
                          {a.twoPieceBonus}
                        </div>
                      )}
                      {a.fourPieceBonus && (
                        <div className="text-xs text-text-secondary mt-0.5 line-clamp-1">
                          <span className="font-medium text-accent-bright/70">4 món:</span>{" "}
                          {a.fourPieceBonus}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* 2+2 combo suggestions */}
          {twoTwoCombosToDisplay.length > 0 && (
            <div className="mt-3 p-3 rounded-xl border border-border bg-bg-overlay/40">
              <p className="text-xs font-medium text-text-primary mb-2">Kết hợp 2+2 thay thế:</p>
              {twoTwoCombosToDisplay.map((combo, ci) => (
                <div key={ci} className="text-xs text-text-secondary flex items-center justify-between gap-1 mb-1 last:mb-0">
                  <div className="flex items-center gap-1 truncate">
                    <span className="text-accent-bright/70 font-medium shrink-0">
                      {ci + 1}.
                    </span>
                    <span className="truncate">
                      {combo.a.name} (2) + {combo.b.name} (2)
                    </span>
                  </div>
                  {combo.customNote && (
                    <span className="text-[10px] text-text-muted shrink-0">
                      {combo.customNote}
                    </span>
                  )}
                </div>
              ))}
              <p className="text-[11px] text-text-muted mt-1">
                Dùng khi chưa hoàn thiện bộ 4 món. Hiệu quả thấp hơn ~5-10% so với 4 món.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom grid: Main Stats + Sub Stats + Talent Priority ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* ── Main Stats ── */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3">Main Stat khuyên dùng</h3>
          <div className="rounded-xl border border-border bg-bg-elevated overflow-hidden">
            {[
              { slot: "Đồng hồ (Sands)", icon: "⏱", value: mainStats.sands },
              { slot: "Ly (Goblet)", icon: "🏆", value: mainStats.goblet },
              { slot: "Nón (Circlet)", icon: "👑", value: mainStats.circlet },
            ].map(({ slot, value }) => (
              <div
                key={slot}
                className="flex flex-col px-4 py-3 border-b last:border-b-0 border-border"
              >
                <span className="text-[11px] text-text-muted uppercase tracking-wide">{slot}</span>
                <span
                  className="text-sm font-semibold mt-0.5"
                  style={{ color: elementColor ?? "var(--accent-bright)" }}
                >
                  {value}
                </span>
              </div>
            ))}
            <div className="px-4 py-3 bg-bg-overlay/40 border-t border-border">
              <p className="text-xs text-text-secondary leading-relaxed">{mainStats.note}</p>
            </div>
          </div>
        </div>

        {/* ── Sub Stats ── */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3">Sub Stat ưu tiên</h3>
          <div className="rounded-xl border border-border bg-bg-elevated overflow-hidden">
            <ol className="flex flex-col">
              {subStats.stats.map((stat, i) => (
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
              <p className="text-xs text-text-secondary leading-relaxed">{subStats.note}</p>
            </div>
          </div>
        </div>

        {/* ── Talent Priority ── */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3">Thứ tự nâng Thiên Phú</h3>
          <div className="rounded-xl border border-border bg-bg-elevated overflow-hidden">
            <ol className="flex flex-col">
              {talentPriority.order.map((talent, i) => (
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
                        i === 0
                          ? elementColor ?? "var(--accent-500)"
                          : "var(--border-color)",
                    }}
                  >
                    {i === 0 ? "1st" : i === 1 ? "2nd" : "3rd"}
                  </span>
                  <span className="text-sm text-text-primary font-medium">{talent}</span>
                </li>
              ))}
            </ol>
            <div className="px-4 py-3 bg-bg-overlay/40 border-t border-border">
              <p className="text-xs text-text-secondary leading-relaxed">{talentPriority.note}</p>
            </div>
          </div>

          {/* Team Builder & DPS Calculator CTA */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Link
              href={`/tools/team-builder?character=${character.id}`}
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
              <span>Dựng đội hình cho {character.name}</span>
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

      {/* ── Build disclaimer ── */}
      <div className="mt-4 p-3 rounded-lg border border-border bg-bg-overlay/30">
        <p className="text-[11px] text-text-muted leading-relaxed">
          <span className="font-medium text-text-secondary">Lưu ý:</span>{" "}
          Gợi ý được tính tự động dựa trên nguyên tố {vision} + {weaponType} theo chuẩn KQM meta.
          Build thực tế có thể thay đổi tùy constellation, playstyle và đội hình cụ thể.
          Tham khảo thêm KQM Guides hoặc Honey Hunter World để có build tối ưu nhất.
        </p>
      </div>
    </section>
  );
}
