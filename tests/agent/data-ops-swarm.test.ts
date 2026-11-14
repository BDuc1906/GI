import { describe, it, expect, vi } from "vitest";
import {
  runIngestionStep,
  runSanitizingStep,
  runVerificationStep,
  runPublishingStep,
  runContinuousDataOpsPipeline,
} from "@/agent/swarm/data-ops-swarm";
import { planA2ACollaboration } from "@/agent/swarm/a2a-protocol";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    character: {
      count: vi.fn().mockResolvedValue(140),
      groupBy: vi.fn().mockResolvedValue([
        { gameVersion: "5.3" },
        { gameVersion: "5.4" },
        { gameVersion: "7.2" },
      ]),
      findMany: vi.fn().mockResolvedValue([
        {
          id: "mavuika",
          name: "Mavuika",
          vision: "Pyro",
          weaponType: "Claymore",
          gameVersion: "5.3",
          iconUrl: "/local-genshin-assets/characters/icon/mavuika.png",
          splashUrl: "/local-genshin-assets/characters/splash/mavuika.webp",
          constellations: [{}, {}, {}, {}, {}, {}],
          talents: [{}, {}, {}],
          statsByLevel: [{ level: 90 }],
          ascensionMaterials: [{ phase: 1 }, { phase: 2 }],
        },
        {
          id: "mitya",
          name: "Mitya",
          vision: "Pyro",
          weaponType: "Polearm",
          gameVersion: "7.2",
          iconUrl: "/local-genshin-assets/characters/icon/mitya.png",
          splashUrl: "/local-genshin-assets/characters/splash/mitya.webp",
          constellations: [{}, {}, {}, {}, {}, {}],
          talents: [{}, {}, {}],
          statsByLevel: [{ level: 90 }],
          ascensionMaterials: [{ phase: 1 }, { phase: 2 }],
        },
      ]),
    },
    weapon: { count: vi.fn().mockResolvedValue(254) },
    artifactSet: { count: vi.fn().mockResolvedValue(63) },
    material: { count: vi.fn().mockResolvedValue(571) },
    domain: { count: vi.fn().mockResolvedValue(99) },
    pipelineRun: { findMany: vi.fn().mockResolvedValue([]) },
  },
}));

vi.mock("@/agent/audit/AuditLogger", () => ({
  createAuditLog: vi.fn().mockResolvedValue({ id: "audit-1" }),
}));

describe("A2A Continuous DataOps Swarm", () => {
  it("Paimon runs ingestion step and discovers highest version", async () => {
    const res = await runIngestionStep();
    expect(res.step).toBe("ingest");
    expect(res.agentName).toBe("Paimon");
    expect(res.metrics["Phiên bản cao nhất"]).toBe("v7.2");
    expect(res.metrics["Tổng nhân vật"]).toBe(140);
  });

  it("Albedo sanitizes dataset, separating non-playable characters", async () => {
    const res = await runSanitizingStep();
    expect(res.step).toBe("filter");
    expect(res.agentName).toBe("Albedo");
    expect(res.metrics["Nhân vật chơi được"]).toBeGreaterThan(0);
  });

  it("Keqing audits invariants and asserts authentic assets without Kazuha placeholder", async () => {
    const res = await runVerificationStep();
    expect(res.step).toBe("verify");
    expect(res.agentName).toBe("Keqing");
    expect(res.metrics["Lệch cung mệnh"]).toBe(0);
    expect(res.metrics["Lỗi gán nhầm avatar"]).toBe(0);
  });

  it("Zhongli records audit log and publishes certified dataset", async () => {
    const res = await runPublishingStep({ recordAudit: true });
    expect(res.step).toBe("update");
    expect(res.agentName).toBe("Zhongli");
    expect(res.metrics["Ghi nhật ký AuditLog"]).toBe(true);
  });

  it("Runs the full autonomous 4-stage pipeline sequentially", async () => {
    const report = await runContinuousDataOpsPipeline({ recordAudit: false });
    expect(report.steps.length).toBe(4);
    expect(report.steps.map((s) => s.step)).toEqual(["ingest", "filter", "verify", "update"]);
    expect(report.certifiedBySwarm).toBe(true);
  });

  it("A2A protocol plans data-ops swarm when prompted about data filtering and verification", () => {
    const plan = planA2ACollaboration("đội ai agent lấy lọc kiểm tra chính xác dữ liệu cập nhật dữ liệu liên tục");
    expect(plan.collaborators).toContain("resource");
    expect(plan.collaborators).toContain("theorycraft");
    expect(plan.collaborators).toContain("mechanics");

    const albedoSlice = plan.slices.find((s) => s.role === "resource");
    expect(albedoSlice?.titleVi).toContain("Lọc & Chuẩn Hóa Dữ Liệu");

    const keqingSlice = plan.slices.find((s) => s.role === "theorycraft");
    expect(keqingSlice?.titleVi).toContain("Kiểm Định Tính Toàn Vẹn & Bất Biến");

    const zhongliSlice = plan.slices.find((s) => s.role === "mechanics");
    expect(zhongliSlice?.titleVi).toContain("Sổ Cái & Xuất Bản Dữ Liệu");
  });
});
