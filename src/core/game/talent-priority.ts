/**
 * src/core/game/talent-priority.ts
 *
 * Hệ thống phân tích và xác định thứ tự ưu tiên nâng cấp Thiên Phú (Talent Upgrade Priority)
 * chuẩn thi đấu và cơ chế game cho 136+ nhân vật trong Genshin Impact.
 *
 * Nguồn dữ liệu: Cơ chế vận hành thực tế của bộ kỹ năng (KQM Theorycrafting & HoYo meta).
 */

export interface TalentPriorityItem {
  key: "normalAttack" | "elementalSkill" | "elementalBurst";
  nameVi: string;
  shortCode: "NA" | "E" | "Q";
  rank: 1 | 2 | 3; // 1 = Tối cao (Vương Miện), 2 = Quan trọng, 3 = Tùy chọn / Để Lv 1
  isCrownRecommended: boolean;
  canLeaveAtLevel1: boolean;
  recommendationNote: string;
}

export interface CharacterTalentPriority {
  orderFormula: string; // vd: "Q > E >> NA"
  displayOrderVi: string; // vd: "Kỹ Năng Nộ (Q) > Kỹ Năng Nguyên Tố (E) >> Đòn Đánh Thường"
  summaryVi: string;
  items: Record<"normalAttack" | "elementalSkill" | "elementalBurst", TalentPriorityItem>;
}

interface ExplicitPriorityConfig {
  order: ("NA" | "E" | "Q")[];
  equalWithNext?: boolean[];
  naNote?: string;
  eNote?: string;
  qNote?: string;
  summary: string;
  naLevel1?: boolean;
}

