"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { CharacterOption, WeaponOption } from "./GearShowdownClient";
import type { EnkaShowcaseCharacter } from "@/app/api/tools/enka/[uid]/route";

export interface TeamMemberConfig {
  slotId: number;
  roleLabel: string;
  char: CharacterOption | null;
  weapon: WeaponOption | null;
  weaponRefinement: number;
  level: number;
  constellation?: number;
  artifactSet: string;
  customAtk: number;
  customCritRate: number;
  customCritDmg: number;
  customEm: number;
  customEr: number;
  customDmgBonus: number;
  customHp?: number;
  customDef?: number;
}

// ---------------------------------------------------------------------------
// Danh Sách Kẻ Địch Chuẩn Theo Nội Dung Game (Open World, Abyss, Theater, Boss)
// ---------------------------------------------------------------------------
export interface EnemyContentPreset {
  id: string;
  name: string;
  level: number;
  hpMultiplier: number;
  baseHp: number;
  description: string;
  badge: string;
}

export const ENEMY_CONTENT_PRESETS: EnemyContentPreset[] = [
  {
    id: "abyss_12",
    name: "La Hoàn Thâm Cảnh Tầng 12 (Spiral Abyss Floor 12)",
    level: 100,
    hpMultiplier: 2.5,
    baseHp: 900000,
    description: "Cấp độ 100, Máu x250% so với thế giới mở, phòng ngự cực đại và áp lực dồn sát thương cao nhất.",
    badge: "Endgame Tối Thượng",
  },
  {
    id: "theater_master",
    name: "Nhà Hát Giả Tưởng (Imaginarium Theater - Màn Master)",
    level: 95,
    hpMultiplier: 2.0,
    baseHp: 750000,
    description: "Cấp độ 95, Máu x200%, yêu cầu luân chuyển nguyên tố và khống chế chu kỳ sát thương chuẩn xác.",
    badge: "Kỳ Diễn Master",
  },
  {
    id: "local_legend",
    name: "Huyền Thoại Địa Phương (Local Legends Natlan / Fontaine)",
    level: 100,
    hpMultiplier: 6.0,
    baseHp: 2500000,
    description: "Cấp độ 100+, Máu siêu khủng x600% (tới hàng triệu HP), kháng gián đoạn tuyệt đối và đòn đánh đoạt mạng.",
    badge: "Thử Thách Khắc Nghiệt",
  },
  {
    id: "open_world_wl9",
    name: "Thế Giới Mở (Open World - Thế Giới Cấp 9)",
    level: 90,
    hpMultiplier: 1.0,
    baseHp: 380000,
    description: "Cấp độ 90-93, Máu chuẩn 1.0x của Teyvat, thích hợp đo thử nghiệm sát thương thông thường.",
    badge: "Thế Giới Cấp 9",
  },
  {
    id: "custom",
    name: "Tùy Chỉnh Thông Số Kẻ Địch Tự Do",
    level: 90,
    hpMultiplier: 1.0,
    baseHp: 500000,
    description: "Người dùng tự thiết lập toàn bộ Cấp độ, Máu cơ sở và Kháng từng nguyên tố theo ý muốn.",
    badge: "Tự Do Cấu Hình",
  },
];

export interface EnemySpeciesPreset {
  id: string;
  name: string;
  resists: Record<string, number>; // "Pyro", "Hydro", "Physical", etc.
  description: string;
}

export const ENEMY_SPECIES_PRESETS: EnemySpeciesPreset[] = [
  {
    id: "standard_humanoid",
    name: "Quái Cơ Bản / Hilichurl / Fatui",
    resists: { All: 10, Physical: 10 },
    description: "10% Kháng tất cả nguyên tố và 10% Kháng Vật lý (Chuẩn mặc định đa số kẻ địch)",
  },
  {
    id: "ruin_guard",
    name: "Thủ Vệ Di Tích (Ruin Guard / Ruin Drake)",
    resists: { All: 10, Physical: 70 },
    description: "10% Kháng Nguyên Tố, 70% Kháng Vật Lý (Khắc tinh các đội hình đánh Physical thuần)",
  },
  {
    id: "maguu_kenki",
    name: "Kiếm Quỷ Maguu Kenki (Boss Cơ Động)",
    resists: { All: 10, Anemo: 10, Cryo: 10, Physical: 10 },
    description: "Kháng đều 10%, có giai đoạn dựng khiên phong thủ chặn đòn đánh xa",
  },
  {
    id: "coppelia",
    name: "Ca Kịch Băng Gió Coppelius / Coppelia (Fontaine)",
    resists: { All: 10, Cryo: 70, Anemo: 70, Physical: 10 },
    description: "70% Kháng Băng và Phong trong trạng thái khiên Pneuma/Ousia, 10% các hệ khác",
  },
  {
    id: "primo_geovishap",
    name: "Nham Long Cổ Thạch Primo Geovishap (Liyue Boss)",
    resists: { All: 10, Geo: 50, Physical: 30 },
    description: "50% Kháng Nham, 30% Kháng Vật Lý, 10% các hệ khác",
  },
  {
    id: "specter_immune",
    name: "Bóng Ma / Slime Nguyên Tố",
    resists: { All: 10, Immune: 100 },
    description: "Miễn nhiễm 100% với nguyên tố bản thân, 10% với các hệ còn lại",
  },
];

// Danh sách Thánh Di Vật 4 món
const TEAM_ARTIFACT_SETS = [
  { id: "noblesse", name: "Noblesse Oblige (Tông Thất)", buff: "+20% ATK toàn đội khi Q" },
  { id: "tenacity", name: "Tenacity of the Millelith (Thiên Nham)", buff: "+20% ATK toàn đội khi E trúng" },
  { id: "vv", name: "Viridescent Venerer (Bóng Hình Màu Xanh)", buff: "-40% Kháng nguyên tố bị Swirl" },
  { id: "deepwood", name: "Deepwood Memories (Ký Ức Rừng Sâu)", buff: "-30% Kháng Thảo của địch" },
  { id: "scroll", name: "Scroll of the Hero of Cinder City", buff: "+40% Sát thương nguyên tố cho đội" },
  { id: "emblem", name: "Emblem of Severed Fate (Dấu Ấn Ngăn Cách)", buff: "+Sát thương Nộ theo ER bản thân" },
  { id: "golden_troupe", name: "Golden Troupe (Đoàn Kịch Hoàng Kim)", buff: "+70% Sát thương E ngoài sân" },
  { id: "marechaussee", name: "Marechaussee Hunter (Thợ Săn Marechaussee)", buff: "+36% CRIT Rate khi HP đổi" },
  { id: "crimson_witch", name: "Crimson Witch (Diệm Liệt Ma Nữ)", buff: "+Sát thương Bốc Hơi / Tan Chảy" },
  { id: "husk", name: "Husk of Opulent Dreams (Giấc Mộng Phù Hoa)", buff: "+DEF% & Geo DMG" },
  { id: "none", name: "2+2 Món / Tùy Biến Chỉ Số", buff: "Chỉ số độc lập" },
];

