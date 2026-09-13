import { prisma } from "@/lib/db/prisma";
import type { ArtifactRecommendation, RecommendedArtifact } from "./artifact-types";

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

    // Lấy các bộ artifact 5 sao (hàng đầu) + 4 sao (thay thế)
    const artifacts = await prisma.artifactSet.findMany({
      where: {
        rarityRange: {
          hasSome: [5, 4],
        },
      },
      select: {
        id: true,
        name: true,
        rarityRange: true,
        twoPieceBonus: true,
        fourPieceBonus: true,
      },
      orderBy: {
        name: "asc",
      },
      take: 8,
    });

    // Chọn top 3 artifact để recommend
    const recommendedArtifacts: RecommendedArtifact[] = artifacts.slice(0, 3).map((a) => ({
      id: a.id,
      name: a.name,
      rarityRange: a.rarityRange,
      twoPieceBonus: a.twoPieceBonus,
      fourPieceBonus: a.fourPieceBonus,
    }));

    if (recommendedArtifacts.length === 0) {
      throw new Error("Không tìm thấy bộ thánh di vật để gợi ý");
    }

    const buildSummary = this.generateSummary(character.name, recommendedArtifacts);

    return {
      characterId: character.id,
      characterName: character.name,
      vision: character.vision,
      recommendedArtifacts,
      buildSummary,
    };
  }

  private generateSummary(characterName: string, artifacts: RecommendedArtifact[]): string {
    const artifactNames = artifacts.map((a) => a.name).join(", ");
    return `${characterName} nên sử dụng bộ thánh di vật: ${artifactNames} để tối ưu hóa sức mạnh.`;
  }
}