/** Bảng ánh xạ ưu tiên chi tiết cho các nhân vật tiêu biểu trong game */
const EXPLICIT_PRIORITY_MAP: Record<string, ExplicitPriorityConfig> = {
  // --- Fontaine & Natlan ---
  furina: {
    order: ["E", "Q", "NA"],
    equalWithNext: [true, false, false], // E = Q >> NA
    eNote: "Nguồn sát thương Sub-DPS duy trì ngoài sân cực lớn và kích hoạt hồi máu phụ trợ.",
    qNote: "Gia tăng sát thương khổng lồ cho toàn đội dựa trên điểm Náo Nhiệt.",
    naNote: "Không cần nâng cấp, có thể giữ ở Lv. 1 để tiết kiệm tài nguyên.",
    summary: "Ưu tiên tối đa cả Kỹ Năng Nguyên Tố (E) và Kỹ Năng Nộ (Q) ngang hàng nhau. Đánh thường có thể để Lv. 1.",
    naLevel1: true,
  },
  neuvillette: {
    order: ["NA", "Q", "E"],
    equalWithNext: [false, true, false], // NA > Q = E
    naNote: "Trọng Kích: Thẩm Phán Cân Bằng là nguồn sát thương áp đảo (chiếm 90% tổng sát thương). Nên nâng Vương Miện.",
    qNote: "Tạo 6 Giọt Nước Tinh Khiết để nạp Trọng Kích bắn liên tục 2 lần.",
    eNote: "Gây sát thương Thủy diện rộng và tạo 3 Giọt Nước Tinh Khiết.",
    summary: "Trọng Kích là ưu tiên số 1 tuyệt đối (xứng đáng Vương Miện Lv. 10). Q và E nâng tiếp để tạo Giọt Nước.",
  },
  arlecchino: {
    order: ["NA", "E", "Q"],
    naNote: "Đòn đánh thường được cường hóa khi có Khế Ước Sinh Mệnh là nguồn sát thương cốt lõi. Ưu tiên Vương Miện.",
    eNote: "Đánh dấu Lệnh Thu Nợ lên kẻ địch để thu hồi Khế Ước Sinh Mệnh dồi dào.",
    qNote: "Gây sát thương Hỏa diện rộng và là công cụ HỒI MÁU DUY NHẤT của Arlecchino trong chiến đấu.",
    summary: "Đánh thường là nguồn sát thương chính (Vương Miện). Kỹ năng E và Q nâng lên 8-9 để tối ưu chu chuyển.",
  },
  mualani: {
    order: ["E", "Q", "NA"],
    eNote: "Đòn Cắn Cá Mập trong trạng thái Lướt Sóng là nguồn sát thương Bốc Hơi dồn dame khủng nhất.",
    qNote: "Bắn Tên Lửa Cá Mập khổng lồ gây lượng lớn sát thương Thủy diện rộng.",
    naNote: "Không dùng đòn đánh thường thông thường khi chiến đấu, giữ ở Lv. 1.",
    summary: "Ưu tiên tối đa Kỹ Năng E (Vương Miện). Kỹ Năng Q nâng tiếp theo. Đánh thường để Lv. 1.",
    naLevel1: true,
  },
  kinich: {
    order: ["E", "Q", "NA"],
    eNote: "Pháo Vảy Vực Sâu trong trạng thái Bay Lượn Bằng Dây Móc là nguồn sát thương chủ lực.",
    qNote: "Giải phóng Rồng Ajaw phun lửa liên tục hỗ trợ ngoài sân.",
    naNote: "Không sử dụng đòn đánh thường thông thường, giữ ở Lv. 1.",
    summary: "Tập trung tối đa vào Kỹ Năng E (Vương Miện). Q nâng tiếp theo. Đánh thường để Lv. 1.",
    naLevel1: true,
  },
  xilonen: {
    order: ["E", "Q", "NA"],
    eNote: "Kích hoạt trạng thái Patroller và trừ kháng nguyên tố của kẻ địch. Kỹ năng hỗ trợ cốt lõi.",
    qNote: "Hồi máu cho nhân vật xuất chiến hoặc giáng đòn sát thương Nham diện rộng.",
    naNote: "Đòn đánh thường không đóng góp nhiều cho vai trò hỗ trợ, giữ ở Lv. 1.",
    summary: "Ưu tiên E để tối đa lượng giảm kháng kẻ địch. Q nâng tiếp theo để tăng lượng hồi phục.",
    naLevel1: true,
  },
  navia: {
    order: ["E", "Q", "NA"],
    eNote: "Bắn Đạn Pháo Thanh Lịch dồn sát thương Nham cực đại theo số Mảnh Đạn tích lũy. Ưu tiên Vương Miện.",
    qNote: "Triệu hồi Pháo Kích dội lửa liên tục và hỗ trợ nạp Mảnh Đạn.",
    naNote: "Sử dụng sau khi kích hoạt E nhờ đính kèm nguyên tố Nham, nên nâng ở mức vừa phải (Lv. 6-8).",
    summary: "Kỹ năng E là nguồn sát thương đơn mục tiêu mạnh nhất của Navia (Vương Miện), kế đến là Q và NA.",
  },
  clorinde: {
    order: ["E", "Q", "NA"],
    eNote: "Chuyển sang trạng thái Tuần Tra Đêm: bắn súng và lao kiếm gây sát thương Lôi liên tục. Sát thương tính theo E.",
    qNote: "Chém 5 nhát kiếm Lôi diện rộng và tự nạp Khế Ước Sinh Mệnh tức thì.",
    naNote: "Đòn đánh thường trong trạng thái E tính theo cấp kỹ năng E, không cần nâng đòn thường (giữ Lv. 1).",
    summary: "Kỹ năng E là nguồn sát thương chủ lực (Vương Miện). Q nâng tiếp theo. Đánh thường để Lv. 1.",
    naLevel1: true,
  },

  // --- Sumeru ---
  alhaitham: {
    order: ["E", "NA", "Q"],
    equalWithNext: [true, false, false], // E = NA > Q
    eNote: "Tạo Ánh Sáng Gương và là nguồn sát thương Mưa Kiếm chính.",
    naNote: "Đòn đánh thường và trọng kích đính kèm Thảo, tương tác trực tiếp với Ánh Sáng Gương.",
    qNote: "Tạo sát thương Thảo nhiều đợt và hồi phục Ánh Sáng Gương.",
    summary: "Cần nâng đều cả E và Đòn đánh thường, sau đó đến Kỹ năng Nộ Q.",
  },
  nahida: {
    order: ["E", "Q", "NA"],
    eNote: "Diệt Tịnh Tam Nghiệp liên kết kẻ địch và gây sát thương Thảo áp đảo mỗi khi có phản ứng. Ưu tiên Vương Miện.",
    qNote: "Tạo Cung Điện Ảo Mộng tăng Tinh Thông Nguyên Tố và khuếch đại uy lực cho E.",
    naNote: "Chỉ nâng nếu chơi Nahida On-field kích phản ứng; nếu chơi Off-field có thể để Lv. 1.",
    summary: "Kỹ năng E là linh hồn của Nahida (Vương Miện), sau đó là Q. Đánh thường tùy chọn.",
  },

  // --- Liyue & Inazuma Meta ---
  "hu-tao": {
    order: ["NA", "E", "Q"],
    equalWithNext: [true, false, false], // NA = E > Q
    naNote: "Trọng kích kích hoạt phản ứng Bốc Hơi liên tục, là nguồn sát thương lớn nhất. Ưu tiên Vương Miện.",
    eNote: "Tiêu hao HP chuyển hóa thành chỉ số Tấn Công khổng lồ và đính kèm Hỏa. Ưu tiên Vương Miện.",
    qNote: "Dồn sát thương diện rộng và hồi máu khẩn cấp khi HP xuống quá thấp.",
    summary: "Nâng song song Đánh Thường và Kỹ Năng E (cả 2 đều xứng đáng Vương Miện), sau đó tới Q.",
  },
  "raiden-shogun": {
    order: ["Q", "E", "NA"],
    qNote: "Nhất Đao Xé Đêm gây sát thương Lôi cực đại và sạc Năng Lượng cho toàn bộ đồng đội. Ưu tiên Vương Miện.",
    eNote: "Đòn đánh phối hợp ngoài sân và gia tăng sát thương Nộ cho toàn đội.",
    naNote: "Đòn đánh thường trong trạng thái Nộ tính theo cấp kỹ năng Q, không cần nâng đòn thường (giữ Lv. 1).",
    summary: "Kỹ năng Nộ Q là trọng tâm tuyệt đối của Lôi Thần (Vương Miện). E nâng cấp tiếp theo, đòn thường để Lv. 1.",
    naLevel1: true,
  },
  kazuha: {
    order: ["Q", "E", "NA"],
    equalWithNext: [true, false, false], // Q = E > NA
    qNote: "Tạo Lĩnh Vực Gió khuếch tán nguyên tố diện rộng và nhuộm màu nguyên tố liên tục.",
    eNote: "Hút kẻ địch, tạo lực nén và rơi xuống tạo sát thương Khuếch Tán mạnh mẽ.",
    naNote: "Đòn đáp Chihayaburu được tính theo đòn đánh thường, có thể nâng lên 6-8.",
    summary: "Nâng đều Q và E để tăng sát thương phong diện rộng. Tinh Thông Nguyên Tố là quan trọng nhất.",
  },
  zhongli: {
    order: ["E", "Q", "NA"],
    eNote: "Tạo Khiên Ngọc che chắn mọi sát thương và giảm 20% toàn bộ kháng nguyên tố/vật lý kẻ địch. Ưu tiên Vương Miện.",
    qNote: "Thả Thiên Thạch hóa đá kẻ địch trong 4 giây và gây sát thương Nham diện rộng.",
    naNote: "Đòn đánh thường không cần thiết cho vai trò hỗ trợ khiên, giữ ở Lv. 1.",
    summary: "Ưu tiên tối đa Kỹ Năng E để tối ưu độ dày của Khiên (Vương Miện). Q nâng nếu muốn thêm khống chế.",
    naLevel1: true,
  },
  bennett: {
    order: ["Q", "E", "NA"],
    qNote: "Vùng đất Tuyệt Kỹ Kỳ Dị hồi máu siêu tốc và TĂNG TẤN CÔNG cực khủng dựa trên ATK căn bản. Ưu tiên Vương Miện.",
    eNote: "Dùng để nạp năng lượng nguyên tố Hỏa cho đồng đội (Xiangling) và phá khiên Băng.",
    naNote: "Hoàn toàn không đóng góp vào buff ATK hay hồi phục máu của Q. Giữ ở Lv. 1.",
    summary: "Kỹ Năng Nộ Q là kỹ năng giá trị nhất game (xứng đáng Vương Miện Lv. 10). E nâng tùy ý, NA để Lv. 1.",
    naLevel1: true,
  },
  xiangling: {
    order: ["Q", "E", "NA"],
    qNote: "Vòng Lửa Bánh Xe Xoay Tít không có thời gian hồi phản ứng (no ICD), là vua sát thương Bốc Hơi ngoài sân. Ưu tiên Vương Miện.",
    eNote: "Guoba phun lửa gây sát thương Hỏa và giảm kháng Hỏa của kẻ địch.",
    naNote: "Xiangling chủ yếu đánh ngoài sân, không cần nâng đòn đánh thường (giữ Lv. 1).",
    summary: "Kỹ Năng Nộ Q là ưu tiên hàng đầu tuyệt đối (Vương Miện). E nâng sau, đòn thường giữ Lv. 1.",
    naLevel1: true,
  },
  xingqiu: {
    order: ["Q", "E", "NA"],
    qNote: "Kiếm Vũ Cầu Vồng bắn kiếm nước liên tục, cấp Thủy mạnh nhất game cho chủ lực Hỏa/Thảo. Ưu tiên Vương Miện.",
    eNote: "Cổ Hoa Kiếm gây 2 nhát chém sát thương Thủy cực lớn, tạo Kiếm Trọng Lực giảm sát thương nhận vào.",
    naNote: "Không sử dụng đánh thường trên sân, giữ ở Lv. 1.",
    summary: "Ưu tiên Q trước tiên, sau đó đến E để tăng sát thương bộc phát và kháng đòn. Đánh thường để Lv. 1.",
    naLevel1: true,
  },
  yelan: {
    order: ["Q", "E", "NA"],
    qNote: "Xúc Xắc Tinh Tế bắn đòn Thủy ngoài sân và tăng dần sát thương cho nhân vật xuất chiến (tối đa 50%). Ưu tiên Vương Miện.",
    eNote: "Kéo dây lướt nhanh trói mục tiêu và gây sát thương Thủy diện rộng theo lượng HP tối đa.",
    naNote: "Chỉ dùng đòn Phá Trận Thần Tốc, không cần nâng cao trừ khi chơi C6.",
    summary: "Ưu tiên tối đa Kỹ Năng Nộ Q (Vương Miện), tiếp đến là Kỹ Năng E. Đánh thường để Lv. 1.",
    naLevel1: true,
  },
  xiao: {
    order: ["NA", "Q", "E"],
    equalWithNext: [true, false, false], // NA = Q > E
    naNote: "Sát thương tấn công khi đáp (Plunging Attack) nhân tỉ lệ theo đòn đánh thường. Ưu tiên Vương Miện.",
    qNote: "Bật Mặt Nạ Dạ Xoa tăng cường độ nhảy cao, phạm vi sát thương và đính kèm Phong.",
    eNote: "Lướt gió nạp năng lượng và di chuyển cơ động.",
    summary: "Bắt buộc phải nâng Đòn Đánh Thường song song với Kỹ Năng Nộ Q (cả 2 đều cần Lv. 9-10).",
  },
  ayaka: {
    order: ["Q", "NA", "E"],
    qNote: "Lốc Xoáy Băng Tan dồn sát thương 20 nhát chém Băng cực hạn trong 5 giây. Ưu tiên Vương Miện.",
    naNote: "Trọng kích chém 3 đợt diện rộng đính kèm Băng sau khi lướt trồi lên.",
    eNote: "Tạo Băng diện rộng hất tung kẻ địch và tăng sát thương đánh thường/trọng kích.",
    summary: "Kỹ Năng Nộ Q là đòn kết liễu chủ lực (Vương Miện). Kế đến là Đòn đánh thường và Kỹ năng E.",
  },
  wanderer: {
    order: ["NA", "E", "Q"],
    naNote: "Đòn đánh thường và trọng kích phóng lưỡi gió trong trạng thái bay lượn là nguồn sát thương cốt lõi.",
    eNote: "Bay lượn trên không trung và tăng cường tỉ lệ sát thương đòn đánh.",
    qNote: "Giẫm đạp 5 đợt sát thương Phong diện rộng kết thúc trạng thái bay.",
    summary: "Ưu tiên tối đa Đòn đánh thường (Vương Miện), sau đó đến Kỹ năng E và Kỹ năng Nộ Q.",
  },
  wriothesley: {
    order: ["NA", "E", "Q"],
    naNote: "Nắm đấm Băng thường và trọng kích hừng hực lửa là nguồn sát thương chính. Ưu tiên Vương Miện.",
    eNote: "Cường hóa đòn đánh thường và tiêu hao HP để tăng sát thương bộc phát.",
    qNote: "Tung 5 cú đấm sương giá diện rộng dồn sát thương Băng nhanh.",
    summary: "Đòn đánh thường là nguồn sát thương áp đảo (Vương Miện). Kế đến là E và Q.",
  },
  fischl: {
    order: ["E", "Q", "NA"],
    eNote: "Triệu hồi Quạ Oz bắn đạn Lôi liên tục và kích hoạt thiên phú giáng sấm Thần Phạt. Ưu tiên Vương Miện.",
    qNote: "Tái triệu hồi Oz và hồi máu, làm mới thời gian hiện diện của Oz trên sân.",
    naNote: "Fischl chiến đấu ngoài sân, không cần nâng đòn đánh thường (trừ khi build vật lý).",
    summary: "Kỹ Năng E là toàn bộ sức mạnh của Fischl (Vương Miện). Q nâng sau để bổ trợ Oz, NA để Lv. 1.",
    naLevel1: true,
  },
};

