// src/components/admin/AgentControlPanel.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { FixScanSummary } from "./DataHealth";

interface AgentControlPanelProps {
  adminKey?: string;
  onAdminKeyChange?: (key: string) => void;
  onActionComplete: () => void;
  onFixResult: (result: FixScanSummary) => void;
  isAuthenticated?: boolean;
}

interface ActionResult {
  ok: boolean;
  message: string;
  detail?: string;
}

export function AgentControlPanel({ adminKey = "", onAdminKeyChange, onActionComplete, onFixResult, isAuthenticated = true }: AgentControlPanelProps) {
  const t = useTranslations("Admin");
  const [running, setRunning] = useState<"fix" | "sync" | null>(null);
  const [result, setResult] = useState<ActionResult | null>(null);

  async function callAdminApi(path: string, body: Record<string, unknown> = {}) {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (adminKey) headers["Authorization"] = `Bearer ${adminKey}`;

    const res = await fetch(path, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      credentials: "same-origin",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      throw new Error(json?.error?.message || `HTTP ${res.status}`);
    }
    return json.data;
  }

  async function runFix() {
    setRunning("fix");
    setResult(null);
    try {
      const data = await callAdminApi("/api/admin/fix");
      setResult({
        ok: true,
        message: t("fixedNRecords", { count: data.fixedCount }),
        detail: data.skipped?.length ? t("nRecordsSkipped", { count: data.skipped.length }) : undefined,
      });
      onFixResult({ fixedCount: data.fixedCount, fixes: data.fixes || [], skipped: data.skipped || [] });
      onActionComplete();
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : t("unknownError") });
    } finally {
      setRunning(null);
    }
  }

  async function runSync() {
    setRunning("sync");
    setResult(null);
    try {
      const data = await callAdminApi("/api/admin/sync");
      setResult({
        ok: true,
        message: data.result?.message || t("syncWorkflowTriggered"),
        detail: data.result?.workflowRunUrl,
      });
      onActionComplete();
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : t("unknownError") });
    } finally {
      setRunning(null);
    }
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl p-6">
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
        {t("agentControlTitle")}
      </h2>

      {isAuthenticated ? (
        <div className="mb-6 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-sm">✓</span>
            <span className="text-xs text-emerald-200 font-medium">
              Phiên quản trị đã kích hoạt (HttpOnly Session)
            </span>
          </div>
          <span className="text-[10px] text-emerald-300/70 font-mono">Bảo mật</span>
        </div>
      ) : (
        <div className="mb-6">
          <label className="block text-xs text-text-muted mb-2 font-medium" htmlFor="admin-key-input">
            {t("adminKeyLabel")}
          </label>
          <input
            id="admin-key-input"
            type="password"
            value={adminKey}
            onChange={(e) => onAdminKeyChange?.(e.target.value)}
            placeholder={t("adminKeyPlaceholder")}
            className="w-full px-4 py-3 rounded-lg bg-bg-input border border-border text-text-primary text-sm outline-none focus:border-border-strong transition-all"
            autoComplete="off"
          />
          <p className="text-[10px] text-text-muted mt-2 font-medium">{t("adminKeyStorageNote")}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={runFix}
          disabled={running !== null}
          className="px-6 py-3 rounded-lg border border-border bg-bg-input hover:border-border-strong text-sm text-text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {running === "fix" ? `${t("scanning")}` : `${t("scanAndAutoFix")}`}
        </button>
        <button
          onClick={runSync}
          disabled={running !== null}
          className="px-6 py-3 rounded-lg border border-border bg-bg-input hover:border-border-strong text-sm text-text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {running === "sync" ? `${t("triggering")}` : `${t("syncViaGithubActions")}`}
        </button>
      </div>

      {result && (
        <div
          className={`mt-4 text-sm rounded-lg border px-3 py-2 ${
            result.ok ? "border-success/30 text-success bg-success/10" : "border-danger/30 text-danger bg-danger/10"
          }`}
        >
          <p>{result.message}</p>
          {result.detail && <p className="text-xs mt-1 opacity-80 break-all font-medium">{result.detail}</p>}
        </div>
      )}

      <p className="text-[11px] text-text-muted mt-4 font-medium">
        {t.rich("syncFootnote", {
          code: (chunks) => <code className="text-text-secondary">{chunks}</code>,
        })}
      </p>
    </div>
  );
}
