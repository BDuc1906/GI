import { prisma } from "@/lib/db/prisma";
import type { TeamCompositionRecommendation, TeamMember } from "./team-types";

export class TeamCompositionService {
  async recommend(characterId: string): Promise<TeamCompositionRecommendation> {
    const mainChar = await prisma.character.findUnique({
      where: { id: characterId },
      select: {
        id: true,
        name: true,
        vision: true,
        rarity: true,
      },
    });

    if (!mainChar) {
      throw new Error(`Không tìm thấy nhân vật với ID: ${characterId}`);
    }

    // Lấy các nhân vật khác để tạo đội hình
    const teammates = await prisma.character.findMany({
      where: {
        NOT: {
          id: characterId,
        },
      },
      select: {
        id: true,
        name: true,
        vision: true,
        weaponType: true,
        rarity: true,
      },
      orderBy: {
        rarity: "desc",
      },
      take: 20,
    });

    // Tính synergy và chọn top 3
    const scoredTeammates = teammates
      .map((tm) => ({
        ...tm,
        synergy: this.calculateSynergy(mainChar.vision, tm.vision),
        role: this.assignRole(tm.vision, mainChar.vision),
        reason: this.generateReason(tm.name, mainChar.name, tm.vision),
      }))
      .sort((a, b) => b.synergy - a.synergy)
      .slice(0, 3);

    const recommendedTeamMembers: TeamMember[] = scoredTeammates.map((t) => ({
      id: t.id,
      name: t.name,
      vision: t.vision,
      weaponType: t.weaponType,
      rarity: t.rarity,
      synergy: t.synergy,
      role: t.role,
      reason: t.reason,
    }));

    if (recommendedTeamMembers.length === 0) {
      throw new Error("Không tìm thấy nhân vật để tạo đội hình");
    }

    const teamComposition = this.generateTeamComposition(mainChar.name, recommendedTeamMembers);
    const teamSynergy = this.generateTeamSynergy(mainChar.vision, recommendedTeamMembers);

    return {
      mainCharacterId: mainChar.id,
      mainCharacterName: mainChar.name,
      mainCharacterVision: mainChar.vision,
      recommendedTeamMembers,
      teamComposition,
      teamSynergy,
    };
  }

  private calculateSynergy(mainVision: string | null, teamVision: string | null): number {
    // Cơ bản: cùng nguyên tố +40, khác +20
    // Có thể mở rộng với logic reaction sau
    if (!mainVision || !teamVision) return 20;
    if (mainVision === teamVision) return 40;
    return 20;
  }

  private assignRole(vision: string | null, mainVision: string | null): string {
    // Đơn giản: phân chia role dựa trên nguyên tố
    if (!vision) return "Support";
    if (vision === mainVision) return "Sub-DPS";
    if (vision === "Hydro" || vision === "Dendro") return "Support";
    return "Sub-DPS";
  }

  private generateReason(name: string, mainName: string, vision: string | null): string {
    return `${name} hỗ trợ tốt cho ${mainName} với nguyên tố ${vision || "không xác định"}.`;
  }

  private generateTeamComposition(mainName: string, members: TeamMember[]): string {
    const roles = members.map((m) => m.role).join(", ");
    return `Đội hình: ${mainName} (Main DPS) + ${members.map((m) => m.name).join(", ")} (${roles})`;
  }

  private generateTeamSynergy(mainVision: string | null, members: TeamMember[]): string {
    const avgSynergy = Math.round(members.reduce((sum, m) => sum + m.synergy, 0) / members.length);
    return `Độ hỗ trợ trung bình: ${avgSynergy}%. Đội hình này phù hợp với ${mainVision} DPS.`;
  }
}
