import { prisma } from "@/lib/db/prisma";
import type { FullBuildPlan } from "./full-plan-types";
import { BuildService } from "./service";
import { ArtifactRecommendationService } from "./artifact-service";
import { DomainRecommendationService } from "./domain-service";

export class FullBuildPlanService {
  private buildService = new BuildService();
  private artifactService = new ArtifactRecommendationService();
  private domainService = new DomainRecommendationService();

  async plan(characterId: string): Promise<FullBuildPlan> {
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      select: {
        id: true,
        name: true,
        vision: true,
        weaponType: true,
        rarity: true,
      },
    });

    if (!character) {
      throw new Error(`Không tìm thấy nhân vật với ID: ${characterId}`);
    }

    // Fetch all recommendations in parallel
    const [weaponRec, artifactRec, domainRec] = await Promise.allSettled([
      this.buildService.recommend({
        characterId,
      }),
      this.artifactService.recommend(characterId),
      this.domainService.recommend(characterId),
    ]);

    const weaponRecommendation = weaponRec.status === "fulfilled" ? weaponRec.value : null;
    const artifactRecommendation = artifactRec.status === "fulfilled" ? artifactRec.value : null;
    const domainRecommendation = domainRec.status === "fulfilled" ? domainRec.value : null;

    const buildSummary = this.generateComprehensiveSummary(
      character.name,
      weaponRecommendation,
      artifactRecommendation,
      domainRecommendation
    );

    return {
      character: {
        id: character.id,
        name: character.name,
        vision: character.vision,
        weaponType: character.weaponType,
        rarity: character.rarity,
      },
      weaponRecommendation,
      artifactRecommendation,
      domainRecommendation,
      buildSummary,
    };
  }

  private generateComprehensiveSummary(
    characterName: string,
    weaponRec: any,
    artifactRec: any,
    domainRec: any
  ): string {
    const parts: string[] = [`Bản đồ xây dựng hoàn chỉnh cho ${characterName}:`];

    if (weaponRec) {
      parts.push(`Vũ khí: ${weaponRec.recommendedWeapon?.name || "Chưa xác định"}`);
    }

    if (artifactRec?.recommendedArtifacts?.[0]) {
      const topArtifact = artifactRec.recommendedArtifacts[0].name;
      parts.push(`Thánh di vật: ${topArtifact}`);
    }

    if (domainRec?.recommendedDomains?.[0]) {
      const topDomain = domainRec.recommendedDomains[0].name;
      parts.push(`Ưu tiên farm: ${topDomain}`);
    }

    return parts.join(". ");
  }
}
