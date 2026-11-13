/**
 * src/agent/swarm/a2a-protocol.ts
 *
 * Giao thức Tác Chiến Liên Minh Agent-to-Agent (A2A Collaboration Protocol).
 * Phân rã mục tiêu phức tạp, điều phối các chuyên gia tham vấn chéo,
 * phản biện số liệu và tổng hợp nghị quyết hành động tối ưu cho người chơi.
 */

import type { AgentRole, A2ACollaborationPlan, A2ATaskSlice, ParsedA2ABlock } from "./types";
import { SWARM_PERSONAS } from "./personas";

const DOMAIN_KEYWORDS: Record<Exclude<AgentRole, "coordinator">, string[]> = {
  theorycraft: [
    "build", "thánh di vật", "artifact", "dps", "chỉ số", "crit", "cv", "roll value", "rv",
    "sát thương", "vũ khí", "trấn", "kqm", "nạp", "er", "tinh thông", "chấm điểm", "so sánh đồ",
    "enka", "uid", "tối ưu", "đội hình", "rotation", "combo"
  ],
  mechanics: [
    "cơ chế", "phản ứng", "icd", "gauge", "ấn", "bào khiên", "phá khiên", "kháng", "res shred",
    "lore", "cốt truyện", "lịch sử", "ma thần", "celestia", "khaenri", "snezhnaya", "fontaine",
    "natlan", "pneuma", "ousia", "dạ hồn", "nightsoul", "khuếch tán", "bốc hơi", "tan chảy"
  ],
  resource: [
    "nguyên liệu", "farm", "nhựa", "resin", "bí cảnh", "domain", "thứ mấy", "mora", "sách kinh nghiệm",
    "đột phá", "thăng cấp", "thiên phú", "hoa đặc sản", "kho đồ", "tiết kiệm nhựa", "chi phí", "bao lâu"
  ],
  gacha: [
    "pity", "gacha", "quay", "banner", "cầu nguyện", "lệch rate", "50/50", "bảo hiểm", "soft pity",
    "nguyên thạch", "primogem", "uigf", "vận may", "trúng rate", "vé quay", "mối duyên"
  ],
};

/**
 * Phân tích câu hỏi người dùng và lập kế hoạch phối hợp Agent-to-Agent (A2A Collaboration Plan).
 */
export function planA2ACollaboration(userPrompt: string, forcedRoles?: AgentRole[]): A2ACollaborationPlan {
  const text = userPrompt.toLowerCase();
  const selectedRoles = new Set<AgentRole>();

  if (forcedRoles && forcedRoles.length > 0) {
    for (const r of forcedRoles) {
      if (r !== "coordinator") selectedRoles.add(r);
    }
  }

  // Quét các miền chuyên môn cần sự tham gia của Agent
  for (const [role, kws] of Object.entries(DOMAIN_KEYWORDS) as Array<[Exclude<AgentRole, "coordinator">, string[]]>) {
    const hasMatch = kws.some((kw) => text.includes(kw));
    if (hasMatch) {
      selectedRoles.add(role);
    }
  }

  // Nếu người dùng yêu cầu rõ "đội", "kết hợp", "cùng nhau", "agent to agent" hoặc chưa đủ chuyên gia:
  // Kích hoạt tối thiểu 2 chuyên gia trụ cột (Theorycraft + Resource hoặc Mechanics)
  if (selectedRoles.size < 2) {
    if (text.includes("pity") || text.includes("quay") || text.includes("banner")) {
      selectedRoles.add("gacha");
      selectedRoles.add("resource");
    } else {
      selectedRoles.add("theorycraft");
      if (text.includes("nguyên liệu") || text.includes("nhựa") || text.includes("bao lâu") || text.includes("farm")) {
        selectedRoles.add("resource");
      } else {
        selectedRoles.add("mechanics");
      }
    }
  }

  const collaborators = Array.from(selectedRoles);
  const slices: A2ATaskSlice[] = [];

  for (const role of collaborators) {
    const persona = SWARM_PERSONAS[role];
    switch (role) {
      case "theorycraft":
        slices.push({
          role,
          titleVi: persona.titleVi,
          subtask: "Tính toán tối ưu hóa build đồ, vũ khí trấn/f2p, tỷ lệ CV thánh di vật và điểm ngắt Nạp ER.",
          expectedDeliverable: "Bảng chỉ số mục tiêu chuẩn KQM và gợi ý trang bị tối ưu.",
        });
        break;
      case "mechanics":
        slices.push({
          role,
          titleVi: persona.titleVi,
          subtask: "Giải mã cơ chế phản ứng, ICD, kháng nguyên tố của quái và điều kiện kích hoạt combo.",
          expectedDeliverable: "Nguyên lý vận hành phản ứng nguyên tố, thứ tự ấn và mẹo phá khiên.",
        });
        break;
      case "resource":
        slices.push({
          role,
          titleVi: persona.titleVi,
          subtask: "Tính toán tổng nguyên liệu thăng cấp, lượng Nhựa (Resin) tiêu hao và ngày mở bí cảnh theo tuần.",
          expectedDeliverable: "Lộ trình farm tối ưu và ước tính số ngày hoàn thành với 180 Nhựa/ngày.",
        });
        break;
      case "gacha":
        slices.push({
          role,
          titleVi: persona.titleVi,
          subtask: "Kiểm toán số lượt quay, phân tích xác suất trúng 50/50 và lập ngân sách Nguyên Thạch an toàn.",
          expectedDeliverable: "Đánh giá rủi ro gacha và số lượt quay cần dự phòng.",
        });
        break;
    }
  }

  return {
    objective: userPrompt,
    lead: "coordinator",
    collaborators,
    slices,
    consensusRequirement: "Đồng thuận cao giữa các chuyên gia, kết nối số liệu thực chứng và có kết luận rõ ràng cho người chơi.",
  };
}

