"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { CharacterOption, WeaponOption } from "./GearShowdownClient";

export interface TeamMemberConfig {
  slotId: number;
  roleLabel: string;
  char: CharacterOption | null;
  weapon: WeaponOption | null;
  weaponRefinement: number;
  level: number;
  artifactSet: string;
  customAtk: number;
  customCritRate: number;
  customCritDmg: number;
  customEm: number;
  customEr: number;
  customDmgBonus: number;
}

// Danh sách Thánh Di Vật 4 món phổ biến cho đội hình
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

// Mẫu đội hình Meta chuẩn bị sẵn để người dùng bấm 1 phát là nạp toàn bộ
interface MetaTeamTemplate {
  name: string;
  archetype: string;
  charIds: [string, string, string, string];
  reactionMain: string;
  description: string;
  rotationGuide: string;
}

const META_TEAMS: MetaTeamTemplate[] = [
  {
    name: "Hu Tao Double Hydro (Bốc Hơi Cực Hạn)",
    archetype: "Vaporize Hypercarry",
    charIds: ["hu-tao", "xingqiu", "yelan", "zhongli"],
    reactionMain: "Vaporize (Bốc Hơi)",
    description: "Cộng hưởng Thủy +25% HP tối ưu cho cả Hu Tao, Yelan và khiên Zhongli. Sát thương liên tục không góc chết.",
    rotationGuide: "Zhongli Hold E (khiên) → Xingqiu Q E E → Yelan E Q → Hu Tao E + Spam Đòn Trọng Kích (CA) 9 lần → Q kết liễu",
  },
  {
    name: "Raiden National (Raiden Lôi Thần Quốc Dân)",
    archetype: "Overload / Vaporize / Electro-Charged",
    charIds: ["raiden-shogun", "xiangling", "xingqiu", "bennett"],
    reactionMain: "Đa phản ứng Overload + Vaporize",
    description: "Chu kỳ năng lượng tuần hoàn hoàn hảo. Raiden nạp toàn đội, Xiangling Pyronado ăn trọn buff Bennett + Vaporize.",
    rotationGuide: "Raiden E → Xingqiu Q E E → Bennett Q E → Xiangling Q E (chụp snapshot buff Bennett) → Raiden Q chém 7 giây nạp lại toàn đội",
  },
  {
    name: "Alhaitham Quickbloom (Nở Rộ Thần Tốc)",
    archetype: "Quickbloom (Quicken + Hyperbloom)",
    charIds: ["alhaitham", "nahida", "xingqiu", "kuki-shinobu"],
    reactionMain: "Hyperbloom + Spread",
    description: "Kết hợp sát thương Lan Tràn trực tiếp của Alhaitham cùng hạt Hyperbloom 35,000+ DMG mỗi hạt từ Kuki full Tinh Thông.",
    rotationGuide: "Nahida E Q → Xingqiu Q E → Kuki E → Alhaitham Q (chờ nhận Mirror) → Đánh thường/trọng kích duy trì 3 Mirror",
  },
  {
    name: "Neuvillette Hypercarry (Thủy Long Vương)",
    archetype: "Hydro Hypercarry",
    charIds: ["neuvillette", "furina", "kaedehara-kazuha", "baizhu"],
    reactionMain: "Khuếch Tán & Náo Nhiệt",
    description: "Furina buff Náo Nhiệt 75% All DMG, Kazuha giảm 40% kháng Thủy + buff 40% Hydro DMG, Baizhu bảo kê hồi máu.",
    rotationGuide: "Neuvillette E → Furina E Q → Kazuha E Q (Khuếch tán Thủy) → Baizhu E Q → Neuvillette xả 3 đòn trọng kích Hydro Beam",
  },
  {
    name: "Navia Geo Bombardment (Đại Bác Nham)",
    archetype: "Crystallize Burst",
    charIds: ["navia", "zhongli", "bennett", "xiangling"],
    reactionMain: "Cộng hưởng Nham + Hỏa",
    description: "Cộng hưởng 2 Nham (+15% DMG, -20% kháng Nham) + 2 Hỏa (+25% ATK) đẩy sát thương bắn súng hoa hồng của Navia lên cực đại.",
    rotationGuide: "Zhongli Hold E → Navia Q → Bennett Q E → Xiangling Q E → Navia E bắn đạn đầy mảnh → Đánh thường tích đạn → Bắn E lần 2",
  },
  {
    name: "Ayaka Permafrost (Đóng Băng Vĩnh Cửu)",
    archetype: "Freeze Control",
    charIds: ["kamisato-ayaka", "shenhe", "kaedehara-kazuha", "sangonomiya-kokomi"],
    reactionMain: "Frozen (Đóng Băng)",
    description: "Shenhe buff sát thương Băng, Kazuha gom quái giảm kháng, Kokomi đóng băng diện rộng giúp Ayaka tung nộ 20 hit chuẩn xác.",
    rotationGuide: "Shenhe E Q → Kazuha E Q → Kokomi E (áp Thủy) → Ayaka Dash lướt E + Q Cung Băng Kamifubuki",
  },
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
    },
    {
      slotId: 3,
      roleLabel: "Sub-DPS 2 / Buffer",
      char: characters.find((c) => c.id === "yelan") || characters[2] || null,
      weapon: null,
      weaponRefinement: 1,
      level: 90,
      artifactSet: "emblem",
      customAtk: 1500,
      customCritRate: 70,
      customCritDmg: 160,
      customEm: 50,
      customEr: 180,
      customDmgBonus: 46.6,
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
    },
  ]);

  const [activeSlot, setActiveSlot] = useState<number>(1);
  const [enemyLevel, setEnemyLevel] = useState<number>(90);
  const [enemyBaseRes, setEnemyBaseRes] = useState<number>(10);
  const [rotationDuration, setRotationDuration] = useState<number>(20); // 20s tiêu chuẩn La Hoàn

  // Nạp nhanh mẫu đội hình
  const handleApplyTemplate = (tpl: MetaTeamTemplate) => {
    const updated = [...members];
    tpl.charIds.forEach((id, idx) => {
      const match = characters.find((c) => c.id === id || c.id.includes(id));
      if (match && updated[idx]) {
        updated[idx] = {
          ...updated[idx],
          char: match,
        };
      }
    });
    setMembers(updated);
  };

  // Cập nhật thành viên trong slot
  const updateMember = (slotId: number, patch: Partial<TeamMemberConfig>) => {
    setMembers((prev) =>
      prev.map((m) => (m.slotId === slotId ? { ...m, ...patch } : m))
    );
  };

  // 1. TÍNH TOÁN CỘNG HƯỞNG NGUYÊN TỐ (ELEMENTAL RESONANCES)
  const resonances = useMemo(() => {
    const elementCounts: Record<string, number> = {};
    members.forEach((m) => {
      if (m.char?.vision) {
        elementCounts[m.char.vision] = (elementCounts[m.char.vision] || 0) + 1;
      }
    });

    const activeList: { name: string; desc: string; icon: string; color: string }[] = [];

    if ((elementCounts["Pyro"] || 0) >= 2) {
      activeList.push({
        name: "Cộng Hưởng Hỏa (Nhiệt Huyết)",
        desc: "+25% Tấn Công (ATK) cho toàn đội",
        icon: "🔥",
        color: "text-red-400 border-red-500/40 bg-red-500/10",
      });
    }
    if ((elementCounts["Hydro"] || 0) >= 2) {
      activeList.push({
        name: "Cộng Hưởng Thủy (Dịu Dàng)",
        desc: "+25% Giới Hạn HP cho toàn đội",
        icon: "💧",
        color: "text-blue-400 border-blue-500/40 bg-blue-500/10",
      });
    }
    if ((elementCounts["Cryo"] || 0) >= 2) {
      activeList.push({
        name: "Cộng Hưởng Băng (Vụn Vỡ)",
        desc: "+15% Tỉ Lệ Bạo Kích (CRIT Rate) khi đánh địch dính Băng/Đóng Băng",
        icon: "❄️",
        color: "text-cyan-300 border-cyan-500/40 bg-cyan-500/10",
      });
    }
    if ((elementCounts["Geo"] || 0) >= 2) {
      activeList.push({
        name: "Cộng Hưởng Nham (Kiên Định)",
        desc: "+15% Hiệu Lực Khiên, +15% Sát Thương toàn đội khi có khiên, -20% Kháng Nham",
        icon: "🛡️",
        color: "text-amber-400 border-amber-500/40 bg-amber-500/10",
      });
    }
    if ((elementCounts["Dendro"] || 0) >= 2) {
      activeList.push({
        name: "Cộng Hưởng Thảo (Sinh Trưởng)",
        desc: "+50 Tinh Thông Nguyên Tố cơ bản, kích phản ứng nhận thêm tới +50 EM (tổng 100 EM)",
        icon: "🌿",
        color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
      });
    }
    if ((elementCounts["Anemo"] || 0) >= 2) {
      activeList.push({
        name: "Cộng Hưởng Phong (Nhanh Nhẹn)",
        desc: "-15% Thể Lực tiêu hao, +10% Tốc Độ Di Chuyển, -5% Thời Gian Hồi Kỹ Năng",
        icon: "🌪️",
        color: "text-teal-400 border-teal-500/40 bg-teal-500/10",
      });
    }
    if ((elementCounts["Electro"] || 0) >= 2) {
      activeList.push({
        name: "Cộng Hưởng Lôi (Điện Cao Áp)",
        desc: "Kích hoạt phản ứng Lôi tạo Nguyên Tố Hạt giúp nạp năng lượng nhanh",
        icon: "⚡",
        color: "text-purple-400 border-purple-500/40 bg-purple-500/10",
      });
    }
    if (Object.keys(elementCounts).length === 4) {
      activeList.push({
        name: "Màn Chắn Đan Xen (4 Nguyên Tố Khác Nhau)",
        desc: "+15% Kháng Tất Cả Nguyên Tố và Vật Lý",
        icon: "✨",
        color: "text-slate-300 border-slate-500/40 bg-slate-500/10",
      });
    }

    return activeList;
  }, [members]);

  // 2. TÍNH TOÁN PHẢN ỨNG NGUYÊN TỐ CÓ THỂ KÍCH HOẠT TRONG ĐỘI
  const triggeredReactions = useMemo(() => {
    const visions = new Set(members.map((m) => m.char?.vision).filter(Boolean));
    const list: { name: string; type: string; mult: string; desc: string }[] = [];

    if (visions.has("Pyro") && visions.has("Hydro")) {
      list.push({
        name: "Bốc Hơi (Vaporize)",
        type: "Khuếch đại",
        mult: "1.5x - 2.0x",
        desc: "Thủy lên Hỏa x2.0, Hỏa lên Thủy x1.5 sát thương cơ sở nhân với Tinh Thông",
      });
    }
    if (visions.has("Pyro") && visions.has("Cryo")) {
      list.push({
        name: "Tan Chảy (Melt)",
        type: "Khuếch đại",
        mult: "1.5x - 2.0x",
        desc: "Hỏa lên Băng x2.0, Băng lên Hỏa x1.5 sát thương cơ sở",
      });
    }
    if (visions.has("Dendro") && visions.has("Electro")) {
      list.push({
        name: "Kích Hóa / Tăng Cường / Lan Tràn (Quicken / Aggravate / Spread)",
        type: "Cộng thêm phẳng",
        mult: "+Flat DMG",
        desc: "Đòn đánh tiếp theo được cộng thêm một lượng sát thương phẳng cực lớn theo Cấp độ & EM",
      });
    }
    if (visions.has("Dendro") && visions.has("Hydro")) {
      list.push({
        name: "Sum Suê (Bloom)",
        type: "Biến đổi",
        mult: "Hạt nhân Thảo",
        desc: "Tạo Hạt Nhân Thảo nổ sau vài giây hoặc chờ phản ứng Lôi/Hỏa",
      });
      if (visions.has("Electro")) {
        list.push({
          name: "Nở Rộ (Hyperbloom)",
          type: "Biến đổi cao cấp",
          mult: "3.0x Base",
          desc: "Tia đạn Thảo tự tìm mục tiêu gây sát thương cực lớn theo EM của nhân vật Lôi",
        });
      }
      if (visions.has("Pyro")) {
        list.push({
          name: "Bung Tỏa (Burgeon)",
          type: "Biến đổi cao cấp",
          mult: "3.0x Base AoE",
          desc: "Kích nổ Hạt Nhân Thảo diện rộng gây sát thương Hỏa Thảo cực mạnh",
        });
      }
    }
    if (visions.has("Hydro") && visions.has("Cryo")) {
      list.push({
        name: "Đóng Băng (Frozen)",
        type: "Khống chế",
        mult: "CC bất động",
        desc: "Kẻ địch bị bất động hoàn toàn, kích hoạt tối đa hiệu lực bộ Băng (+40% CRIT)",
      });
    }
    if (visions.has("Anemo") && (visions.has("Pyro") || visions.has("Hydro") || visions.has("Electro") || visions.has("Cryo"))) {
      list.push({
        name: "Khuếch Tán (Swirl)",
        type: "Biến đổi & Giảm Kháng",
        mult: "-40% RES",
        desc: "Khuếch đại sát thương diện rộng và kích hoạt hiệu ứng giảm 40% kháng của bộ Bóng Hình Xanh (VV)",
      });
    }
    if (visions.has("Geo") && (visions.has("Pyro") || visions.has("Hydro") || visions.has("Electro") || visions.has("Cryo"))) {
      list.push({
        name: "Kết Tinh (Crystallize)",
        type: "Tạo khiên bảo vệ",
        mult: "+Khiên & Buff",
        desc: "Tạo mảnh giáp nguyên tố giúp duy trì Cộng Hưởng Nham (+15% DMG toàn đội)",
      });
    }

    return list;
  }, [members]);

  // 3. TÍNH TOÁN BUFF TOÀN ĐỘI (TEAM BUFF CALCULATOR)
  const teamBuffs = useMemo(() => {
    let bonusAtkPct = 0;
    let bonusAtkFlat = 0;
    let bonusDmgPct = 0;
    let bonusCritRate = 0;
    let bonusEm = 0;
    let resShredPct = 0;
    const sources: string[] = [];

    // Cộng hưởng
    const elementCounts: Record<string, number> = {};
    members.forEach((m) => {
      if (m.char?.vision) elementCounts[m.char.vision] = (elementCounts[m.char.vision] || 0) + 1;
    });

    if ((elementCounts["Pyro"] || 0) >= 2) {
      bonusAtkPct += 25;
      sources.push("Cộng Hưởng 2 Hỏa: +25% ATK");
    }
    if ((elementCounts["Cryo"] || 0) >= 2) {
      bonusCritRate += 15;
      sources.push("Cộng Hưởng 2 Băng: +15% CRIT Rate");
    }
    if ((elementCounts["Geo"] || 0) >= 2) {
      bonusDmgPct += 15;
      resShredPct += 20;
      sources.push("Cộng Hưởng 2 Nham: +15% DMG, -20% Kháng Nham");
    }
    if ((elementCounts["Dendro"] || 0) >= 2) {
      bonusEm += 80;
      sources.push("Cộng Hưởng 2 Thảo: +80 EM trung bình");
    }

    // Bộ thánh di vật trong đội
    const sets = members.map((m) => m.artifactSet);
    if (sets.includes("noblesse")) {
      bonusAtkPct += 20;
      sources.push("Tông Thất 4 Món: +20% ATK toàn đội sau Nộ");
    }
    if (sets.includes("tenacity")) {
      bonusAtkPct += 20;
      sources.push("Thiên Nham 4 Món: +20% ATK toàn đội khi E trúng");
    }
    if (sets.includes("vv")) {
      resShredPct += 40;
      sources.push("Bóng Hình Màu Xanh (VV): -40% Kháng nguyên tố của địch");
    }
    if (sets.includes("deepwood")) {
      resShredPct += 30;
      sources.push("Ký Ức Rừng Sâu (Deepwood): -30% Kháng Thảo");
    }
    if (sets.includes("scroll")) {
      bonusDmgPct += 40;
      sources.push("Scroll Cinder City 4 Món: +40% Elemental DMG");
    }

    // Đặc quyền nhân vật hỗ trợ nổi tiếng
    members.forEach((m) => {
      const charId = m.char?.id?.toLowerCase() || "";
      if (charId.includes("bennett")) {
        bonusAtkFlat += 950;
        sources.push("Vương Triều Cổ Vũ (Bennett Q): +950 ATK trực tiếp");
      }
      if (charId.includes("furina")) {
        bonusDmgPct += 65;
        sources.push("Náo Nhiệt Toàn Cầu (Furina Q): +65% All DMG Bonus");
      }
      if (charId.includes("kazuha")) {
        bonusDmgPct += 36;
        sources.push("Chihayaburu (Kazuha A4): +36% Elemental DMG Bonus (theo 900 EM)");
      }
      if (charId.includes("zhongli")) {
        resShredPct += 20;
        sources.push("Khiên Ngọc Bích (Zhongli Hold E): -20% Tất Cả Kháng (Universal Shred)");
      }
      if (charId.includes("nahida")) {
        bonusEm += 220;
        sources.push("Ảo Cảnh Tâm Can (Nahida Q): +220 EM cho nhân vật trên sân");
      }
    });

    return {
      bonusAtkPct,
      bonusAtkFlat,
      bonusDmgPct,
      bonusCritRate,
      bonusEm,
      resShredPct,
      sources,
    };
  }, [members]);

  // 4. MÔ PHỎNG SÁT THƯƠNG TỪNG THÀNH VIÊN VÀ TỔNG CHU KỲ (20 GIÂY)
  const calculationResult = useMemo(() => {
    // Kháng phòng ngự thực tế
    const effectiveRes = enemyBaseRes - teamBuffs.resShredPct;
    let resMult = 1;
    if (effectiveRes < 0) {
      resMult = 1 - effectiveRes / 200; // Kháng âm nhân đôi hiệu quả
    } else if (effectiveRes <= 75) {
      resMult = 1 - effectiveRes / 100;
    } else {
      resMult = 1 / (1 + (4 * effectiveRes) / 100);
    }

    // Hệ số phòng ngự DEF của quái cấp 90 vs nhân vật cấp 90
    // (90 + 100) / ((90 + 100) + (enemyLevel + 100)) = 190 / 380 = 0.50
    const defMult = 190 / (190 + (enemyLevel + 100));

    // Tính cho từng slot
    const memberResults = members.map((m, idx) => {
      if (!m.char) {
        return { slotId: m.slotId, name: "Trống", totalDamage: 0, dps: 0, role: m.roleLabel, color: "#64748b" };
      }

      // Chỉ số đã được buff bởi đội
      const isMainDps = idx === 0;
      const effectiveAtk =
        (m.customAtk * (1 + teamBuffs.bonusAtkPct / 100)) + (isMainDps ? teamBuffs.bonusAtkFlat : 0);
      const effectiveCritRate = Math.min(100, m.customCritRate + teamBuffs.bonusCritRate);
      const effectiveCritDmg = m.customCritDmg;
      const effectiveEm = m.customEm + (isMainDps ? teamBuffs.bonusEm : 0);
      const effectiveDmgBonus = m.customDmgBonus + teamBuffs.bonusDmgPct;

      // Hệ số Crit kỳ vọng: 1 + (CR% * CD%)
      const critMultiplier = 1 + (effectiveCritRate / 100) * (effectiveCritDmg / 100);
      const dmgBonusMult = 1 + effectiveDmgBonus / 100;

      // Hệ số phản ứng EM Bonus:
      // Vaporize/Melt: 2.78 * EM / (EM + 1400)
      const reactionEmBonus = (2.78 * effectiveEm) / (effectiveEm + 1400);
      const reactionMultiplier = 1.5 * (1 + reactionEmBonus);

      // Ước tính số hit sát thương trong vòng quay 20s
      let rawDamage = 0;
      if (idx === 0) {
        // Main DPS: Chiếm 10-12s đứng sân tung chuỗi đòn đánh, kỹ năng và nộ
        // Đóng góp ~15 đòn đánh x Hệ số kỹ năng trung bình ~220%
        const skillMotionValue = 15 * 2.2;
        const baseHit = effectiveAtk * skillMotionValue;
        // ~60% số hit kích hoạt phản ứng Bốc Hơi / Tan Chảy / Kích Hóa
        rawDamage = baseHit * dmgBonusMult * critMultiplier * defMult * resMult * (0.4 + 0.6 * reactionMultiplier);
      } else if (idx === 1) {
        // Sub-DPS 1 (Xingqiu, Yelan, Xiangling): Xoay chiêu ngoài sân liên tục
        // ~25 tia nước / pyronado hit, MV ~100%
        const subDpsMotionValue = 22 * 1.15;
        const baseHit = effectiveAtk * subDpsMotionValue;
        rawDamage = baseHit * dmgBonusMult * critMultiplier * defMult * resMult * (0.6 + 0.4 * reactionMultiplier);
      } else if (idx === 2) {
        // Sub-DPS 2 / Buffer (Furina, Fischl, Kazuha): Sát thương thú triệu hồi hoặc Swirl
        const subDpsMotionValue = 16 * 1.1;
        const baseHit = effectiveAtk * subDpsMotionValue;
        // Thêm hạt Hyperbloom hoặc Swirl nếu có Thảo/Lôi/Phong
        const extraReactionDmg = effectiveEm > 300 ? 120000 : 45000;
        rawDamage = (baseHit * dmgBonusMult * critMultiplier * defMult * resMult) + extraReactionDmg;
      } else {
        // Sustain (Zhongli, Bennett, Kokomi, Baizhu): Q burst hoặc trụ E
        const sustainMotionValue = 5 * 1.8;
        rawDamage = effectiveAtk * sustainMotionValue * dmgBonusMult * critMultiplier * defMult * resMult;
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

    return {
      memberResults,
      totalTeamDamage,
      totalTeamDps,
    };
  }, [members, enemyLevel, enemyBaseRes, rotationDuration, teamBuffs]);

  const activeMember = members.find((m) => m.slotId === activeSlot) || members[0];

  return (
    <div className="space-y-6">
      {/* 1. Mẫu Đội Hình Meta 1-Click */}
      <div className="bg-bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-500 animate-pulse" />
            <h3 className="font-display text-sm sm:text-base font-bold text-text-primary">
              Mẫu Đội Hình Meta (Tải Nhanh 1-Click)
            </h3>
          </div>
          <span className="text-xs text-text-muted">Nhấp vào một đội hình để nạp toàn bộ cấu hình mẫu</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {META_TEAMS.map((tpl) => (
            <button
              key={tpl.name}
              type="button"
              onClick={() => handleApplyTemplate(tpl)}
              className="text-left p-3 rounded-xl border border-border/70 bg-bg-elevated/40 hover:border-accent-500 hover:bg-bg-elevated/90 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-text-primary group-hover:text-accent-bright transition-colors truncate">
                  {tpl.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-500/20 text-accent-bright font-mono shrink-0">
                  {tpl.archetype}
                </span>
              </div>
              <p className="text-[11px] text-text-muted line-clamp-1 mb-1.5">{tpl.description}</p>
              <div className="text-[10px] text-accent-500 font-medium">Bấm để tải đội hình này &rarr;</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Tổng Quan 4 Vị Trí Đội Hình */}
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
              className={`relative rounded-2xl p-4 border transition-all cursor-pointer ${
                isSelected
                  ? "bg-bg-elevated border-accent-500 shadow-md ring-1 ring-accent-500/50"
                  : "bg-bg-card border-border/80 hover:border-border-strong hover:bg-bg-card/90"
              }`}
            >
              {/* Badge vai trò */}
              <div className="flex items-center justify-between text-[11px] text-text-muted mb-2 font-mono">
                <span>Vị trí {m.slotId}</span>
                <span className="font-semibold text-text-secondary">{m.roleLabel.split(" ")[0]}</span>
              </div>

              {/* Thông tin nhân vật */}
              {m.char ? (
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-bg-secondary border border-border shrink-0">
                    {m.char.iconUrl ? (
                      <Image
                        src={m.char.iconUrl}
                        alt={m.char.name}
                        fill
                        sizes="48px"
                        className="object-cover object-top"
                      />
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

              {/* Thanh % DPS đóng góp ở đáy card */}
              <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-2xl overflow-hidden bg-border/40">
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

      {/* 3. BẢNG KẾT QUẢ SÁT THƯƠNG TOÀN ĐỘI (TEAM DPS ROTATION DASHBOARD) */}
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
              Ước tính sát thương đầy đủ combo kỹ năng, phản ứng nguyên tố và buff chéo toàn đội.
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

          {/* Chú thích 4 thành viên */}
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

        {/* 4. CỘNG HƯỞNG & BUFF ĐANG KÍCH HOẠT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-5 border-t border-border/60">
          {/* Cộng hưởng nguyên tố */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary font-mono mb-2 flex items-center gap-1.5">
              <span>Cộng Hưởng Kích Hoạt ({resonances.length})</span>
            </h4>
            {resonances.length > 0 ? (
              <div className="flex flex-col gap-2">
                {resonances.map((res) => (
                  <div
                    key={res.name}
                    className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 ${res.color}`}
                  >
                    <span className="text-base shrink-0">{res.icon}</span>
                    <div>
                      <div className="font-bold">{res.name}</div>
                      <div className="text-[11px] opacity-90">{res.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-border/60 text-xs text-text-muted bg-bg-primary/50">
                Chưa có cộng hưởng (Cần tối thiểu 2 nhân vật cùng nguyên tố)
              </div>
            )}
          </div>

          {/* Phản ứng nguyên tố tạo được */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary font-mono mb-2 flex items-center gap-1.5">
              <span>Phản Ứng Khả Dụng ({triggeredReactions.length})</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {triggeredReactions.map((r) => (
                <div
                  key={r.name}
                  className="p-2 rounded-xl border border-border/60 bg-bg-elevated/40 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-text-primary text-[11px]">
                    <span>{r.name}</span>
                    <span className="text-accent-bright font-mono">{r.mult}</span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-0.5 line-clamp-1">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Danh sách hiệu ứng buff toàn đội đang có */}
        <div className="mt-4 p-3 rounded-xl bg-bg-primary/60 border border-border/60">
          <div className="text-[11px] font-bold text-text-muted uppercase font-mono mb-1.5">
            Các hiệu ứng hỗ trợ chéo toàn đội (Team Buff Summary):
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

      {/* 5. KHU VỰC TÙY CHỈNH THÀNH VIÊN ĐANG CHỌN (SLOT {activeSlot}) */}
      <div className="bg-bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
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
            {characters.slice(0, 32).map((c) => {
              const isCurr = activeMember.char?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => updateMember(activeSlot, { char: c })}
                  className={`p-1.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    isCurr
                      ? "border-accent-500 bg-accent-500/15"
                      : "border-border/70 hover:border-text-secondary bg-bg-elevated/40"
                  }`}
                >
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-bg-secondary">
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
