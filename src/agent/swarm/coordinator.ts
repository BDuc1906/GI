/**
 * src/agent/swarm/coordinator.ts
 *
 * Bộ não điều phối Swarm: Tự động phân tích câu hỏi người dùng và kích hoạt Agent chuyên môn phù hợp nhất.
 */

import type { AgentRole } from "./types";
import { SWARM_PERSONAS } from "./personas";

const ROLE_KEYWORDS: Record<AgentRole, string[]> = {
  theorycraft: [
    "build", "thánh di vật", "artifact", "dps", "chỉ số", "crit", "crit value", "cv", 
    "roll value", "rv", "sát thương", "vũ khí", "trấn", "kqm", "nạp", "er", "tinh thông", 
    "chấm điểm", "so sánh đồ", "enka", "uid"
  ],
  mechanics: [
    "cơ chế", "phản ứng", "icd", "gauge", "ấn", "bào khiên", "phá khiên", "kháng", 
    "res shred", "loren", "cốt truyện", "lịch sử", "ma thần", "celestia", "khaenri", 
    "snezhnaya", "fontaine", "natlan", "pneuma", "ousia", "dạ hồn", "nightsoul"
  ],
  resource: [
    "nguyên liệu", "farm", "nhựa", "resin", "bí cảnh", "domain", "thứ mấy", "mora", 
    "sách kinh nghiệm", "đột phá", "thăng cấp", "thiên phú", "hoa đặc sản", "kho đồ", 
    "tiết kiệm nhựa"
  ],
  gacha: [
    "pity", "gacha", "quay", "banner", "cầu nguyện", "lệch rate", "50/50", "bảo hiểm", 
    "soft pity", "nguyên thạch", "primogem", "uigf", "vận may", "trúng rate", "lịch sử ước nguyện"
  ],
  coordinator: [
    "chào", "paimon", "leibo", "hướng dẫn", "tìm kiếm", "tra cứu", "wiki"
  ],
};

/**
 * Phân tích nội dung và chọn Agent chuyên môn phù hợp nhất
 */
export function routeSwarmAgent(userPrompt: string, forcedRole?: AgentRole): AgentRole {
  if (forcedRole && SWARM_PERSONAS[forcedRole]) {
    return forcedRole;
  }

  const text = userPrompt.toLowerCase();

  // Đếm điểm cho từng chuyên gia
  let bestRole: AgentRole = "coordinator";
  let maxMatches = 0;

  for (const [role, keywords] of Object.entries(ROLE_KEYWORDS) as Array<[AgentRole, string[]]>) {
    let matches = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) {
        matches += kw.length > 4 ? 2 : 1; // ưu tiên từ khóa dài, rõ nghĩa
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      bestRole = role;
    }
  }

  return bestRole;
}

export const determineSpecialistForQuery = routeSwarmAgent;
