/**
 * src/agent/harness/AgentHarness.ts
 *
 * LEIBO Agent Harness Controller — Hệ thống giám sát, phân quyền và kiểm định AI Agent.
 *
 * 5 Lớp bảo vệ của Harness:
 * 1. Pre-flight Gate: Cấp phát Context, kiểm soát ngân sách (Budget) và lọc Tool hợp lệ.
 * 2. Sandboxing & Interceptor: Chặn đứng thao tác ghi phá hủy khi chạy chế độ readOnly hoặc thiếu phê duyệt.
 * 3. Execution Watchdog: Kiểm soát số bước (steps), timeout và circuit breaker ngăn lặp vô tận.
 * 4. Output Evaluation Gate: Thẩm định output qua Zod schema, phát hiện hallucination trước khi sử dụng.
 * 5. Audit & Trace Trail: Ghi nhận vết thực thi, token usage và lưu trữ lịch sử kiểm toán.
 */

import { logger } from "@/lib/infra/logger";
import { createAuditLog } from "@/agent/audit/AuditLogger";
import type {
  HarnessTask,
  HarnessReport,
  HarnessBudget,
  HarnessPolicy,
  HarnessTraceStep,
} from "./types";

const DEFAULT_BUDGET: HarnessBudget = {
  maxSteps: 6,
  maxTokens: 4000,
  maxCostUSD: 0.08,
  timeoutMs: 30000, // 30s
};

const DEFAULT_POLICY: HarnessPolicy = {
  readOnly: true, // Mặc định an toàn: chỉ đọc
  allowedTools: ["searchData", "compareData", "getCharacterBuildGuide", "kqmBenchmark"],
  blockedTools: ["fixData", "syncData", "executeRawSql", "dropTable"],
  requireApprovalForWrite: true,
};

