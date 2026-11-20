/**
 * src/agent/harness/types.ts
 *
 * Định nghĩa kiểu dữ liệu cho LEIBO Agent Harness.
 * Hệ thống bao bọc kiểm soát AI Agent: Cấp phát context, kiểm soát tool,
 * quản lý budget (token/chi phí/timeout), thẩm định output và bảo vệ production.
 */

import type { z } from "zod";

export type HarnessTrigger =
  | "manual"
  | "scheduled"
  | "ci"
  | "github_issue"
  | "api_request";

export type HarnessDomain =
  | "data"        // Game data, sync, integrity, version
  | "asset"       // Icons, splash art, visual mapping
  | "build"       // KQM character builds, benchmarks, weapon/artifact ranking
  | "code_quality"; // Lint, types, translations, testing

export interface HarnessBudget {
  maxSteps: number;
  maxTokens: number;
  maxCostUSD: number;
  timeoutMs: number;
}

export interface HarnessPolicy {
  readOnly: boolean;
  allowedTools: string[];
  blockedTools: string[];
  requireApprovalForWrite: boolean;
  outputSchema?: z.ZodTypeAny;
}

export interface HarnessTask<TContext = Record<string, unknown>> {
  taskId: string;
  domain: HarnessDomain;
  trigger: HarnessTrigger;
  instruction: string;
  context: TContext;
  budget: Partial<HarnessBudget>;
  policy: Partial<HarnessPolicy>;
}

export type HarnessExecutionState =
  | "PENDING"
  | "RUNNING"
  | "EVALUATING"
  | "COMPLETED"
  | "FAILED"
  | "TIMEOUT"
  | "BUDGET_EXCEEDED"
  | "BLOCKED_REQUIRES_APPROVAL";

export interface HarnessTraceStep {
  stepIndex: number;
  timestamp: string;
  type: "thought" | "tool_call" | "tool_result" | "verification" | "policy_intercept";
  name?: string;
  input?: unknown;
  output?: unknown;
  durationMs: number;
  error?: string;
}

export interface HarnessReport<TOutput = unknown> {
  taskId: string;
  domain: HarnessDomain;
  trigger: HarnessTrigger;
  state: HarnessExecutionState;
  success: boolean;
  durationMs: number;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
  estimatedCostUSD: number;
  output: TOutput | null;
  validationPassed: boolean;
  validationErrors: string[];
  trace: HarnessTraceStep[];
  requiresApproval: boolean;
  pendingAction?: {
    tool: string;
    input: unknown;
    reason: string;
  };
}
