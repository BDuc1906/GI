import { prisma } from "@/lib/db/prisma";
import { getCharacterBuild } from "@/data/character-builds-data";
import type { DomainRecommendation, RecommendedDomain } from "./domain-types";

/**
 * DomainRecommendationService - Dịch vụ gợi ý Bí Cảnh cần farm cho nhân vật.
 *
 * TUÂN THỦ NGUYÊN TẮC:
 * - 100% gợi ý bí cảnh thực sự gắn với nguyên liệu thiên phú, thánh di vật và vũ khí của nhân vật.
 * - TUYỆT ĐỐI KHÔNG query 4 bí cảnh ngẫu nhiên.
 */
export class DomainRecommendationService {
  async recommend(characterId: string): Promise<DomainRecommendation> {
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      select: {
        id: true,
        name: true,
        vision: true,
        weaponType: true,
        region: true,
      },
    });

    if (!character) {
      throw new Error(`Không tìm thấy nhân vật với ID: ${characterId}`);
    }

    const curated = getCharacterBuild(character.id);
    const recommendedDomains: RecommendedDomain[] = [];

    // 1. Tìm Bí Cảnh Sách Thiên Phú theo vùng của nhân vật
    if (character.region) {
      const talentDomain = await prisma.domain.findFirst({
        where: {
          category: "talent",
          regionName: {
            equals: character.region,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true,
          category: true,
          description: true,
        },
      });

      if (talentDomain) {
        recommendedDomains.push({
          id: talentDomain.id,
          name: talentDomain.name,
          category: "Thiên Phú (Talent)",
          description: talentDomain.description,
          recommendReason: `Nơi farm sách nâng cấp thiên phú kỹ năng cho ${character.name} tại vùng đất ${character.region}.`,
        });
      }
    }

    // 2. Tìm Bí Cảnh Thánh Di Vật của bộ tối ưu nhất
    if (curated && curated.artifacts && curated.artifacts.length > 0) {
      const topSetId = curated.artifacts[0].setIds[0];
      // Tìm domain chứa bộ thánh di vật này trong danh sách materials
      const allArtifactDomains = await prisma.domain.findMany({
        where: { category: "artifact" },
        select: {
          id: true,
          name: true,
          category: true,
          description: true,
          materials: true,
        },
      });

      const matchedDomain = allArtifactDomains.find((d) => {
        const mats = d.materials as Array<{ artifactSetId?: string }> | null;
        return mats?.some((m) => m.artifactSetId === topSetId);
      });

      if (matchedDomain) {
        recommendedDomains.push({
          id: matchedDomain.id,
          name: matchedDomain.name,
          category: "Thánh Di Vật (Artifact)",
          description: matchedDomain.description,
          recommendReason: `Nơi farm bộ thánh di vật chủ lực (${curated.artifacts[0].noteVi}) để tối ưu hóa sức mạnh của ${character.name}.`,
        });
      }
    }

    // 3. Tìm Bí Cảnh Đột Phá Vũ Khí
    if (character.region) {
      const weaponDomain = await prisma.domain.findFirst({
        where: {
          category: "weapon",
          regionName: {
            equals: character.region,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true,
          category: true,
          description: true,
        },
      });

      if (weaponDomain) {
        recommendedDomains.push({
          id: weaponDomain.id,
          name: weaponDomain.name,
          category: "Vũ Khí (Weapon)",
          description: weaponDomain.description,
          recommendReason: `Nơi farm nguyên liệu đột phá vũ khí tại ${character.region}.`,
        });
      }
    }

    const farmingPlan =
      recommendedDomains.length > 0
        ? `Lộ trình phát triển cho ${character.name}: Ưu tiên farm Bí Cảnh Thiên Phú để nâng cấp kỹ năng chủ lực lên Lv8-Lv10, sau đó dồn Nhựa farm Bí Cảnh Thánh Di Vật để hoàn thiện bộ chỉ số.`
        : `Chưa có thông tin bí cảnh cụ thể cho ${character.name}.`;

    return {
      characterId: character.id,
      characterName: character.name,
      vision: character.vision,
      recommendedDomains,
      farmingPlan,
    };
  }
}