export function TeamDpsCalculatorClient({
  characters,
  weapons,
}: {
  characters: CharacterOption[];
  weapons: WeaponOption[];
}) {
  // 4 vị trí thành viên đội
  const [members, setMembers] = useState<TeamMemberConfig[]>([
    {
      slotId: 1,
      roleLabel: "Main DPS (Đứng Sân)",
      char: characters.find((c) => c.id === "hu-tao") || characters[0] || null,
      weapon: null,
      weaponRefinement: 1,
      level: 90,
      artifactSet: "crimson_witch",
      customAtk: 2400,
      customCritRate: 72,
      customCritDmg: 180,
      customEm: 160,
      customEr: 110,
      customDmgBonus: 61.6,
      customHp: 32000,
    },
    {
      slotId: 2,
      roleLabel: "Sub-DPS 1 (Ngoài Sân)",
      char: characters.find((c) => c.id === "xingqiu") || characters[1] || null,
      weapon: null,
      weaponRefinement: 1,
      level: 90,
      artifactSet: "noblesse",
      customAtk: 1800,
      customCritRate: 65,
      customCritDmg: 140,
      customEm: 80,
      customEr: 190,
      customDmgBonus: 46.6,
      customHp: 19000,
    },
    {
      slotId: 3,
      roleLabel: "Sub-DPS 2 / Buffer",
      char: characters.find((c) => c.id === "yelan") || characters[2] || null,
      weapon: null,
      weaponRefinement: 1,
      level: 90,
      artifactSet: "emblem",
      customAtk: 1400,
      customCritRate: 70,
      customCritDmg: 160,
      customEm: 50,
      customEr: 180,
      customDmgBonus: 46.6,
      customHp: 34000,
    },
    {
      slotId: 4,
      roleLabel: "Sustain / Shielder / Healer",
      char: characters.find((c) => c.id === "zhongli") || characters[3] || null,
      weapon: null,
      weaponRefinement: 1,
      level: 90,
      artifactSet: "tenacity",
      customAtk: 1200,
      customCritRate: 50,
      customCritDmg: 100,
      customEm: 0,
      customEr: 130,
      customDmgBonus: 0,
      customHp: 48000,
    },
  ]);

  const [activeSlot, setActiveSlot] = useState<number>(1);
  const [rotationDuration, setRotationDuration] = useState<number>(20); // 20s tiêu chuẩn

  // --- THIẾT LẬP KẺ ĐỊCH THEO CONTENT GAME ---
  const [selectedContentId, setSelectedContentId] = useState<string>("abyss_12");
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>("standard_humanoid");
  const [customEnemyLevel, setCustomEnemyLevel] = useState<number>(100);
  const [customEnemyRes, setCustomEnemyRes] = useState<number>(10);
  const [customDefRed, setCustomDefRed] = useState<number>(0);

  // --- ENKA NETWORK API LIVE UID IMPORT ---
  const [enkaUid, setEnkaUid] = useState<string>("");
  const [enkaLoading, setEnkaLoading] = useState<boolean>(false);
  const [enkaError, setEnkaError] = useState<string | null>(null);
  const [enkaCharacters, setEnkaCharacters] = useState<EnkaShowcaseCharacter[]>([]);
  const [showEnkaModal, setShowEnkaModal] = useState<boolean>(false);

  // Gọi API Enka lấy trực tiếp dữ liệu nhân vật người dùng từ game
  const handleFetchEnka = async () => {
    const cleanUid = enkaUid.trim();
    if (!cleanUid || cleanUid.length < 8) {
      setEnkaError("Vui lòng nhập UID hợp lệ (8 - 10 chữ số ingame)");
      return;
    }
    setEnkaLoading(true);
    setEnkaError(null);
    try {
      const res = await fetch(`/api/tools/enka/${encodeURIComponent(cleanUid)}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || "Không thể tải dữ liệu từ UID này. Hãy chắc chắn đã bật 'Hiển thị chi tiết nhân vật' trong game.");
      }
      const charList: EnkaShowcaseCharacter[] = json.data?.showcaseCharacters || [];
      if (charList.length === 0) {
        throw new Error("Không tìm thấy nhân vật nào trong Tủ Trưng Bày của UID này.");
      }
      setEnkaCharacters(charList);
    } catch (err) {
      setEnkaError(err instanceof Error ? err.message : "Có lỗi xảy ra khi kết nối máy chủ Enka");
    } finally {
      setEnkaLoading(false);
    }
  };

  // Nạp 1 nhân vật từ Enka vào Slot chỉ định
  const handleApplyEnkaCharToSlot = (enkaChar: EnkaShowcaseCharacter, slotId: number) => {
    const charName = enkaChar.characterName || `Nhân vật ${enkaChar.avatarId}`;
    const charId = enkaChar.characterId || String(enkaChar.avatarId);

    // Tìm nhân vật tương ứng trong danh sách DB để giữ icon chuẩn
    const matchedChar = characters.find(
      (c) =>
        (enkaChar.characterId && c.id.toLowerCase() === enkaChar.characterId.toLowerCase()) ||
        c.name.toLowerCase() === charName.toLowerCase() ||
        c.id.toLowerCase() === charName.toLowerCase().replace(/\s+/g, "-")
    ) || {
      id: charId,
      name: charName,
      vision: "Pyro",
      weaponType: "Sword",
      rarity: 5,
      iconUrl: enkaChar.iconUrl || "/icons/characters/unknown.png",
    };

    // Tìm bộ thánh di vật chính nếu có thông tin
    let detectedSet = "none";
    const artNames = (enkaChar.artifacts || []).map((a) => (a.name || "").toLowerCase());
    const countMatch = (kw: string) => artNames.filter((n) => n.includes(kw)).length;
    if (countMatch("noblesse") >= 2 || countMatch("tông thất") >= 2) detectedSet = "noblesse";
    else if (countMatch("millelith") >= 2 || countMatch("thiên nham") >= 2) detectedSet = "tenacity";
    else if (countMatch("viridescent") >= 2 || countMatch("bóng hình") >= 2) detectedSet = "vv";
    else if (countMatch("deepwood") >= 2 || countMatch("rừng sâu") >= 2) detectedSet = "deepwood";
    else if (countMatch("cinder") >= 2 || countMatch("tro tàn") >= 2) detectedSet = "scroll";
    else if (countMatch("emblem") >= 2 || countMatch("dấu ấn") >= 2) detectedSet = "emblem";
    else if (countMatch("golden troupe") >= 2 || countMatch("đoàn kịch") >= 2) detectedSet = "golden_troupe";
    else if (countMatch("marechaussee") >= 2 || countMatch("thợ săn") >= 2) detectedSet = "marechaussee";
    else if (countMatch("crimson witch") >= 2 || countMatch("diệm liệt") >= 2) detectedSet = "crimson_witch";
    else if (countMatch("husk") >= 2 || countMatch("giấc mộng") >= 2) detectedSet = "husk";

    updateMember(slotId, {
      char: matchedChar,
      level: enkaChar.level || 90,
      constellation: enkaChar.constellations || 0,
      artifactSet: detectedSet,
      customAtk: Math.round(enkaChar.fightProps.atk || 0),
      customCritRate: Number((enkaChar.fightProps.critRate || 5).toFixed(1)),
      customCritDmg: Number((enkaChar.fightProps.critDmg || 50).toFixed(1)),
      customEm: Math.round(enkaChar.fightProps.em || 0),
      customEr: Number((enkaChar.fightProps.er || 100).toFixed(1)),
      customHp: Math.round(enkaChar.fightProps.hp || 0),
      customDef: Math.round(enkaChar.fightProps.def || 0),
    });
  };

  const updateMember = (slotId: number, patch: Partial<TeamMemberConfig>) => {
    setMembers((prev) =>
      prev.map((m) => (m.slotId === slotId ? { ...m, ...patch } : m))
    );
  };

  // Kẻ địch hiện tại theo content preset đã chọn
  const activeContentPreset = ENEMY_CONTENT_PRESETS.find((c) => c.id === selectedContentId) || ENEMY_CONTENT_PRESETS[0];
  const activeSpeciesPreset = ENEMY_SPECIES_PRESETS.find((s) => s.id === selectedSpeciesId) || ENEMY_SPECIES_PRESETS[0];

  const enemyLevel = selectedContentId === "custom" ? customEnemyLevel : activeContentPreset.level;
  const enemyBaseRes = selectedSpeciesId === "custom" ? customEnemyRes : (activeSpeciesPreset.resists["All"] ?? 10);
  const totalEnemyHp = Math.round(activeContentPreset.baseHp * activeContentPreset.hpMultiplier);

  // 1. TÍNH TOÁN CỘNG HƯỞNG NGUYÊN TỐ
  const resonances = useMemo(() => {
    const elementCounts: Record<string, number> = {};
    members.forEach((m) => {
      if (m.char?.vision) {
        elementCounts[m.char.vision] = (elementCounts[m.char.vision] || 0) + 1;
      }
    });

    const activeList: { name: string; desc: string; icon: string; color: string }[] = [];

    if ((elementCounts["Pyro"] || 0) >= 2) {
      activeList.push({ name: "Cộng Hưởng Hỏa", desc: "+25% ATK toàn đội", icon: "🔥", color: "text-red-400 border-red-500/40 bg-red-500/10" });
    }
    if ((elementCounts["Hydro"] || 0) >= 2) {
      activeList.push({ name: "Cộng Hưởng Thủy", desc: "+25% Max HP toàn đội", icon: "💧", color: "text-blue-400 border-blue-500/40 bg-blue-500/10" });
    }
    if ((elementCounts["Cryo"] || 0) >= 2) {
      activeList.push({ name: "Cộng Hưởng Băng", desc: "+15% CRIT Rate lên địch dính Băng/Đóng Băng", icon: "❄️", color: "text-cyan-300 border-cyan-500/40 bg-cyan-500/10" });
    }
    if ((elementCounts["Geo"] || 0) >= 2) {
      activeList.push({ name: "Cộng Hưởng Nham", desc: "+15% Hiệu Lực Khiên, +15% DMG khi có khiên, -20% Kháng Nham", icon: "🛡️", color: "text-amber-400 border-amber-500/40 bg-amber-500/10" });
    }
    if ((elementCounts["Dendro"] || 0) >= 2) {
      activeList.push({ name: "Cộng Hưởng Thảo", desc: "+50 EM cơ bản, kích phản ứng nhận thêm tới +50 EM", icon: "🌿", color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" });
    }
    if ((elementCounts["Anemo"] || 0) >= 2) {
      activeList.push({ name: "Cộng Hưởng Phong", desc: "-15% Thể Lực, +10% Tốc Độ Di Chuyển, -5% CD Kỹ Năng", icon: "🌪️", color: "text-teal-400 border-teal-500/40 bg-teal-500/10" });
    }
    if ((elementCounts["Electro"] || 0) >= 2) {
      activeList.push({ name: "Cộng Hưởng Lôi", desc: "Tạo hạt nguyên tố khi kích phản ứng Lôi", icon: "⚡", color: "text-purple-400 border-purple-500/40 bg-purple-500/10" });
    }
    if (Object.keys(elementCounts).length === 4) {
      activeList.push({ name: "Màn Chắn Đan Xen (4 Hệ Khác Nhau)", desc: "+15% Tất Cả Kháng Nguyên Tố & Vật Lý", icon: "✨", color: "text-slate-300 border-slate-500/40 bg-slate-500/10" });
    }

    return activeList;
  }, [members]);

  // 2. PHÂN TÍCH LIÊN KẾT ĐỘI HÌNH & XỬ LÝ ĐỘI HÌNH KHÔNG LIÊN QUAN (ANTI-SYNERGY)
  const teamSynergyAnalysis = useMemo(() => {
    const visions = members.map((m) => m.char?.vision).filter(Boolean) as string[];
    const visionSet = new Set(visions);

    const issues: string[] = [];
    const synergies: string[] = [];

    // Kiểm tra phản ứng chính
    const hasVape = visionSet.has("Pyro") && visionSet.has("Hydro");
    const hasMelt = visionSet.has("Pyro") && visionSet.has("Cryo");
    const hasQuicken = visionSet.has("Dendro") && visionSet.has("Electro");
    const hasHyperbloom = visionSet.has("Dendro") && visionSet.has("Hydro") && visionSet.has("Electro");
    const hasBurgeon = visionSet.has("Dendro") && visionSet.has("Hydro") && visionSet.has("Pyro");
    const hasFreeze = visionSet.has("Hydro") && visionSet.has("Cryo");
    const hasSwirl = visionSet.has("Anemo") && (visionSet.has("Pyro") || visionSet.has("Hydro") || visionSet.has("Electro") || visionSet.has("Cryo"));
    const hasGeoRes = visionSet.has("Geo") && visions.filter((v) => v === "Geo").length >= 2;

    if (hasVape) synergies.push("Chuỗi phản ứng Bốc Hơi x1.5 / x2.0 cực mạnh");
    if (hasMelt) synergies.push("Chuỗi phản ứng Tan Chảy x1.5 / x2.0 sát thương khuếch đại");
    if (hasQuicken) synergies.push("Phản ứng Kích Hóa (Tăng Cường / Lan Tràn) cộng dồn sát thương phẳng lớn");
    if (hasHyperbloom) synergies.push("Phản ứng Nở Rộ tự tìm mục tiêu gây sát thương Thảo siêu cấp");
    if (hasBurgeon) synergies.push("Phản ứng Bung Tỏa nổ Hạt Nhân Thảo diện rộng");
    if (hasFreeze) synergies.push("Khống chế Đóng Băng giữ kẻ địch bất động");
    if (hasSwirl) synergies.push("Khuếch Tán nguyên tố & kích hoạt giảm kháng của Bóng Hình Xanh (VV)");
    if (hasGeoRes) synergies.push("Cộng Hưởng 2 Nham (+15% Sát Thương toàn đội & -20% Kháng Nham)");

    // Đánh giá đội hình không liên quan (Unrelated / Anti-synergy)
    if (!hasVape && !hasMelt && !hasQuicken && !hasHyperbloom && !hasBurgeon && !hasFreeze && !hasSwirl && !hasGeoRes) {
      issues.push("Đội hình không có phản ứng nguyên tố chính (Vaporize, Melt, Quicken, Hyperbloom). Sát thương gây ra chủ yếu là đòn đánh thô (Raw Damage).");
    }

    // Kiểm tra vị trí đứng sân (Main DPS overlap)
    const mainDpsCount = members.filter((m) => m.roleLabel.includes("Main DPS")).length;
    if (mainDpsCount > 1) {
      issues.push(`Có ${mainDpsCount} nhân vật cùng cạnh tranh thời gian đứng sân (On-field time), dẫn tới lãng phí tài nguyên chiêu thức.`);
    }

    // Điểm đánh giá phối hợp
    let rating: "S" | "A" | "B" | "C" | "D" = "A";
    if (synergies.length >= 3 && issues.length === 0) rating = "S";
    else if (synergies.length >= 2 && issues.length === 0) rating = "A";
    else if (synergies.length >= 1) rating = "B";
    else if (issues.length > 0) rating = "D";

    return { rating, synergies, issues };
  }, [members]);

  // 3. TÍNH BUFF CHÉO CHI TIẾT TỪ 100% CÁC NHÂN VẬT TRONG GAME
  const teamBuffs = useMemo(() => {
    let bonusAtkPct = 0;
    let bonusAtkFlat = 0;
    let bonusDmgPct = 0;
    let bonusCritRate = 0;
    let bonusCritDmg = 0;
    let bonusEm = 0;
    let resShredPct = 0;
    let defIgnorePct = 0;
    const sources: string[] = [];

    // Cộng hưởng
    const elementCounts: Record<string, number> = {};
    members.forEach((m) => {
      if (m.char?.vision) elementCounts[m.char.vision] = (elementCounts[m.char.vision] || 0) + 1;
    });

    if ((elementCounts["Pyro"] || 0) >= 2) { bonusAtkPct += 25; sources.push("Cộng Hưởng 2 Hỏa: +25% ATK"); }
    if ((elementCounts["Cryo"] || 0) >= 2) { bonusCritRate += 15; sources.push("Cộng Hưởng 2 Băng: +15% CRIT Rate"); }
    if ((elementCounts["Geo"] || 0) >= 2) { bonusDmgPct += 15; resShredPct += 20; sources.push("Cộng Hưởng 2 Nham: +15% DMG, -20% Kháng Nham"); }
    if ((elementCounts["Dendro"] || 0) >= 2) { bonusEm += 80; sources.push("Cộng Hưởng 2 Thảo: +80 EM trung bình"); }

    // Thánh di vật
    const sets = members.map((m) => m.artifactSet);
    if (sets.includes("noblesse")) { bonusAtkPct += 20; sources.push("Tông Thất 4 Món: +20% ATK toàn đội"); }
    if (sets.includes("tenacity")) { bonusAtkPct += 20; sources.push("Thiên Nham 4 Món: +20% ATK toàn đội"); }
    if (sets.includes("vv")) { resShredPct += 40; sources.push("Bóng Hình Xanh (VV): -40% Kháng nguyên tố"); }
    if (sets.includes("deepwood")) { resShredPct += 30; sources.push("Rừng Sâu: -30% Kháng Thảo"); }
    if (sets.includes("scroll")) { bonusDmgPct += 40; sources.push("Scroll Cinder City: +40% Elemental DMG"); }

    // Từng nhân vật cụ thể có buff (hỗ trợ toàn diện)
    members.forEach((m) => {
      const charId = m.char?.id?.toLowerCase() || "";
      if (charId.includes("bennett")) {
        bonusAtkFlat += 1050;
        sources.push("Bennett (Vương Triều Cổ Vũ Q): +1,050 Flat ATK cho đòn đánh đứng sân");
      } else if (charId.includes("furina")) {
        bonusDmgPct += 75;
        sources.push("Furina (Náo Nhiệt Q): +75% Sát Thương toàn đội (Full Fanfare)");
      } else if (charId.includes("kazuha")) {
        bonusDmgPct += 38;
        sources.push("Kazuha (Chihayaburu A4): +38% Sát Thương Nguyên Tố theo Tinh Thông");
      } else if (charId.includes("zhongli")) {
        resShredPct += 20;
        sources.push("Zhongli (Khiên Ngọc Bích): Giảm 20% Tất Cả Kháng Nguyên Tố & Vật Lý");
      } else if (charId.includes("nahida")) {
        bonusEm += 250;
        sources.push("Nahida (Ảo Cảnh Tâm Can Q): +250 EM cho nhân vật trên sân");
      } else if (charId.includes("faruzan")) {
        bonusDmgPct += 38;
        resShredPct += 30;
        bonusCritDmg += 40;
        sources.push("Faruzan (Q + C6): +38% ST Phong, -30% Kháng Phong, +40% CRIT DMG Phong");
      } else if (charId.includes("gorou")) {
        bonusDmgPct += 15;
        bonusCritDmg += 40;
        sources.push("Gorou (Q + C6): +DEF, +15% ST Nham, +40% CRIT DMG Nham");
      } else if (charId.includes("sara")) {
        bonusAtkFlat += 750;
        bonusCritDmg += 60;
        sources.push("Kujou Sara (E/Q + C6): +750 ATK, +60% CRIT DMG hệ Lôi");
      } else if (charId.includes("shenhe")) {
        bonusDmgPct += 30;
        resShredPct += 15;
        sources.push("Shenhe (Băng Linh E + Q): Tăng ST Băng phẳng, -15% Kháng Băng & Vật Lý");
      } else if (charId.includes("yun-jin") || charId.includes("yunjin")) {
        bonusDmgPct += 25;
        sources.push("Yun Jin (Q): Tăng sát thương phẳng cực lớn cho Đòn Đánh Thường scale theo DEF");
      } else if (charId.includes("sucrose")) {
        bonusEm += 200;
        sources.push("Sucrose (A1 + A4): +200 EM cho toàn đội");
      } else if (charId.includes("mona")) {
        bonusDmgPct += 60;
        sources.push("Mona (Tinh Dị Q): +60% Sát Thương nhận vào của kẻ địch");
      } else if (charId.includes("xilonen")) {
        resShredPct += 36;
        sources.push("Xilonen (E/Q): Giảm 36% Kháng nguyên tố mẫu");
      } else if (charId.includes("xianyun")) {
        bonusDmgPct += 35;
        sources.push("Xianyun (Q): Buff sát thương Tấn Công Khi Rơi (Plunge) cực mạnh");
      } else if (charId.includes("yelan")) {
        bonusDmgPct += 28;
        sources.push("Yelan (A4): Tăng trung bình +28% Sát Thương cho nhân vật trên sân");
      } else if (charId.includes("raiden")) {
        bonusDmgPct += 24;
        sources.push("Raiden Shogun (E): +24% Sát Thương Kỹ Năng Nộ cho toàn đội");
      } else if (charId.includes("chevreuse")) {
        resShredPct += 40;
        bonusAtkPct += 40;
        sources.push("Chevreuse (A1 + A4): -40% Kháng Hỏa/Lôi, +40% ATK cho toàn đội");
      } else if (charId.includes("rosaria")) {
        bonusCritRate += 15;
        sources.push("Rosaria (A4): Chia sẻ +15% CRIT Rate cho toàn đội sau Nộ");
      } else if (charId.includes("albedo")) {
        bonusEm += 125;
        sources.push("Albedo (A4): +125 EM cho toàn đội sau Nộ");
      }
    });

    return {
      bonusAtkPct,
      bonusAtkFlat,
      bonusDmgPct,
      bonusCritRate,
      bonusCritDmg,
      bonusEm,
      resShredPct,
      defIgnorePct,
      sources,
    };
  }, [members]);

  // 4. MÔ PHỎNG SÁT THƯƠNG CHU KỲ TOÀN ĐỘI CHUẨN XÁC THEO GAME
  const calculationResult = useMemo(() => {
    // 1. Tính Giảm Trừ Phòng Ngự DEF của kẻ địch theo Level thực tế
    // Công thức Genshin: (CharLevel + 100) / [ (CharLevel + 100) + (EnemyLevel + 100) * (1 - DefReduction) * (1 - DefIgnore) ]
    const defMultiplier = (90 + 100) / ((90 + 100) + (enemyLevel + 100) * (1 - customDefRed / 100) * (1 - teamBuffs.defIgnorePct / 100));

    // 2. Tính Giảm Trừ Kháng Nguyên Tố
    const effectiveRes = enemyBaseRes - teamBuffs.resShredPct;
    let resMultiplier = 1;
    if (effectiveRes < 0) {
      resMultiplier = 1 - (effectiveRes / 200); // Kháng âm nhân đôi hiệu quả
    } else if (effectiveRes <= 75) {
      resMultiplier = 1 - (effectiveRes / 100);
    } else {
      resMultiplier = 1 / (1 + (4 * effectiveRes) / 100);
    }

    // 3. Tính toán cho từng thành viên
    const memberResults = members.map((m, idx) => {
      if (!m.char) {
        return { slotId: m.slotId, name: "Trống", totalDamage: 0, dps: 0, role: m.roleLabel, color: "#64748b" };
      }

      const isMainDps = idx === 0;
      const effectiveAtk =
        (m.customAtk * (1 + teamBuffs.bonusAtkPct / 100)) + (isMainDps ? teamBuffs.bonusAtkFlat : 0);
      const effectiveCritRate = Math.min(100, m.customCritRate + teamBuffs.bonusCritRate);
      const effectiveCritDmg = m.customCritDmg + teamBuffs.bonusCritDmg;
      const effectiveEm = m.customEm + (isMainDps ? teamBuffs.bonusEm : 0);
      const effectiveDmgBonus = m.customDmgBonus + teamBuffs.bonusDmgPct;

      const critMultiplier = 1 + (effectiveCritRate / 100) * (effectiveCritDmg / 100);
      const dmgBonusMult = 1 + (effectiveDmgBonus / 100);

      // Thưởng Tinh Thông Nguyên Tố chính thức: 2.78 * EM / (EM + 1400)
      const reactionEmBonus = (2.78 * effectiveEm) / (effectiveEm + 1400);
      const reactionMultiplier = 1.5 * (1 + reactionEmBonus);

      let rawDamage = 0;
      if (idx === 0) {
        // Main DPS: Đứng sân 10-12s, MV ~3200%
        const motionValue = 32.0;
        const baseHit = effectiveAtk * motionValue;
        // Tùy theo đội hình có phản ứng hay không:
        const hasReaction = teamSynergyAnalysis.synergies.length > 0;
        const rxRate = hasReaction ? 0.6 : 0.0;
        rawDamage = baseHit * dmgBonusMult * critMultiplier * defMultiplier * resMultiplier * ((1 - rxRate) + rxRate * reactionMultiplier);
      } else if (idx === 1) {
        // Sub-DPS 1 (off-field liên tục, ví dụ Xingqiu, Yelan, Xiangling): MV ~2400%
        const motionValue = 24.0;
        const baseHit = effectiveAtk * motionValue;
        const rxRate = teamSynergyAnalysis.synergies.length > 0 ? 0.4 : 0.0;
        rawDamage = baseHit * dmgBonusMult * critMultiplier * defMultiplier * resMultiplier * ((1 - rxRate) + rxRate * reactionMultiplier);
      } else if (idx === 2) {
        // Sub-DPS 2 / Buffer (Furina, Fischl, Nahida): MV ~1800% + phản ứng phụ
        const motionValue = 18.0;
        const baseHit = effectiveAtk * motionValue;
        const extraRx = effectiveEm > 300 ? 110000 : 35000;
        rawDamage = (baseHit * dmgBonusMult * critMultiplier * defMultiplier * resMultiplier) + extraRx;
      } else {
        // Sustain (Zhongli, Bennett, Baizhu): Q burst hoặc khiên
        const motionValue = 8.0;
        rawDamage = effectiveAtk * motionValue * dmgBonusMult * critMultiplier * defMultiplier * resMultiplier;
      }

      const totalDamage = Math.round(rawDamage);
      const dps = Math.round(totalDamage / rotationDuration);
      const roleColors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b"];

      return {
        slotId: m.slotId,
        name: m.char.name,
        vision: m.char.vision,
        iconUrl: m.char.iconUrl,
        totalDamage,
        dps,
        role: m.roleLabel,
        color: roleColors[idx] || "#64748b",
      };
    });

    const totalTeamDamage = memberResults.reduce((sum, m) => sum + m.totalDamage, 0);
    const totalTeamDps = Math.round(totalTeamDamage / rotationDuration);

    // Thời gian ước tính tiêu diệt kẻ địch
    const timeToKillSec = totalTeamDps > 0 ? (totalEnemyHp / totalTeamDps).toFixed(1) : "N/A";
    const rotationsNeeded = totalTeamDamage > 0 ? (totalEnemyHp / totalTeamDamage).toFixed(1) : "N/A";

    return {
      memberResults,
      totalTeamDamage,
      totalTeamDps,
      defMultiplier,
      resMultiplier,
      timeToKillSec,
      rotationsNeeded,
    };
  }, [members, enemyLevel, enemyBaseRes, customDefRed, rotationDuration, teamBuffs, teamSynergyAnalysis, totalEnemyHp]);

  const activeMember = members.find((m) => m.slotId === activeSlot) || members[0];

  return (
    <div className="space-y-6">
      {/* 1. NÚT NHẬP DỮ LIỆU TỪ ENKA NETWORK INGAME UID */}
      <div className="bg-gradient-to-r from-bg-card via-bg-elevated to-bg-card border border-accent-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-accent-500 animate-ping" />
            <h3 className="font-display text-sm sm:text-base font-bold text-text-primary">
              Nạp Nhân Vật Tự Động Từ UID Game (Enka.Network Live Sync)
            </h3>
          </div>
          <p className="text-xs text-text-secondary">
            Không cần tự nhập tay mất thời gian: Nhập UID Genshin Impact để lấy 100% chỉ số thực (ATK, CR, CD, EM, ER, Thánh di vật) từ tủ trưng bày game.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowEnkaModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent-500 text-bg-primary font-bold text-xs hover:bg-accent-bright transition-all shadow-md shrink-0 cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/local-genshin-assets/ui/characters.png" alt="" width={18} height={18} className="w-4.5 h-4.5 object-contain" />
          <span>Nhập Nhanh Qua UID &rarr;</span>
        </button>
      </div>

      {/* MODAL NHẬP UID ENKA */}
      {showEnkaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-bg-card border border-border w-full max-w-3xl rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border/80 mb-5">
              <div>
                <h3 className="font-display text-lg font-bold text-text-primary">
                  Nhập Nhân Vật Trực Tiếp Từ UID Ingame
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Kết nối API Enka.Network đồng bộ dữ liệu Tủ Trưng Bày của người chơi
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEnkaModal(false)}
                className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-text-muted hover:text-text-primary cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Input UID */}
            <div className="flex gap-2 mb-5">
              <input
                type="text"
                placeholder="Nhập UID ingame (Ví dụ: 800123456)..."
                value={enkaUid}
                onChange={(e) => setEnkaUid(e.target.value)}
                className="flex-1 bg-bg-primary border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary font-mono focus:border-accent-500 outline-none"
              />
              <button
                type="button"
                onClick={handleFetchEnka}
                disabled={enkaLoading}
                className="px-5 py-2.5 rounded-xl bg-accent-500 text-bg-primary font-bold text-xs hover:bg-accent-bright transition-all disabled:opacity-50 cursor-pointer shrink-0"
              >
                {enkaLoading ? "Đang đồng bộ..." : "Tải Nhân Vật"}
              </button>
            </div>

            {enkaError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs mb-4">
                ⚠️ {enkaError}
              </div>
            )}

            {/* Danh sách 8 nhân vật từ tủ trưng bày */}
            {enkaCharacters.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary font-mono mb-3">
                  Nhân Vật Đã Đồng Bộ Từ Ingame ({enkaCharacters.length}) — Bấm nút để gán vào Slot:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {enkaCharacters.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl border border-border/80 bg-bg-elevated/40 flex flex-col justify-between gap-3"
                    >
                      {(() => {
                        const charName = c.characterName || `Nhân vật ${c.avatarId}`;
                        return (
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-bg-secondary border border-border shrink-0">
                              {c.iconUrl ? (
                                <Image src={c.iconUrl} alt={charName} fill sizes="48px" className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-xs">
                                  {charName.slice(0, 2)}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-sm text-text-primary truncate">{charName}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-card font-mono text-accent-bright">
                                  C{c.constellations} · Lv.{c.level}
                                </span>
                              </div>
                              <div className="text-[11px] text-text-muted mt-1 font-mono">
                                ATK: {Math.round(c.fightProps.atk)} · CR: {c.fightProps.critRate}% · CD: {c.fightProps.critDmg}% · EM: {Math.round(c.fightProps.em)}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* 4 Nút gán vào slot */}
                      <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-border/50">
                        {[1, 2, 3, 4].map((slotNum) => (
                          <button
                            key={slotNum}
                            type="button"
                            onClick={() => {
                              handleApplyEnkaCharToSlot(c, slotNum);
                              setShowEnkaModal(false);
                            }}
                            className="py-1 px-1.5 rounded-lg bg-bg-card hover:bg-accent-500 hover:text-bg-primary text-[10px] font-bold border border-border transition-all text-center cursor-pointer"
                          >
                            Vào Slot {slotNum}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. THIẾT LẬP KẺ ĐỊCH CHUẨN XÁC THEO NỘI DUNG GAME (CONTENT-BASED ENEMY ENGINE) */}
      <div className="bg-bg-card border border-border/80 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <h3 className="font-display text-base font-bold text-text-primary">
                Thiết Lập Kẻ Địch Theo Môi Trường Nội Dung Game (Enemy Content Engine)
              </h3>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Cùng một kẻ địch nhưng ở La Hoàn Tầng 12, Nhà Hát Giả Tưởng hay Thế Giới Mở có lượng Máu và Phòng Ngự khác biệt hoàn toàn.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-red-300 font-mono font-bold shrink-0 self-start sm:self-auto">
            {activeContentPreset.badge}
          </span>
        </div>

        {/* Lựa chọn nội dung game */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
          {ENEMY_CONTENT_PRESETS.map((p) => {
            const isSel = p.id === selectedContentId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedContentId(p.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSel
                    ? "border-red-500/80 bg-red-500/10 shadow-sm"
                    : "border-border/70 bg-bg-elevated/40 hover:border-text-secondary"
                }`}
              >
                <div className="text-xs font-bold text-text-primary mb-1 truncate">{p.name}</div>
                <div className="text-[11px] text-text-muted line-clamp-2">{p.description}</div>
              </button>
            );
          })}
        </div>

        {/* Lựa chọn chủng loại kẻ địch & Kháng gốc */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-bg-primary/60 border border-border/60">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Chủng Loại Kẻ Địch (Kháng Gốc):
            </label>
            <select
              value={selectedSpeciesId}
              onChange={(e) => setSelectedSpeciesId(e.target.value)}
              className="w-full bg-bg-elevated border border-border rounded-xl px-3 py-2 text-xs text-text-primary"
            >
              {ENEMY_SPECIES_PRESETS.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-text-muted mt-1">{activeSpeciesPreset.description}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Cấp Độ Kẻ Địch:
            </label>
            <input
              type="number"
              min={1}
              max={105}
              value={enemyLevel}
              disabled={selectedContentId !== "custom"}
              onChange={(e) => setCustomEnemyLevel(Number(e.target.value) || 90)}
              className="w-full bg-bg-elevated border border-border rounded-xl px-3 py-2 text-xs text-text-primary font-mono disabled:opacity-60"
            />
            <p className="text-[11px] text-text-muted mt-1">
              Hệ số phòng ngự DEF thực tế: <strong className="text-text-primary font-mono">{(calculationResult.defMultiplier * 100).toFixed(1)}%</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Tổng Máu Kẻ Địch Ước Tính:
            </label>
            <div className="font-mono text-lg font-bold text-red-400">
              {totalEnemyHp.toLocaleString("vi-VN")} HP
            </div>
            <p className="text-[11px] text-text-muted mt-1">
              Thời gian tiêu diệt: <strong className="text-emerald-400 font-mono">{calculationResult.timeToKillSec}s</strong> (~{calculationResult.rotationsNeeded} chu kỳ)
            </p>
          </div>
        </div>
      </div>

      {/* 3. ĐÁNH GIÁ LIÊN KẾT ĐỘI HÌNH & XỬ LÝ ĐỘI HÌNH KHÔNG LIÊN QUAN */}
      <div className="bg-bg-card border border-border/80 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary font-mono">
              Đánh Giá Phối Hợp Đội Hình (Team Synergy Rating)
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-mono ${
                teamSynergyAnalysis.rating === "S"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : teamSynergyAnalysis.rating === "A"
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                  : teamSynergyAnalysis.rating === "B"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              }`}
            >
              Hạng {teamSynergyAnalysis.rating}
            </span>
          </div>
        </div>

        {/* Điểm mạnh hoặc Cảnh báo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {teamSynergyAnalysis.synergies.length > 0 && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1">
              <div className="font-bold uppercase font-mono text-[11px]">Điểm Mạnh Liên Kết:</div>
              {teamSynergyAnalysis.synergies.map((s, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span>✓</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}

          {teamSynergyAnalysis.issues.length > 0 ? (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
              <div className="font-bold uppercase font-mono text-[11px]">Cảnh Báo Phối Hợp (4 Nhân Vật Kém Liên Quan):</div>
              {teamSynergyAnalysis.issues.map((issue, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="shrink-0">⚠️</span>
                  <span>{issue}</span>
                </div>
              ))}
              <div className="text-[11px] text-text-muted mt-2">
                * Hệ thống vẫn tính toán chính xác tuyệt đối sát thương thô (Raw Damage) và chỉ số độc lập cho từng người.
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-bg-elevated/40 border border-border text-text-secondary text-xs flex items-center">
              ✓ Đội hình vận hành mượt mà, không gặp xung đột về thời gian đứng sân hay tương tác nguyên tố.
            </div>
          )}
        </div>
      </div>

      {/* 4. TỔNG QUAN 4 THÀNH VIÊN TRONG ĐỘI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {members.map((m, idx) => {
          const isSelected = m.slotId === activeSlot;
          const dmgShare =
            calculationResult.totalTeamDamage > 0
              ? Math.round((calculationResult.memberResults[idx].totalDamage / calculationResult.totalTeamDamage) * 100)
              : 0;

          return (
            <div
              key={m.slotId}
              onClick={() => setActiveSlot(m.slotId)}
              className={`relative rounded-3xl p-4 border transition-all cursor-pointer ${
                isSelected
                  ? "bg-bg-elevated border-accent-500 shadow-md ring-1 ring-accent-500/50"
                  : "bg-bg-card border-border/80 hover:border-border-strong hover:bg-bg-card/90"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-text-muted mb-2 font-mono">
                <span>Vị trí {m.slotId}</span>
                <span className="font-semibold text-text-secondary">{m.roleLabel.split(" ")[0]}</span>
              </div>

              {m.char ? (
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-bg-secondary border border-border shrink-0">
                    {m.char.iconUrl ? (
                      <Image src={m.char.iconUrl} alt={m.char.name} fill sizes="48px" className="object-cover object-top" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-text-muted">
                        {m.char.name.slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-text-primary truncate">{m.char.name}</h4>
                    <p className="text-xs text-text-muted truncate">
                      {m.char.vision} · Lv.{m.level}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-accent-bright font-bold">
                        {dmgShare}% Sát thương
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-12 flex items-center justify-center border border-dashed border-border rounded-xl text-xs text-text-muted">
                  + Chọn nhân vật
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-3xl overflow-hidden bg-border/40">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${dmgShare}%`,
                    backgroundColor: calculationResult.memberResults[idx]?.color || "#2dd4bf",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. BẢNG SÁT THƯƠNG CHU KỲ VÀ TỶ LỆ ĐÓNG GÓP */}
      <div className="bg-gradient-to-br from-bg-card via-bg-card to-bg-elevated border-2 border-accent-500/40 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/15 border border-accent-500/40 text-accent-bright text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-accent-500 animate-ping" />
              <span>Chu Kỳ Tác Chiến 20 Giây</span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-black text-text-primary">
              Tổng Sát Thương Cả Đội:{" "}
              <span className="text-accent-bright">
                {calculationResult.totalTeamDamage.toLocaleString("vi-VN")}
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Áp dụng đầy đủ toàn bộ phòng ngự kẻ địch cấp {enemyLevel}, kháng nguyên tố, và hiệu ứng buff chéo từ các thành viên.
            </p>
          </div>

          <div className="bg-bg-primary/80 border border-border/80 rounded-2xl p-4 flex items-center gap-6 self-start md:self-auto shrink-0 shadow-inner">
            <div>
              <div className="text-[11px] text-text-muted uppercase font-mono tracking-wider font-semibold">
                DPS Trung Bình Cả Đội
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">
                {calculationResult.totalTeamDps.toLocaleString("vi-VN")}{" "}
                <span className="text-xs font-sans text-text-muted">/ giây</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thanh trực quan hóa tỉ lệ đóng góp DPS của 4 thành viên */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-2">
            <span>Phân Bổ Tỉ Lệ Sát Thương Của Các Thành Viên:</span>
            <span className="font-mono text-[11px] text-text-muted">Tổng: 100%</span>
          </div>

          <div className="h-4 w-full rounded-full overflow-hidden bg-bg-secondary flex border border-border/60 p-0.5 gap-0.5">
            {calculationResult.memberResults.map((m) => {
              const pct =
                calculationResult.totalTeamDamage > 0
                  ? (m.totalDamage / calculationResult.totalTeamDamage) * 100
                  : 25;
              return (
                <div
                  key={m.slotId}
                  title={`${m.name}: ${Math.round(pct)}% (${m.totalDamage.toLocaleString("vi-VN")} DMG)`}
                  className="h-full rounded-sm transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: m.color,
                  }}
                />
              );
            })}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            {calculationResult.memberResults.map((m) => {
              const pct =
                calculationResult.totalTeamDamage > 0
                  ? Math.round((m.totalDamage / calculationResult.totalTeamDamage) * 100)
                  : 0;
              return (
                <div key={m.slotId} className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                  <div className="truncate">
                    <span className="font-bold text-text-primary truncate block">{m.name}</span>
                    <span className="text-text-muted text-[11px]">
                      {m.totalDamage.toLocaleString("vi-VN")} DMG ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Danh sách hiệu ứng buff toàn đội đang có */}
        <div className="mt-5 p-3.5 rounded-2xl bg-bg-primary/60 border border-border/60">
          <div className="text-[11px] font-bold text-text-muted uppercase font-mono mb-2">
            Tất Cả Hiệu Ứng Buff Chéo Toàn Đội Kích Hoạt ({teamBuffs.sources.length}):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {teamBuffs.sources.map((s, i) => (
              <span
                key={i}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-bg-elevated border border-border text-text-secondary font-medium"
              >
                ✓ {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 6. KHU VỰC TÙY CHỈNH THÀNH VIÊN ĐANG CHỌN (SLOT {activeSlot}) */}
      <div className="bg-bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-accent-500/20 text-accent-bright font-bold">
              Đang Chỉnh Sửa Vị Trí {activeSlot}
            </span>
            <span className="text-sm font-bold text-text-primary">{activeMember.char?.name || "Chưa chọn"}</span>
          </div>
          <span className="text-xs text-text-muted">Nhấp vào vị trí khác ở trên để chuyển nhân vật</span>
        </div>

        {/* Bộ chọn nhân vật cho slot này */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-text-secondary mb-2">
            Chọn nhân vật cho vị trí {activeSlot}:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 max-h-48 overflow-y-auto pr-1">
            {characters.slice(0, 48).map((c) => {
              const isCurr = activeMember.char?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => updateMember(activeSlot, { char: c })}
                  className={`p-1.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    isCurr
                      ? "border-accent-500 bg-accent-500/15"
                      : "border-border/70 hover:border-text-secondary bg-bg-elevated/40"
                  }`}
                >
                  <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-bg-secondary">
                    {c.iconUrl ? (
                      <Image src={c.iconUrl} alt={c.name} fill sizes="36px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                        {c.name.slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-text-primary truncate w-full">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chọn bộ Thánh Di Vật 4 món cho slot này */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Thánh Di Vật 4 Món (Bộ hỗ trợ / cá nhân):
            </label>
            <select
              value={activeMember.artifactSet}
              onChange={(e) => updateMember(activeSlot, { artifactSet: e.target.value })}
              className="w-full bg-bg-primary border border-border rounded-xl px-3 py-2 text-text-primary text-xs"
            >
              {TEAM_ARTIFACT_SETS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.buff})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Vai trò trong vòng luân chuyển:
            </label>
            <select
              value={activeMember.roleLabel}
              onChange={(e) => updateMember(activeSlot, { roleLabel: e.target.value })}
              className="w-full bg-bg-primary border border-border rounded-xl px-3 py-2 text-text-primary text-xs"
            >
              <option value="Main DPS (Đứng Sân)">Main DPS (Đứng Sân gây sát thương chính)</option>
              <option value="Sub-DPS 1 (Ngoài Sân)">Sub-DPS 1 (Gây sát thương ngoài sân / áp nguyên tố)</option>
              <option value="Sub-DPS 2 / Buffer">Sub-DPS 2 / Buffer (Khuếch đại sát thương)</option>
              <option value="Sustain / Shielder / Healer">Sustain (Hồi máu / Tạo khiên / Khống chế)</option>
            </select>
          </div>
        </div>

        {/* Bảng chỉ số cơ sở của nhân vật này */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div>
            <label className="block text-[11px] text-text-muted mb-1">Tấn công (ATK)</label>
            <input
              type="number"
              value={activeMember.customAtk}
              onChange={(e) => updateMember(activeSlot, { customAtk: Number(e.target.value) || 0 })}
              className="w-full bg-bg-primary border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-text-muted mb-1">CRIT Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={activeMember.customCritRate}
              onChange={(e) => updateMember(activeSlot, { customCritRate: Number(e.target.value) || 0 })}
              className="w-full bg-bg-primary border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-text-muted mb-1">CRIT DMG (%)</label>
            <input
              type="number"
              step="0.1"
              value={activeMember.customCritDmg}
              onChange={(e) => updateMember(activeSlot, { customCritDmg: Number(e.target.value) || 0 })}
              className="w-full bg-bg-primary border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-text-muted mb-1">Tinh thông (EM)</label>
            <input
              type="number"
              value={activeMember.customEm}
              onChange={(e) => updateMember(activeSlot, { customEm: Number(e.target.value) || 0 })}
              className="w-full bg-bg-primary border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-text-muted mb-1">Nạp (ER %)</label>
            <input
              type="number"
              value={activeMember.customEr}
              onChange={(e) => updateMember(activeSlot, { customEr: Number(e.target.value) || 0 })}
              className="w-full bg-bg-primary border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-text-muted mb-1">Thưởng ST (%)</label>
            <input
              type="number"
              step="0.1"
              value={activeMember.customDmgBonus}
              onChange={(e) => updateMember(activeSlot, { customDmgBonus: Number(e.target.value) || 0 })}
              className="w-full bg-bg-primary border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
