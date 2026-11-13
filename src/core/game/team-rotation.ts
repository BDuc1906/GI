/**
 * src/core/game/team-rotation.ts
 *
 * Tính toán điểm chuẩn Nạp Năng Lượng (Energy Recharge - ER) và xây dựng chu kỳ
 * xoay vòng kỹ năng (Team Rotation Sequence) chuẩn xác theo tiêu chuẩn KeqingMains (KQM).
 */

export interface CharacterEnergyProfile {
  id: string;
  name: string;
  element: string;
  burstCost: number;
  role: "main_dps" | "sub_dps" | "buffer" | "healer" | "shielder";
  baseErTarget: number; // Solo element baseline
  batterySynergyEr: number; // With same element battery
  favoniusOrRaidenEr: number; // With Raiden or Favonius battery in team
  preferredSkillOrder: "E -> Q" | "Q -> E" | "Hold E" | "E -> CA";
  actionDescription: string;
}

/**
 * Hồ sơ năng lượng và vai trò thực chiến của các nhân vật Genshin Impact phổ biến.
 */
export const CHARACTER_ENERGY_PROFILES: Record<string, CharacterEnergyProfile> = {
  // Pyro
  xiangling: {
    id: "xiangling",
    name: "Xiangling",
    element: "Pyro",
    burstCost: 80,
    role: "sub_dps",
    baseErTarget: 240,
    batterySynergyEr: 190,
    favoniusOrRaidenEr: 160,
    preferredSkillOrder: "Q -> E",
    actionDescription: "Bật Q (Bánh Xe Lửa) trong vòng Bennett để snapshot buff, thả Guoba E",
  },
  bennett: {
    id: "bennett",
    name: "Bennett",
    element: "Pyro",
    burstCost: 60,
    role: "buffer",
    baseErTarget: 220,
    batterySynergyEr: 190,
    favoniusOrRaidenEr: 170,
    preferredSkillOrder: "Q -> E",
    actionDescription: "Q (Vùng Tuyệt Kỹ) tạo buff ATK, E nạp và nhường hạt cho đồng đội",
  },
  hutao: {
    id: "hutao",
    name: "Hu Tao",
    element: "Pyro",
    burstCost: 60,
    role: "main_dps",
    baseErTarget: 110,
    batterySynergyEr: 100,
    favoniusOrRaidenEr: 100,
    preferredSkillOrder: "E -> CA",
    actionDescription: "Bật E kích hoạt Bỉ Ngạn Điệp Vũ, xả Trọng Kích liên tục, Q kết liễu",
  },
  arlecchino: {
    id: "arlecchino",
    name: "Arlecchino",
    element: "Pyro",
    burstCost: 60,
    role: "main_dps",
    baseErTarget: 110,
    batterySynergyEr: 100,
    favoniusOrRaidenEr: 100,
    preferredSkillOrder: "E -> CA",
    actionDescription: "E tạo Nợ Máu, đổi nhân vật setup rồi quay lại CA thu hồi Nợ Máu và đánh thường",
  },

  // Hydro
  xingqiu: {
    id: "xingqiu",
    name: "Xingqiu",
    element: "Hydro",
    burstCost: 80,
    role: "sub_dps",
    baseErTarget: 220,
    batterySynergyEr: 180,
    favoniusOrRaidenEr: 150,
    preferredSkillOrder: "E -> Q",
    actionDescription: "E -> Q (hoặc Q -> E -> E với Kiếm Tế Lễ), gom hạt nguyên tố Thủy",
  },
  yelan: {
    id: "yelan",
    name: "Yelan",
    element: "Hydro",
    burstCost: 70,
    role: "sub_dps",
    baseErTarget: 210,
    batterySynergyEr: 170,
    favoniusOrRaidenEr: 145,
    preferredSkillOrder: "E -> Q",
    actionDescription: "E lướt xích kẻ địch, Q xúc xắc bám theo đánh thường của DPS",
  },
  furina: {
    id: "furina",
    name: "Furina",
    element: "Hydro",
    burstCost: 60,
    role: "sub_dps",
    baseErTarget: 190,
    batterySynergyEr: 155,
    favoniusOrRaidenEr: 135,
    preferredSkillOrder: "E -> Q",
    actionDescription: "E triệu hồi 3 Salon Solitaire gây sát thương Thủy off-field, Q mở sân khấu Fanfare",
  },
  neuvillette: {
    id: "neuvillette",
    name: "Neuvillette",
    element: "Hydro",
    burstCost: 70,
    role: "main_dps",
    baseErTarget: 130,
    batterySynergyEr: 115,
    favoniusOrRaidenEr: 105,
    preferredSkillOrder: "E -> Q",
    actionDescription: "E và Q tạo Giọt Nước Tinh Khiết, ngưng tụ Trọng Kích bắn Pháo Thủy triều",
  },

  // Anemo
  kazuha: {
    id: "kazuha",
    name: "Kaedehara Kazuha",
    element: "Anemo",
    burstCost: 60,
    role: "buffer",
    baseErTarget: 175,
    batterySynergyEr: 150,
    favoniusOrRaidenEr: 135,
    preferredSkillOrder: "Hold E",
    actionDescription: "Giữ E gom quái + khuếch tán 4VV giảm kháng, Q mở lôi đình phong trường",
  },
  sucrose: {
    id: "sucrose",
    name: "Sucrose",
    element: "Anemo",
    burstCost: 80,
    role: "buffer",
    baseErTarget: 180,
    batterySynergyEr: 150,
    favoniusOrRaidenEr: 140,
    preferredSkillOrder: "E -> Q",
    actionDescription: "E hút quái + truyền Tinh Thông EM, Q thả bình cồn nguyên tố",
  },

  // Electro
  raiden: {
    id: "raiden",
    name: "Raiden Shogun",
    element: "Electro",
    burstCost: 90,
    role: "main_dps",
    baseErTarget: 220,
    batterySynergyEr: 200,
    favoniusOrRaidenEr: 200,
    preferredSkillOrder: "E -> Q",
    actionDescription: "E duy trì Lôi Phạt, đổi cả đội xả Nộ tích Uy Lực, bật Q chém Mộng Tưởng Nhất Đao & nạp cho toàn đội",
  },
  fischl: {
    id: "fischl",
    name: "Fischl",
    element: "Electro",
    burstCost: 60,
    role: "sub_dps",
    baseErTarget: 120,
    batterySynergyEr: 100,
    favoniusOrRaidenEr: 100,
    preferredSkillOrder: "E -> Q",
    actionDescription: "Luân phiên E và Q để giữ Oz liên tục 100% thời gian trên sân",
  },
  yae: {
    id: "yae",
    name: "Yae Miko",
    element: "Electro",
    burstCost: 90,
    role: "sub_dps",
    baseErTarget: 170,
    batterySynergyEr: 135,
    favoniusOrRaidenEr: 120,
    preferredSkillOrder: "E -> Q",
    actionDescription: "E-E-E đặt 3 trụ Sát Sinh Anh, Q nổ hoa sen sấm sét rồi đặt lại E-E-E",
  },

  // Dendro
  nahida: {
    id: "nahida",
    name: "Nahida",
    element: "Dendro",
    burstCost: 50,
    role: "sub_dps",
    baseErTarget: 130,
    batterySynergyEr: 110,
    favoniusOrRaidenEr: 105,
    preferredSkillOrder: "Hold E",
    actionDescription: "Giữ E quét dấu Diệt Độ Tam Nghiệp, Q mở Ảo Ảnh Vòm Lá buff 250 EM",
  },
  alhaitham: {
    id: "alhaitham",
    name: "Alhaitham",
    element: "Dendro",
    burstCost: 70,
    role: "main_dps",
    baseErTarget: 140,
    batterySynergyEr: 120,
    favoniusOrRaidenEr: 110,
    preferredSkillOrder: "Q -> E",
    actionDescription: "Q mở màn tạo 3 Trác Quang Kính, chém thường giữ kính tối đa 3 tầng",
  },

  // Geo
  zhongli: {
    id: "zhongli",
    name: "Zhongli",
    element: "Geo",
    burstCost: 40,
    role: "shielder",
    baseErTarget: 120,
    batterySynergyEr: 110,
    favoniusOrRaidenEr: 100,
    preferredSkillOrder: "Hold E",
    actionDescription: "Giữ E tạo Khiên Ngọc giảm 20% toàn bộ kháng, Q hóa đá đối thủ khi cần khống chế",
  },
  navia: {
    id: "navia",
    name: "Navia",
    element: "Geo",
    burstCost: 60,
    role: "main_dps",
    baseErTarget: 130,
    batterySynergyEr: 110,
    favoniusOrRaidenEr: 100,
    preferredSkillOrder: "Q -> E",
    actionDescription: "Q bắn pháo thu đạn Kết Tinh, E xả họng súng dù tối đa 6 mảnh đạn",
  },

  // Cryo
  ayaka: {
    id: "ayaka",
    name: "Kamisato Ayaka",
    element: "Cryo",
    burstCost: 80,
    role: "main_dps",
    baseErTarget: 150,
    batterySynergyEr: 130,
    favoniusOrRaidenEr: 115,
    preferredSkillOrder: "E -> Q",
    actionDescription: "Dash áp sát gắn ấn Băng, E hất tung buff sát thương, Q phóng bão tuyết Soumetsu",
  },
  shenhe: {
    id: "shenhe",
    name: "Shenhe",
    element: "Cryo",
    burstCost: 80,
    role: "buffer",
    baseErTarget: 200,
    batterySynergyEr: 165,
    favoniusOrRaidenEr: 145,
    preferredSkillOrder: "Hold E",
    actionDescription: "E/Nhấn giữ E phát Lệnh Bùa Băng buff Icy Quill, Q giảm kháng Băng/Vật lý",
  },
};

