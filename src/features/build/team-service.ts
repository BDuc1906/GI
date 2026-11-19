import { prisma } from "@/lib/db/prisma";
import { getCharacterBuild } from "@/data/character-builds-data";
import { buildCharacterTeamVariants, CHARACTER_ID_ALIASES } from "@/core/game/character-team-variants";
import type { TeamCompositionRecommendation, TeamMember } from "./team-types";

/**
 * TeamCompositionService - Dịch vụ gợi ý đội hình chiến thuật cho nhân vật.
 *
 * TUÂN THỦ NGUYÊN TẮC:
 * - 100% sử dụng đội hình chiến thuật chuẩn phản ứng từ Meta Curated Teams.
 * - TUYỆT ĐỐI KHÔNG tính synergy theo kiểu cùng nguyên tố +40%, khác nguyên tố +20%.
 * - Khi chưa có dữ liệu kiểm định, thông báo rõ ràng, không tự ghép nhân vật bừa bãi.
 */
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

    const curated = getCharacterBuild(mainChar.id);

    // 1. Kiểm tra đội hình từ Curated Build
    if (curated && curated.teams && curated.teams.length > 0) {
      const topTeam = curated.teams[0];
      const rawTeammateIds = topTeam.teammateIds;
      const resolvedIds = rawTeammateIds.map((id) => CHARACTER_ID_ALIASES[id] ?? id);

      const dbTeammates = await prisma.character.findMany({
        where: { id: { in: resolvedIds } },
        select: {
          id: true,
          name: true,
          vision: true,
          weaponType: true,
          rarity: true,
        },
      });

      const teammateMap = new Map(dbTeammates.map((t) => [t.id, t]));

      const recommendedTeamMembers: TeamMember[] = [];
      for (let i = 0; i < resolvedIds.length; i++) {
        const id = resolvedIds[i];
        const dbChar = teammateMap.get(id);
        const role = topTeam.teammateRoles[i] || "Hỗ trợ (Support)";

        if (dbChar) {
          recommendedTeamMembers.push({
            id: dbChar.id,
            name: dbChar.name,
            vision: dbChar.vision,
            weaponType: dbChar.weaponType,
            rarity: dbChar.rarity,
            synergy: 95 - i * 3,
            role,
            reason: `${dbChar.name} giữ vai trò ${role}, kết hợp cùng ${mainChar.name} kích hoạt phản ứng ${topTeam.reactionsVi.join(", ")}.`,
          });
        }
      }

      if (recommendedTeamMembers.length > 0) {
        return {
          mainCharacterId: mainChar.id,
          mainCharacterName: mainChar.name,
          mainCharacterVision: mainChar.vision,
          recommendedTeamMembers,
          teamComposition: `Đội hình: ${topTeam.nameVi} — ${topTeam.situationVi}`,
          teamSynergy: `Phản ứng chủ lực: ${topTeam.reactionsVi.join(" & ")}. Cộng hưởng: ${topTeam.resonancesVi.join(", ")}.`,
        };
      }
    }

    // 2. Fallback sang Canonical Variants đã kiểm định
    const allChars = await prisma.character.findMany({
      select: {
        id: true,
        name: true,
        vision: true,
        rarity: true,
        iconUrl: true,
      },
    });
    const map = new Map(allChars.map((c) => [c.id, { ...c, localizedName: c.name }]));

    const variants = buildCharacterTeamVariants(
      {
        id: mainChar.id,
        name: mainChar.name,
        vision: mainChar.vision || "Anemo",
        rarity: mainChar.rarity || 5,
      },
      map,
      "vi"
    );

    if (variants.length > 0) {
      const topVariant = variants[0];
      const teammates = topVariant.members.slice(1);

      const recommendedTeamMembers: TeamMember[] = teammates.map((m, idx) => ({
        id: m.id,
        name: m.name,
        vision: m.vision,
        weaponType: null,
        rarity: m.rarity,
        synergy: 95 - idx * 3,
        role: m.roleVi,
        reason: `${m.name} (${m.roleVi}) phối hợp phản ứng ${topVariant.reactionsVi.join(", ")} cùng ${mainChar.name}.`,
      }));

      return {
        mainCharacterId: mainChar.id,
        mainCharacterName: mainChar.name,
        mainCharacterVision: mainChar.vision,
        recommendedTeamMembers,
        teamComposition: `${topVariant.nameVi} (${topVariant.archetypeVi}) — ${topVariant.situationVi}`,
        teamSynergy: `Phản ứng: ${topVariant.reactionsVi.join(" & ")}. Cộng hưởng: ${topVariant.resonancesVi.join(", ")}.`,
      };
    }

    // 3. Nếu chưa có dữ liệu kiểm định -> Không tự ghép ngẫu nhiên theo nguyên tố!
    return {
      mainCharacterId: mainChar.id,
      mainCharacterName: mainChar.name,
      mainCharacterVision: mainChar.vision,
      recommendedTeamMembers: [],
      teamComposition: `Hiện chưa có đội hình chiến thuật được xác minh cho ${mainChar.name}.`,
      teamSynergy: `Hệ thống không tự tạo đội hình giả lập chỉ bằng so sánh nguyên tố.`,
    };
  }
}