/** Thuật toán suy luận quy luật ưu tiên theo kit cho nhân vật chưa có cấu hình thủ công */
function inferTalentPriority(character: {
  id: string;
  name: string;
  weaponType: string;
  vision: string;
}): ExplicitPriorityConfig {
  const isBowOrCatalyst = character.weaponType === "Bow" || character.weaponType === "Catalyst";
  const isSupportHealer = ["Barbara", "Qiqi", "Diona", "Sayu", "Thoma", "Gorou", "Yun Jin", "Kuki Shinobu", "Dori", "Candace", "Layla", "Faruzan", "Yaoyao", "Mika", "Kirara", "Lynette", "Charlotte", "Chevreuse", "Sethos", "Kachina", "Ororon", "Iansan"].includes(character.name);

  if (isSupportHealer) {
    return {
      order: ["E", "Q", "NA"],
      equalWithNext: [false, false, false],
      eNote: "Cung cấp hiệu ứng hỗ trợ/hồi phục hoặc khiên bảo vệ chủ lực.",
      qNote: "Bổ trợ sát thương diện rộng hoặc chu chuyển nạp toàn đội.",
      naNote: "Không sử dụng đòn đánh thường trên sân, có thể để ở Lv. 1.",
      summary: "Tập trung nâng cấp Kỹ năng E và Q để tối ưu hiệu quả hỗ trợ đội hình. Đòn đánh thường giữ ở Lv. 1.",
      naLevel1: true,
    };
  }

  if (isBowOrCatalyst) {
    return {
      order: ["NA", "E", "Q"],
      equalWithNext: [false, false, false],
      naNote: "Đòn đánh thường hoặc trọng kích ngắm bắn là nguồn sát thương cơ bản.",
      eNote: "Kích hoạt hiệu ứng nguyên tố và hồi phục năng lượng.",
      qNote: "Kỹ năng nộ dồn sát thương diện rộng.",
      summary: "Ưu tiên nâng đòn đánh thường cho chủ lực viễn chiến, theo sau là E và Q.",
    };
  }

  // Mặc định cho cận chiến (Sword, Claymore, Polearm)
  return {
    order: ["Q", "E", "NA"],
    equalWithNext: [false, false, false],
    qNote: "Kỹ năng nộ mang lại lượng sát thương lớn và khống chế diện rộng.",
    eNote: "Tạo hạt nguyên tố và duy trì sát thương kỹ năng thường xuyên.",
    naNote: "Bổ sung đòn đánh trên sân khi kỹ năng trong thời gian hồi chiêu.",
    summary: "Ưu tiên Kỹ Năng Nộ (Q) và Kỹ Năng Nguyên Tố (E) trước để tối ưu hóa sát thương và chu chuyển năng lượng.",
  };
}

