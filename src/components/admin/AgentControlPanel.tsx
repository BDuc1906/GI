// src/components/admin/AgentControlPanel.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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

export function AgentControlPanel({ adminKey, onAdminKeyChange, onActionComplete, onFixResult }: AgentControlPanelProps) {
  const t = useTranslations("Admin");
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
      setResult({ ok: false, message: t("enterAdminKeyFirst") });
      return;
    }
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
    if (!adminKey) {
      setResult({ ok: false, message: t("enterAdminKeyFirst") });
      return;
    }
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
        🤖 {t("agentControlTitle")}
      </h2>

      <div className="mb-6">
        <label className="block text-xs text-text-muted mb-2 font-medium" htmlFor="admin-key-input">
          {t("adminKeyLabel")}
        </label>
        <input
          id="admin-key-input"
          type="password"
          value={adminKey}
          onChange={(e) => onAdminKeyChange(e.target.value)}
          placeholder={t("adminKeyPlaceholder")}
          className="w-full px-4 py-3 rounded-lg bg-bg-input border border-border text-text-primary text-sm outline-none focus:border-border-strong transition-all"
          autoComplete="off"
        />
        <p className="text-[10px] text-text-muted mt-2 font-medium">{t("adminKeyStorageNote")}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={runFix}
          disabled={running !== null}
          className="px-6 py-3 rounded-lg border border-border bg-bg-input hover:border-border-strong text-sm text-text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {running === "fix" ? `⏳ ${t("scanning")}` : `🔍 ${t("scanAndAutoFix")}`}
        </button>
        <button
          onClick={runSync}
          disabled={running !== null}
          className="px-6 py-3 rounded-lg border border-border bg-bg-input hover:border-border-strong text-sm text-text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {running === "sync" ? `⏳ ${t("triggering")}` : `🔄 ${t("syncViaGithubActions")}`}
        </button>
      </div>

      {result && (
        <div
          className={`mt-4 text-sm rounded-lg border px-3 py-2 ${
            result.ok ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-red-500/30 text-red-400 bg-red-500/10"
          }`}
        >
          <p>{result.ok ? "✅" : "⚠️"} {result.message}</p>
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