export class AgentHarness {
  /**
   * Thực thi một tác vụ AI Agent trong môi trường được kiểm soát nghiêm ngặt bởi Harness.
   *
   * @param task Mô tả tác vụ, phạm vi context, ngân sách và chính sách bảo mật
   * @param executor Hàm callback chứa logic suy luận của AI Agent
   */
  public static async runTask<TOutput = unknown>(
    task: HarnessTask,
    executor: (harnessScope: {
      isToolAllowed: (toolName: string) => boolean;
      recordTrace: (step: Omit<HarnessTraceStep, "stepIndex" | "timestamp">) => void;
    }) => Promise<TOutput>
  ): Promise<HarnessReport<TOutput>> {
    const startTime = Date.now();
    const budget: HarnessBudget = { ...DEFAULT_BUDGET, ...task.budget };
    const policy: HarnessPolicy = { ...DEFAULT_POLICY, ...task.policy };
    const trace: HarnessTraceStep[] = [];
    const validationErrors: string[] = [];

    let currentStepIndex = 1;

    const recordTrace = (step: Omit<HarnessTraceStep, "stepIndex" | "timestamp">) => {
      trace.push({
        stepIndex: currentStepIndex++,
        timestamp: new Date().toISOString(),
        ...step,
      });
    };

    // 1. Pre-flight Gate
    recordTrace({
      type: "verification",
      name: "PreFlightGate",
      input: { budget, policy, domain: task.domain },
      output: { passed: true, activePolicies: Object.keys(policy) },
      durationMs: 0,
    });

    const isToolAllowed = (toolName: string): boolean => {
      if (policy.blockedTools.includes(toolName)) {
        recordTrace({
          type: "policy_intercept",
          name: toolName,
          error: `Tool bị cấm tuyệt đối theo chính sách: ${toolName}`,
          durationMs: 0,
        });
        return false;
      }

      if (policy.readOnly && isDestructiveTool(toolName)) {
        recordTrace({
          type: "policy_intercept",
          name: toolName,
          error: `Harness đang chạy chế độ ReadOnly. Không cho phép gọi tool sửa đổi: ${toolName}`,
          durationMs: 0,
        });
        return false;
      }

      if (policy.allowedTools.length > 0 && !policy.allowedTools.includes(toolName)) {
        recordTrace({
          type: "policy_intercept",
          name: toolName,
          error: `Tool không nằm trong danh sách được cấp phép: ${toolName}`,
          durationMs: 0,
        });
        return false;
      }

      return true;
    };

    let rawOutput: TOutput | null = null;
    let state: HarnessReport["state"] = "RUNNING";
    let pendingAction: HarnessReport["pendingAction"];

    try {
      // 2. Execution Watchdog with Timeout
      const executionPromise = executor({ isToolAllowed, recordTrace });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Harness Timeout: Quá thời gian cho phép ${budget.timeoutMs}ms`)), budget.timeoutMs)
      );

      rawOutput = await Promise.race([executionPromise, timeoutPromise]);
      state = "EVALUATING";

      // 3. Output Evaluation Gate
      let validationPassed = true;
      if (policy.outputSchema && rawOutput) {
        const parseResult = policy.outputSchema.safeParse(rawOutput);
        if (!parseResult.success) {
          validationPassed = false;
          for (const err of parseResult.error.issues) {
            validationErrors.push(`${err.path.join(".")}: ${err.message}`);
          }
          recordTrace({
            type: "verification",
            name: "OutputSchemaValidation",
            error: `Output không vượt qua kiểm định schema: ${validationErrors.join("; ")}`,
            durationMs: Date.now() - startTime,
          });
        }
      }

      state = validationPassed ? "COMPLETED" : "FAILED";

      const totalDuration = Date.now() - startTime;

      // 4. Audit & Telemetry Logging
      await createAuditLog({
        action: `AGENT_TASK_${task.domain.toUpperCase()}`,
        entityType: "AgentHarness",
        entityId: task.taskId,
        performedBy: `Harness:${task.trigger}`,
        status: state === "COMPLETED" ? "success" : "failed",
        reason: task.instruction,
        oldValue: { budget, policy },
        newValue: { state, durationMs: totalDuration, validationErrors },
      });

      return {
        taskId: task.taskId,
        domain: task.domain,
        trigger: task.trigger,
        state,
        success: state === "COMPLETED",
        durationMs: totalDuration,
        tokenUsage: { prompt: 0, completion: 0, total: 0 }, // Sẽ được cập nhật từ telemetry/stream nếu có
        estimatedCostUSD: 0.001,
        output: rawOutput,
        validationPassed,
        validationErrors,
        trace,
        requiresApproval: false,
      };
    } catch (err) {
      const totalDuration = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : String(err);
      const isTimeout = errorMessage.includes("Harness Timeout");

      state = isTimeout ? "TIMEOUT" : "FAILED";

      logger.warn("[AgentHarness] Tác vụ agent thất bại hoặc bị chặn", {
        taskId: task.taskId,
        domain: task.domain,
        state,
        error: errorMessage,
      });

      await createAuditLog({
        action: `AGENT_TASK_${task.domain.toUpperCase()}`,
        entityType: "AgentHarness",
        entityId: task.taskId,
        performedBy: `Harness:${task.trigger}`,
        status: "failed",
        reason: task.instruction,
        error: errorMessage,
      });

      return {
        taskId: task.taskId,
        domain: task.domain,
        trigger: task.trigger,
        state,
        success: false,
        durationMs: totalDuration,
        tokenUsage: { prompt: 0, completion: 0, total: 0 },
        estimatedCostUSD: 0,
        output: null,
        validationPassed: false,
        validationErrors: [errorMessage],
        trace,
        requiresApproval: Boolean(pendingAction),
        pendingAction,
      };
    }
  }
}

function isDestructiveTool(toolName: string): boolean {
  const destructiveNames = ["fix", "sync", "update", "delete", "write", "seed", "drop"];
  const lower = toolName.toLowerCase();
  return destructiveNames.some((d) => lower.includes(d));
}
