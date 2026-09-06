import type { BuildRecommendation } from "./types";
import type { BuildComparison } from "./compare-types";
import type { ArtifactRecommendation } from "./artifact-types";
import type { DomainRecommendation } from "./domain-types";

export type FullBuildPlan = {
  character: {
    id: string;
    name: string;
    vision: string | null;
    weaponType: string | null;
    rarity: number | null;
  };
  weaponRecommendation: BuildRecommendation | null;
  artifactRecommendation: ArtifactRecommendation | null;
  domainRecommendation: DomainRecommendation | null;
  buildSummary: string;
};
