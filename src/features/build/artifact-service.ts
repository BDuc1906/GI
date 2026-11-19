import { prisma } from "@/lib/db/prisma";
import { getCharacterBuild } from "@/data/character-builds-data";
import type { ArtifactRecommendation, RecommendedArtifact } from "./artifact-types";

/**
 * ArtifactRecommendationService - Dịch vụ gợi ý Thánh Di Vật cho nhân vật.
 *
 * TUÂN THỦ NGUYÊN TẮC:
 * - 100% sử dụng dữ liệu bộ thánh di vật được biên tập và kiểm định từ Meta Curated Build.
 * - TUYỆT ĐỐI KHÔNG sắp xếp alphabet A-Z rồi lấy 3 bộ đầu tiên.
 * - Khi chưa có dữ liệu kiểm định, thông báo rõ ràng, không tự bịa đề xuất.
 */
export class ArtifactRecommendationService {
  async recommend(characterId: string): Promise<ArtifactRecommendation> {
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      select: {
        id: true,
        name: true,
        vision: true,
      },
    });

    if (!character) {
      throw new Error(`Không tìm thấy nhân vật với ID: ${characterId}`);
    }

    const curated = getCharacterBuild(character.id);

    // 1. Nếu có dữ liệu kiểm định, lấy chính xác các bộ thánh di vật từ curated build
    if (curated && curated.artifacts && curated.artifacts.length > 0) {
      // Thu thập danh sách ID các bộ trong build theo thứ tự ưu tiên
      const prioritizedSetIds: string[] = [];
      for (const a of curated.artifacts) {
        for (const sId of a.setIds) {
          if (!prioritizedSetIds.includes(sId)) {
            prioritizedSetIds.push(sId);
          }
        }
      }

      const dbSets = await prisma.artifactSet.findMany({
        where: {
          id: { in: prioritizedSetIds },
        },
        select: {
          id: true,
          name: true,
          rarityRange: true,
          twoPieceBonus: true,
          fourPieceBonus: true,
        },
      });

      const setMap = new Map(dbSets.map((s) => [s.id, s]));

      // Giữ đúng thứ tự ưu tiên của curated build
      const recommendedArtifacts: RecommendedArtifact[] = [];
      for (const sId of prioritizedSetIds) {
        const found = setMap.get(sId);
        if (found) {
          recommendedArtifacts.push({
            id: found.id,
            name: found.name,
            rarityRange: found.rarityRange,
            twoPieceBonus: found.twoPieceBonus,
            fourPieceBonus: found.fourPieceBonus,
          });
        }
      }

      if (recommendedArtifacts.length > 0) {
        const topArtifact = curated.artifacts[0];
        const topNames = topArtifact.setIds.map((id) => setMap.get(id)?.name || id).join(" / ");
        const sands = curated.mainStats?.sands || "Theo vai trò";
        const goblet = curated.mainStats?.goblet || "Theo vai trò";
        const circlet = curated.mainStats?.circlet || "Theo vai trò";
        const buildSummary = `Bộ thánh di vật tối ưu cho ${character.name}: ${topArtifact.mode === "4pc" ? "Bộ 4 món" : "Ghép 2+2"} ${topNames} (Ưu tiên #${topArtifact.priority}) - ${topArtifact.noteVi}. Cát: ${sands}, Ly: ${goblet}, Nón: ${circlet}.`;

        return {
          characterId: character.id,
          characterName: character.name,
          vision: character.vision,
          recommendedArtifacts,
          buildSummary,
        };
      }
    }

    // 2. Nếu chưa có dữ liệu kiểm định -> Không tự bịa theo alphabet!
    return {
      characterId: character.id,
      characterName: character.name,
      vision: character.vision,
      recommendedArtifacts: [],
      buildSummary: `Hiện chưa có cấu hình thánh di vật được xác minh cho ${character.name}. Hệ thống không tự tạo đề xuất theo bảng chữ cái.`,
    };
  }
}