export interface TeamMemberErEvaluation {
  id: string;
  name: string;
  element: string;
  burstCost: number;
  recommendedEr: number;
  isBatteryAvailable: boolean;
  notes: string;
  role: "main_dps" | "sub_dps" | "buffer" | "healer" | "shielder";
}

export interface RotationStep {
  step: number;
  characterId: string;
  characterName: string;
  element: string;
  action: string;
  description: string;
  phase: "setup" | "buff" | "sub_dps" | "main_dps" | "battery";
  phaseNameVi: string;
}

/**
 * Phân tích nhu cầu Hiệu Quả Nạp (ER) của cả 4 thành viên trong đội hình.
 */
export function analyzeTeamEr(
  teamMemberIds: string[],
  fallbackProfiles: Record<string, { name: string; element: string }>
): TeamMemberErEvaluation[] {
  // Đếm số lượng nhân vật theo từng nguyên tố trong đội
  const elementCounts: Record<string, number> = {};
  const hasRaiden = teamMemberIds.some((id) => id.toLowerCase().includes("raiden"));

  for (const id of teamMemberIds) {
    const key = id.toLowerCase().replace(/[^a-z0-9]/g, "");
    const prof = CHARACTER_ENERGY_PROFILES[key];
    const elem = prof?.element || fallbackProfiles[id]?.element || "Anemo";
    elementCounts[elem] = (elementCounts[elem] || 0) + 1;
  }

  return teamMemberIds.map((id) => {
    const key = id.toLowerCase().replace(/[^a-z0-9]/g, "");
    const prof = CHARACTER_ENERGY_PROFILES[key];
    const charName = prof?.name || fallbackProfiles[id]?.name || id;
    const elem = prof?.element || fallbackProfiles[id]?.element || "Anemo";
    const sameElementTeammates = (elementCounts[elem] || 1) - 1;

    if (prof) {
      let recEr = prof.baseErTarget;
      let notes = "Cần nạp cơ bản (Solo nguyên tố)";

      if (hasRaiden && prof.id !== "raiden") {
        recEr = prof.favoniusOrRaidenEr;
        notes = "Được Raiden Shogun sạc năng lượng mạnh mẽ";
      } else if (sameElementTeammates > 0) {
        recEr = prof.batterySynergyEr;
        notes = `Có ${sameElementTeammates} đồng đội cùng hệ ${elem} hỗ trợ nạp`;
      }

      return {
        id,
        name: charName,
        element: elem,
        burstCost: prof.burstCost,
        recommendedEr: recEr,
        isBatteryAvailable: sameElementTeammates > 0 || hasRaiden,
        notes,
        role: prof.role,
      };
    }

    // Heuristic cho nhân vật chưa có profile cứng
    const burstCost = 60;
    const recEr = sameElementTeammates > 0 ? 140 : 160;
    return {
      id,
      name: charName,
      element: elem,
      burstCost,
      recommendedEr: recEr,
      isBatteryAvailable: sameElementTeammates > 0 || hasRaiden,
      notes: sameElementTeammates > 0 ? "Có đồng đội cùng nguyên tố trợ nạp" : "Nhu cầu nạp tiêu chuẩn",
      role: "sub_dps",
    };
  });
}

