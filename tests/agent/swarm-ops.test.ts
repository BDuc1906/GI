import { describe, it, expect } from "vitest";
import {
  runSwarmOperationsAudit,
  auditPaimonSiteOps,
  auditKeqingBuilds,
  auditZhongliDatabase,
  auditAlbedoAssets,
  auditYanfeiCompliance,
} from "@/agent/ops/swarm-ops";

describe("LEIBO AI Swarm Site Operations Hub", () => {
  it("should run individual agent ops audits and return structured metrics", async () => {
    const [paimon, keqing, zhongli, albedo, yanfei] = await Promise.all([
      auditPaimonSiteOps(),
      auditKeqingBuilds(),
      auditZhongliDatabase(),
      auditAlbedoAssets(),
      auditYanfeiCompliance(),
    ]);

    expect(paimon.agentRole).toBe("coordinator");
    expect(paimon.score).toBeGreaterThan(0);
    expect(paimon.metrics).toBeDefined();

    expect(keqing.agentRole).toBe("theorycraft");
    expect(keqing.score).toBeGreaterThanOrEqual(80);
    expect(keqing.metrics["Build chuyên sâu (Curated)"]).toBeDefined();

    expect(zhongli.agentRole).toBe("mechanics");
    expect(zhongli.score).toBeGreaterThan(0);

    expect(albedo.agentRole).toBe("resource");
    expect(albedo.score).toBe(98);

    expect(yanfei.agentRole).toBe("gacha");
    expect(yanfei.score).toBe(100);
  });

  it("should generate a complete Swarm Executive Briefing with high health score", async () => {
    const briefing = await runSwarmOperationsAudit();

    expect(briefing.timestamp).toBeTruthy();
    expect(briefing.overallHealthScore).toBeGreaterThanOrEqual(85);
    expect(briefing.coordinatorNoteVi).toContain("Paimon");
    expect(Object.keys(briefing.reports)).toHaveLength(5);
  });
});
