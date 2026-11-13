/**
 * src/agent/swarm/types.ts
 *
 * Định nghĩa cấu trúc cho Đội Đặc Nhiệm AI Agent (LEIBO Teyvat Multi-Agent Swarm)
 * và Giao thức Tác chiến Phối hợp Agent-to-Agent (A2A Collaboration Protocol).
 */

export type AgentRole = 
  | "coordinator"    // Paimon - Điều phối viên & Hướng dẫn tổng thể
  | "theorycraft"    // Keqing - Chuyên gia Tối ưu Build, DPS & Thánh di vật
  | "mechanics"      // Zhongli - Bách khoa Cơ chế, Phản ứng & Lore
  | "resource"       // Albedo - Chiến lược gia Nông nghiệp, Bí cảnh & Nhựa
  | "gacha";         // Yanfei - Chuyên gia Xác suất Pity & Lịch sử Cầu nguyện

export type SwarmRole = AgentRole | "swarm";

export interface AgentPersona {
  id: AgentRole;
  name: string;
  title: string;
  titleVi: string;
  avatarUrl: string;
  element: "Anemo" | "Electro" | "Geo" | "Pyro" | "Cryo" | "Hydro" | "Dendro";
  accentColor: string;
  badge: string;
  greeting: string;
  description: string;
  specialties: string[];
  systemPrompt: string;
}

export interface SwarmMessage {
  id: string;
  role: "user" | "assistant" | "system";
  agentId?: AgentRole;
  content: string;
  timestamp: number;
}

/**
 * Phân đoạn nhiệm vụ được giao cho từng Agent trong phiên hội chẩn A2A.
 */
export interface A2ATaskSlice {
  role: AgentRole;
  titleVi: string;
  subtask: string;
  expectedDeliverable: string;
}

/**
 * Kế hoạch tác chiến liên minh Agent-to-Agent do Coordinator (Paimon) khởi xướng.
 */
export interface A2ACollaborationPlan {
  objective: string;
  lead: AgentRole;
  collaborators: AgentRole[];
  slices: A2ATaskSlice[];
  consensusRequirement: string;
}

/**
 * Khối phát biểu của từng Agent trong dòng đối thoại A2A.
 */
export interface ParsedA2ABlock {
  speakerRole: AgentRole;
  speakerName: string;
  avatarUrl: string;
  badge: string;
  accentColor: string;
  addressedTo?: AgentRole[];
  content: string;
}
