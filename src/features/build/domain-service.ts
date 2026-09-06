import { prisma } from "@/lib/db/prisma";
import type { DomainRecommendation, RecommendedDomain } from "./domain-types";

export class DomainRecommendationService {
  async recommend(characterId: string): Promise<DomainRecommendation> {
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      select: {
        id: true,
        name: true,
        vision: true,
        weaponType: true,
      },
    });

    if (!character) {
      throw new Error(`Không tìm thấy nhân vật với ID: ${characterId}`);
    }

    // Lấy các domain dùng để farm talent và weapon
    // Ưu tiên: Talent domain (hằng ngày) + Weapon domain (theo ngày trong tuần)
    const domains = await prisma.domain.findMany({
      where: {
        category: {
          in: ["Talent", "Weapon"],
        },
      },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
      },
      take: 4,
    });

    const recommendedDomains: RecommendedDomain[] = domains.map((d) => ({
      id: d.id,
      name: d.name,
      category: d.category,
      description: d.description,
      recommendReason: this.getRecommendReason(d.category, character.name),
    }));

    if (recommendedDomains.length === 0) {
      throw new Error("Không tìm thấy bí cảnh để gợi ý");
    }

    const farmingPlan = this.generateFarmingPlan(character.name, recommendedDomains);

    return {
      characterId: character.id,
      characterName: character.name,
      vision: character.vision,
      recommendedDomains,
      farmingPlan,
    };
  }

  private getRecommendReason(category: string | null, characterName: string): string {
    if (category === "Talent") {
      return `${characterName} cần farm kỹ năng để nâng cấp`;
    }
    if (category === "Weapon") {
      return `${characterName} cần farm vũ khí để tăng sức mạnh`;
    }
    return `Bí cảnh liên quan đến ${characterName}`;
  }

  private generateFarmingPlan(characterName: string, domains: RecommendedDomain[]): string {
    const categories = domains.map((d) => d.category).join(" và ");
    return `${characterName} nên farm ${categories} để phát triển. Ưu tiên talent trước, sau đó là vũ khí.`;
  }
}
