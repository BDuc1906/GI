import { describe, it, expect } from "vitest";
import {
  SWARM_PERSONAS,
  SWARM_AGENTS_LIST,
  determineSpecialistForQuery,
  planA2ACollaboration,
  formatA2ASystemPrompt,
  parseA2ABlocks,
} from "@/agent/swarm";
import { getSystemPrompt } from "@/agent/core/prompts";

describe("LEIBO AI Specialist Swarm", () => {
  it("should define all 5 core specialists with complete personas", () => {
    expect(SWARM_AGENTS_LIST).toHaveLength(5);
    const roles = ["coordinator", "theorycraft", "mechanics", "resource", "gacha"];

    for (const role of roles) {
      const persona = SWARM_PERSONAS[role as keyof typeof SWARM_PERSONAS];
      expect(persona).toBeDefined();
      expect(persona.name).toBeTruthy();
      expect(persona.avatarUrl).toBeTruthy();
      expect(persona.badge).toBeTruthy();
      expect(persona.systemPrompt).toBeTruthy();
      expect(persona.greeting).toBeTruthy();
      expect(persona.specialties.length).toBeGreaterThan(0);
    }
  });

  it("should accurately route user intents to the appropriate specialist", () => {
    // Theorycrafting & build
    expect(determineSpecialistForQuery("Tư vấn build Hu Tao và điểm CV thánh di vật")).toBe("theorycraft");
    expect(determineSpecialistForQuery("Thánh di vật này có đạt chuẩn KQM không?")).toBe("theorycraft");

    // Mechanics & lore
    expect(determineSpecialistForQuery("Giải thích cơ chế ICD và Gauge Theory")).toBe("mechanics");
    expect(determineSpecialistForQuery("Lịch sử của Celestia và Khaenri'ah")).toBe("mechanics");

    // Resource & resin
    expect(determineSpecialistForQuery("Cần bao nhiêu Nhựa để nâng Ayaka lên level 90?")).toBe("resource");
    expect(determineSpecialistForQuery("Lịch bí cảnh hôm nay mở những sách gì?")).toBe("resource");

    // Gacha & pity
    expect(determineSpecialistForQuery("Tỷ lệ trúng 50/50 banner nhân vật là bao nhiêu?")).toBe("gacha");
    expect(determineSpecialistForQuery("Bao nhiêu roll thì chạm hard pity?")).toBe("gacha");

    // Default / general
    expect(determineSpecialistForQuery("Xin chào Paimon!")).toBe("coordinator");
  });

  it("should inject specialist persona instructions into system prompt", () => {
    const promptKeqing = getSystemPrompt({
      userName: "Traveler",
      userId: "u123",
      sessionId: "s123",
      tools: "searchData, fetchLiveData",
      role: "theorycraft",
    });

    expect(promptKeqing).toContain("Keqing");
    expect(promptKeqing).toContain("KeqingMains (KQM)");
    expect(promptKeqing).toContain("Crit Value");

    const promptZhongli = getSystemPrompt({
      userName: "Traveler",
      userId: "u123",
      sessionId: "s123",
      tools: "searchData",
      role: "mechanics",
    });

    expect(promptZhongli).toContain("Zhongli");
    expect(promptZhongli).toContain("Gauge Theory");
  });

  it("should plan A2A collaboration across multiple specialists for multi-domain queries", () => {
    const query = "Tư vấn build Hu Tao bốc hơi, cơ chế khiên và tính toán lượng Nhựa cần farm";
    const plan = planA2ACollaboration(query);

    expect(plan.lead).toBe("coordinator");
    expect(plan.collaborators).toContain("theorycraft");
    expect(plan.collaborators).toContain("mechanics");
    expect(plan.collaborators).toContain("resource");
    expect(plan.slices.length).toBeGreaterThanOrEqual(3);

    const prompt = formatA2ASystemPrompt(plan);
    expect(prompt).toContain("QUY TRÌNH HỘI CHẨN TÁC CHIẾN LIÊN MINH AGENT");
    expect(prompt).toContain("Keqing");
    expect(prompt).toContain("Zhongli");
    expect(prompt).toContain("Albedo");
  });

  it("should parse multi-agent dialogue blocks with avatar and mentions", () => {
    const sampleDialogue = `
### 🧭 Paimon - Hoa Tiêu Điều Phối
Chào Nhà Lữ Hành! @Keqing hãy phân tích chỉ số Hu Tao, sau đó @Zhongli tư vấn cơ chế nhé!

### ⚡ Keqing - Chuyên Gia Build & DPS
@Zhongli: Hu Tao cần duy trì tỷ lệ 70% CR : 140% CD, dùng bộ Ma Nữ 4 món. Nhưng cô ấy cần khiên dày để sống sót.

### 🪨 Zhongli - Bách Khoa Cơ Chế
@Keqing: Khiên Ngọc của tôi giảm 20% toàn bộ kháng và hấp thụ 50,000 sát thương.

### 🧭 Paimon - Kế Hoạch Hành Động
Vậy là rõ rồi nhé Nhà Lữ Hành!
`;

    const blocks = parseA2ABlocks(sampleDialogue);
    expect(blocks.length).toBe(4);
    expect(blocks[0].speakerRole).toBe("coordinator");
    expect(blocks[1].speakerRole).toBe("theorycraft");
    expect(blocks[1].addressedTo).toContain("mechanics");
    expect(blocks[2].speakerRole).toBe("mechanics");
    expect(blocks[2].addressedTo).toContain("theorycraft");
    expect(blocks[3].speakerRole).toBe("coordinator");
  });
});