/**
 * Xây dựng chu kỳ combo chuẩn (Rotation Sequence) cho đội hình 4 người.
 */
export function buildTeamRotation(
  teamMemberIds: string[],
  fallbackProfiles: Record<string, { name: string; element: string }>
): RotationStep[] {
  const evaluations = analyzeTeamEr(teamMemberIds, fallbackProfiles);

  // Phân nhóm theo vai trò
  const shielders = evaluations.filter((e) => e.role === "shielder");
  const buffers = evaluations.filter((e) => e.role === "buffer" || e.role === "healer");
  const subDps = evaluations.filter((e) => e.role === "sub_dps");
  const mainDps = evaluations.filter((e) => e.role === "main_dps");

  // Nếu không nhận diện được main_dps, lấy thành viên cuối cùng
  const finalMainDps = mainDps.length > 0 ? mainDps : subDps.slice(-1);
  const remainingSub = subDps.filter((s) => !finalMainDps.includes(s));

  const steps: RotationStep[] = [];
  let stepIdx = 1;

  // Phase 1: Tạo khiên / Setup ban đầu
  for (const s of shielders) {
    const key = s.id.toLowerCase().replace(/[^a-z0-9]/g, "");
    const prof = CHARACTER_ENERGY_PROFILES[key];
    steps.push({
      step: stepIdx++,
      characterId: s.id,
      characterName: s.name,
      element: s.element,
      action: prof?.preferredSkillOrder || "Hold E",
      description: prof?.actionDescription || "Triển khai khiên bảo vệ và kích hoạt kháng gián đoạn",
      phase: "setup",
      phaseNameVi: "Bảo Vệ & Chuẩn Bị",
    });
  }

  // Phase 2: Buffs & Giảm kháng (VV Swirl, Noblesse, Kazuha/Bennett)
  for (const b of buffers) {
    const key = b.id.toLowerCase().replace(/[^a-z0-9]/g, "");
    const prof = CHARACTER_ENERGY_PROFILES[key];
    steps.push({
      step: stepIdx++,
      characterId: b.id,
      characterName: b.name,
      element: b.element,
      action: prof?.preferredSkillOrder || "Q -> E",
      description: prof?.actionDescription || "Khuếch tán giảm kháng hoặc đặt vùng buff sát thương",
      phase: "buff",
      phaseNameVi: "Cường Hóa & Giảm Kháng",
    });
  }

  // Phase 3: Sub-DPS Burst & Phản Ứng (Xiangling, Xingqiu, Yelan, Nahida, etc.)
  for (const sub of remainingSub) {
    const key = sub.id.toLowerCase().replace(/[^a-z0-9]/g, "");
    const prof = CHARACTER_ENERGY_PROFILES[key];
    steps.push({
      step: stepIdx++,
      characterId: sub.id,
      characterName: sub.name,
      element: sub.element,
      action: prof?.preferredSkillOrder || "E -> Q",
      description: prof?.actionDescription || "Kích hoạt Kỹ Năng Nộ gây sát thương và cấp nguyên tố từ ngoài sân",
      phase: "sub_dps",
      phaseNameVi: "Sát Thương Ngoài Sân",
    });
  }

  // Phase 4: Main DPS On-Field Cửa Sổ Xả Sát Thương
  for (const m of finalMainDps) {
    const key = m.id.toLowerCase().replace(/[^a-z0-9]/g, "");
    const prof = CHARACTER_ENERGY_PROFILES[key];
    steps.push({
      step: stepIdx++,
      characterId: m.id,
      characterName: m.name,
      element: m.element,
      action: prof?.preferredSkillOrder || "E -> Đánh Thường / Trọng Kích",
      description: prof?.actionDescription || "Đứng sân gây sát thương tối đa trong thời gian tồn tại của buff",
      phase: "main_dps",
      phaseNameVi: "Chủ Lực Đứng Sân (DPS Window)",
    });
  }

  // Phase 5: Nạp Năng Lượng & Cooldown Funneling
  if (steps.length > 0) {
    const batteryCandidates = buffers.concat(shielders);
    const primaryBattery = batteryCandidates[0] || evaluations[0];
    steps.push({
      step: stepIdx++,
      characterId: primaryBattery.id,
      characterName: primaryBattery.name,
      element: primaryBattery.element,
      action: "E (Nhường hạt)",
      description: "Đánh E tạo hạt năng lượng, đổi nhanh sang nhân vật thiếu nộ để nhặt hạt và lặp lại vòng lặp",
      phase: "battery",
      phaseNameVi: "Nạp Năng Lượng Chu Kỳ Mới",
    });
  }

  return steps;
}