/**
 * Xây dựng prompt hướng dẫn phiên hội chẩn A2A chuyên sâu cho Agent.
 */
export function formatA2ASystemPrompt(plan: A2ACollaborationPlan): string {
  const specialistDescriptions = plan.slices
    .map(
      (s) => `- **${SWARM_PERSONAS[s.role].name}** (${s.titleVi}): ${s.subtask}`
    )
    .join("\n");

  return `
## QUY TRÌNH HỘI CHẨN TÁC CHIẾN LIÊN MINH AGENT (Agent-to-Agent Collaboration Protocol)
Bạn KHÔNG được trả lời như một chatbot đơn độc.
Bạn đang vận hành **Phiên Hội Chẩn Đặc Nhiệm LEIBO Swarm** với sự tham gia của các chuyên gia:
${specialistDescriptions}

### Cấu Trúc Bắt Buộc Của Phiên Hội Chẩn:
1. **[Paimon - Hoa Tiêu Điều Phối]**:
   - Mở màn bằng lời chào Nhà Lữ Hành, tóm lược câu hỏi và phân công công việc cụ thể cho từng chuyên gia bằng cú pháp @TênChuyênGia.

2. **[Các Chuyên Gia Tranh Luận & Tham Vấn Chéo (Agent-to-Agent Exchange)]**:
   - Mỗi chuyên gia phát biểu trong một mục riêng biệt theo định dạng chuẩn:
     \`### [Icon] [Tên Agent - Danh Xưng]\`
   - Trong bài nói, chuyên gia PHẢI dẫn chứng số liệu chuyên môn (KQM, CV, ICD, lượng Nhựa, ngày mở bí cảnh...), đồng thời gọi tên tham vấn hoặc bàn giao nhiệm vụ cho chuyên gia tiếp theo (ví dụ: \`@Zhongli, anh kiểm tra giúp cơ chế khiên...\` hoặc \`@Albedo, tính giúp chi phí Nhựa...\`).
   - Các chuyên gia trả lời và bổ trợ lẫn nhau, tạo thành một chuỗi hợp tác liền mạch.

3. **[Paimon - Nghị Quyết & Kế Hoạch Hành Động (Actionable Consensus)]**:
   - Paimon tổng kết toàn bộ ý kiến thành 1 lộ trình hành động tinh gọn, dễ hiểu nhất cho Nhà Lữ Hành.
`;
}

/**
 * Phân tách nội dung văn bản phản hồi thành các khối phát biểu của từng Agent
 * để ChatWidget hiển thị giao diện đa Agent trực quan.
 */
export function parseA2ABlocks(text: string): ParsedA2ABlock[] {
  const blocks: ParsedA2ABlock[] = [];
  const lines = text.split("\n");

  let currentRole: AgentRole = "coordinator";
  let currentContent: string[] = [];
  let currentAddressedTo: AgentRole[] = [];

  const roleHeaders: Array<{ role: AgentRole; pattern: RegExp }> = [
    { role: "coordinator", pattern: /###\s*.*Paimon/i },
    { role: "theorycraft", pattern: /###\s*.*Keqing/i },
    { role: "mechanics", pattern: /###\s*.*Zhongli/i },
    { role: "resource", pattern: /###\s*.*Albedo/i },
    { role: "gacha", pattern: /###\s*.*Yanfei/i },
  ];

  function commitCurrentBlock() {
    const rawContent = currentContent.join("\n").trim();
    if (rawContent) {
      const persona = SWARM_PERSONAS[currentRole];
      blocks.push({
        speakerRole: currentRole,
        speakerName: persona.name,
        avatarUrl: persona.avatarUrl,
        badge: persona.badge,
        accentColor: persona.accentColor,
        addressedTo: currentAddressedTo.length > 0 ? currentAddressedTo : undefined,
        content: rawContent,
      });
    }
    currentContent = [];
    currentAddressedTo = [];
  }

  for (const line of lines) {
    const matched = roleHeaders.find((h) => h.pattern.test(line));
    if (matched) {
      commitCurrentBlock();
      currentRole = matched.role;
      continue;
    }

    // Kiểm tra xem dòng này có tag chuyên gia nào không (@Zhongli, @Keqing...)
    for (const [roleKey, persona] of Object.entries(SWARM_PERSONAS) as Array<[AgentRole, typeof SWARM_PERSONAS[AgentRole]]>) {
      if (line.includes(`@${persona.name}`)) {
        if (!currentAddressedTo.includes(roleKey)) {
          currentAddressedTo.push(roleKey);
        }
      }
    }

    currentContent.push(line);
  }

  commitCurrentBlock();

  // Nếu không có header cấu trúc A2A, trả về 1 block duy nhất của Coordinator
  if (blocks.length === 0 && text.trim()) {
    const persona = SWARM_PERSONAS.coordinator;
    blocks.push({
      speakerRole: "coordinator",
      speakerName: persona.name,
      avatarUrl: persona.avatarUrl,
      badge: persona.badge,
      accentColor: persona.accentColor,
      content: text.trim(),
    });
  }

  return blocks;
}