/**
 * Trả về thứ tự ưu tiên nâng cấp thiên phú hoàn chỉnh của nhân vật
 */
export function getCharacterTalentPriority(character: {
  id: string;
  name: string;
  weaponType: string;
  vision: string;
}): CharacterTalentPriority {
  const charKey = character.id.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const config =
    EXPLICIT_PRIORITY_MAP[charKey] ??
    inferTalentPriority(character);

  const LABELS: Record<"NA" | "E" | "Q", { key: TalentPriorityItem["key"]; nameVi: string; labelFull: string }> = {
    NA: { key: "normalAttack", nameVi: "Tấn Công Thường", labelFull: "Đòn Đánh Thường" },
    E: { key: "elementalSkill", nameVi: "Kỹ Năng Nguyên Tố", labelFull: "Kỹ Năng Nguyên Tố (E)" },
    Q: { key: "elementalBurst", nameVi: "Kỹ Năng Nộ", labelFull: "Kỹ Năng Nộ (Q)" },
  };

  const items: Record<"normalAttack" | "elementalSkill" | "elementalBurst", TalentPriorityItem> = {
    normalAttack: {
      key: "normalAttack",
      nameVi: "Tấn Công Thường",
      shortCode: "NA",
      rank: 3,
      isCrownRecommended: false,
      canLeaveAtLevel1: Boolean(config.naLevel1),
      recommendationNote: config.naNote ?? "Đòn đánh cơ bản khi chiến đấu trên sân.",
    },
    elementalSkill: {
      key: "elementalSkill",
      nameVi: "Kỹ Năng Nguyên Tố",
      shortCode: "E",
      rank: 2,
      isCrownRecommended: false,
      canLeaveAtLevel1: false,
      recommendationNote: config.eNote ?? "Kích hoạt hiệu ứng nguyên tố và hạt năng lượng.",
    },
    elementalBurst: {
      key: "elementalBurst",
      nameVi: "Kỹ Năng Nộ",
      shortCode: "Q",
      rank: 1,
      isCrownRecommended: false,
      canLeaveAtLevel1: false,
      recommendationNote: config.qNote ?? "Đòn dứt điểm tối thượng hoặc hỗ trợ toàn đội.",
    },
  };

  // Gán rank 1, 2, 3 dựa trên vị trí trong order
  config.order.forEach((code, index) => {
    const key = LABELS[code].key;
    const rank = (index + 1) as 1 | 2 | 3;
    items[key].rank = rank;
    if (rank === 1) {
      items[key].isCrownRecommended = true;
    }
  });

  // Tạo công thức chuỗi hiển thị
  const formulaParts: string[] = [];
  const displayParts: string[] = [];

  for (let i = 0; i < config.order.length; i++) {
    const code = config.order[i];
    formulaParts.push(code);
    displayParts.push(LABELS[code].labelFull);

    if (i < config.order.length - 1) {
      const isEqual = config.equalWithNext?.[i] ?? false;
      const isNextNaAndLevel1 = i === 1 && config.order[2] === "NA" && config.naLevel1;
      const sep = isEqual ? " = " : isNextNaAndLevel1 ? " >> " : " > ";
      formulaParts.push(sep);
      displayParts.push(sep);
    }
  }

  return {
    orderFormula: formulaParts.join(""),
    displayOrderVi: displayParts.join(""),
    summaryVi: config.summary,
    items,
  };
}
