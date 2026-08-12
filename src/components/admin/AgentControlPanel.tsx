// src/components/admin/AgentControlPanel.tsx
"use client";

import { useState } from "react";
import type { FixScanSummary } from "./DataHealth";

interface AgentControlPanelProps {
  adminKey: string;
  onAdminKeyChange: (key: string) => void;
  onActionComplete: () => void;
  onFixResult: (result: FixScanSummary) => void;
}

interface ActionResult {
  ok: boolean;
  message: string;
  detail?: string;
}

/**
 * Panel điều khiển thủ công: nhập ADMIN_API_KEY (lưu trong localStorage
 * của trình duyệt admin — KHÔNG gửi lên đâu khác ngoài header
 * Authorization của chính các request /api/admin/* dưới đây), trigger
 * "Quét & tự sửa dữ liệu" (AutoFixEngine) hoặc "Đồng bộ dữ liệu"
 * (trigger workflow GitHub Actions — xem DataSyncPipeline, KHÔNG ghi
 * thẳng DB).
 */
export function AgentControlPanel({ adminKey, onAdminKeyChange, onActionComplete, onFixResult }: AgentControlPanelProps) {
  const [running, setRunning] = useState<"fix" | "sync" | null>(null);
  const [result, setResult] = useState<ActionResult | null>(null);

  async function callAdminApi(path: string, body: Record<string, unknown> = {}) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      throw new Error(json?.error?.message || `HTTP ${res.status}`);
    }
    return json.data;
  }

  async function runFix() {
    if (!adminKey) {
      setResult({ ok: false, message: "Vui lòng nhập Admin Key trước." });
      return;
    }
    setRunning("fix");
    setResult(null);
    try {
      const data = await callAdminApi("/api/admin/fix");
      setResult({
        ok: true,
        message: `Đã tự sửa ${data.fixedCount} bản ghi.`,
        detail: data.skipped?.length ? `${data.skipped.length} bản ghi bị bỏ qua (xem chi tiết ở panel "Kết quả lần quét" bên dưới).` : undefined,
      });
      onFixResult({ fixedCount: data.fixedCount, fixes: data.fixes || [], skipped: data.skipped || [] });
      onActionComplete();
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : "Lỗi không xác định" });
    } finally {
      setRunning(null);
    }
  }

  async function runSync() {
    if (!adminKey) {
      setResult({ ok: false, message: "Vui lòng nhập Admin Key trước." });
      return;
    }
    setRunning("sync");
    setResult(null);
    try {
      const data = await callAdminApi("/api/admin/sync");
      setResult({
        ok: true,
        message: data.result?.message || "Đã trigger workflow đồng bộ.",
        detail: data.result?.workflowRunUrl,
      });
      onActionComplete();
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : "Lỗi không xác định" });
    } finally {
      setRunning(null);
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">
        🤖 Điều khiển AI Agent
      </h2>

      <div className="mb-4">
        <label className="block text-xs text-muted mb-1" htmlFor="admin-key-input">
          Admin Key (Authorization: Bearer …)
        </label>
        <input
          id="admin-key-input"
          type="password"
          value={adminKey}
          onChange={(e) => onAdminKeyChange(e.target.value)}
          placeholder="Dán ADMIN_API_KEY của bạn"
          className="w-full px-3 py-2 rounded-lg bg-[var(--bg-input)] border border-border text-primary text-sm outline-none focus:border-gold/60"
          autoComplete="off"
        />
        <p className="text-[10px] text-muted mt-1">
          Chỉ lưu trong trình duyệt này (localStorage) — không gửi đi đâu ngoài các request admin bên dưới.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={runFix}
          disabled={running !== null}
          className="px-4 py-2 rounded-lg border border-border bg-[var(--bg-input)] hover:border-gold/50 text-sm text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running === "fix" ? "⏳ Đang quét..." : "🔍 Quét & tự sửa dữ liệu"}
        </button>
        <button
          onClick={runSync}
          disabled={running !== null}
          className="px-4 py-2 rounded-lg border border-border bg-[var(--bg-input)] hover:border-gold/50 text-sm text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running === "sync" ? "⏳ Đang trigger..." : "🔄 Đồng bộ dữ liệu (qua GitHub Actions)"}
        </button>
      </div>

      {result && (
        <div
          className={`mt-4 text-sm rounded-lg border px-3 py-2 ${
            result.ok ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-red-500/30 text-red-400 bg-red-500/10"
          }`}
        >
          <p>{result.ok ? "✅" : "⚠️"} {result.message}</p>
          {result.detail && <p className="text-xs mt-1 opacity-80 break-all">{result.detail}</p>}
        </div>
      )}

      <p className="text-[11px] text-muted mt-3">
        &quot;Đồng bộ dữ liệu&quot; không ghi thẳng vào database — nó trigger workflow{" "}
        <code className="text-secondary">update-data.yml</code>, chạy trên DB test riêng, kiểm tra tính toàn
        vẹn, rồi tạo Pull Request để bạn review trước khi merge.
      </p>
    </div>
  );
}
