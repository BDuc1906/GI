import { describe, it, expect, vi } from "vitest";
import { AgentHarness } from "@/agent/harness/AgentHarness";
import type { HarnessTask } from "@/agent/harness/types";
import { z } from "zod";

// Mock AuditLogger to avoid database calls during unit testing
vi.mock("@/agent/audit/AuditLogger", () => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
}));

describe("AgentHarness Controller", () => {
  it("cho phép thực thi thành công và kiểm định đúng schema đầu ra", async () => {
    const OutputSchema = z.object({
      characterId: z.string(),
      recommendedWeapon: z.string(),
      benchmarkDps: z.number().positive(),
    });

    const task: HarnessTask = {
      taskId: "task-001",
      domain: "build",
      trigger: "ci",
      instruction: "Thẩm định build Kazuha KQMS",
      context: { character: "kazuha" },
      budget: { timeoutMs: 5000 },
      policy: {
        readOnly: true,
        outputSchema: OutputSchema,
      },
    };

    const result = await AgentHarness.runTask(task, async ({ recordTrace }) => {
      recordTrace({
        type: "thought",
        name: "AnalyzeKazuha",
        output: "Kazuha ưu tiên Freedom-Sworn Full EM",
        durationMs: 10,
      });

      return {
        characterId: "kaedehara-kazuha",
        recommendedWeapon: "Freedom-Sworn",
        benchmarkDps: 115,
      };
    });

    expect(result.success).toBe(true);
    expect(result.state).toBe("COMPLETED");
    expect(result.validationPassed).toBe(true);
    expect(result.output?.characterId).toBe("kaedehara-kazuha");
    expect(result.trace.length).toBeGreaterThanOrEqual(2); // PreFlightGate + AnalyzeKazuha
  });

  it("chặn đứng các tool phá hủy / sửa đổi dữ liệu khi ở chế độ readOnly", async () => {
    const task: HarnessTask = {
      taskId: "task-002",
      domain: "data",
      trigger: "manual",
      instruction: "Kiểm tra tính toàn vẹn dữ liệu",
      context: {},
      budget: { timeoutMs: 5000 },
      policy: {
        readOnly: true,
        allowedTools: ["searchData", "compareData"],
      },
    };

    const result = await AgentHarness.runTask(task, async ({ isToolAllowed }) => {
      const canRead = isToolAllowed("searchData");
      const canFix = isToolAllowed("fixData"); // Destructive tool
      const canDrop = isToolAllowed("dropTable"); // Blocked tool

      expect(canRead).toBe(true);
      expect(canFix).toBe(false);
      expect(canDrop).toBe(false);

      return { canRead, canFix, canDrop };
    });

    expect(result.success).toBe(true);
    expect(result.trace.some((t) => t.type === "policy_intercept")).toBe(true);
  });

  it("thất bại và ghi nhận lỗi khi output vi phạm Zod Schema", async () => {
    const StrictSchema = z.object({
      version: z.string().regex(/^v\d+\.\d+$/),
      rating: z.enum(["S", "A", "B"]),
    });

    const task: HarnessTask = {
      taskId: "task-003",
      domain: "asset",
      trigger: "ci",
      instruction: "Kiểm tra phiên bản asset",
      context: {},
      budget: { timeoutMs: 5000 },
      policy: {
        readOnly: true,
        outputSchema: StrictSchema,
      },
    };

    const result = await AgentHarness.runTask(task, async () => {
      return {
        version: "invalid_version_string",
        rating: "UNKNOWN_RATING", // Không khớp enum
      };
    });

    expect(result.success).toBe(false);
    expect(result.state).toBe("FAILED");
    expect(result.validationPassed).toBe(false);
    expect(result.validationErrors.length).toBeGreaterThan(0);
  });

  it("kích hoạt Timeout Watchdog khi tác vụ chạy quá ngân sách thời gian", async () => {
    const task: HarnessTask = {
      taskId: "task-004",
      domain: "code_quality",
      trigger: "scheduled",
      instruction: "Tác vụ chạy quá lâu cần watchdog ngắt",
      context: {},
      budget: { timeoutMs: 100 }, // Timeout 100ms
      policy: { readOnly: true },
    };

    const result = await AgentHarness.runTask(task, async () => {
      // Giả lập tác vụ treo 300ms
      await new Promise((resolve) => setTimeout(resolve, 300));
      return "Done";
    });

    expect(result.success).toBe(false);
    expect(result.state).toBe("TIMEOUT");
    expect(result.validationErrors[0]).toContain("Harness Timeout");
  });
});
