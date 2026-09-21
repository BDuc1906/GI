// src/components/admin/DataHealth.tsx
"use client";

import { useTranslations } from "next-intl";

export interface FixScanSummary {
  fixedCount: number;
  fixes: Array<{ entityType: string; entityId: string; rule: string; fields: string[] }>;
  skipped: Array<{ entityType: string; entityId: string; reason: string }>;
}

interface DataHealthProps {
  lastScan: FixScanSummary | null;
}

export function DataHealth({ lastScan }: DataHealthProps) {
  const t = useTranslations("Admin");

  if (!lastScan) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-6 text-center text-text-muted text-sm font-medium">
        {t("noScanYet")}
      </div>
    );
  }

  const hasSkipped = lastScan.skipped.length > 0;

  return (
    <div className="bg-bg-card border border-border rounded-xl p-6">
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
        🩺 {t("lastScanResult")}
      </h2>

      <div className="flex gap-6 text-sm mb-4">
        <div>
          <span className="text-2xl font-semibold text-green-400">{lastScan.fixedCount}</span>
          <span className="text-text-muted ml-2">{t("fixed")}</span>
        </div>
        <div>
          <span className="text-2xl font-semibold text-yellow-400">{lastScan.skipped.length}</span>
          <span className="text-text-muted ml-2">{t("skipped")}</span>
        </div>
      </div>

      {lastScan.fixes.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs text-text-muted uppercase tracking-wider mb-2 font-semibold">{t("fixed")}</h3>
          <ul className="space-y-1 text-sm max-h-48 overflow-y-auto">
            {lastScan.fixes.map((f, i) => (
              <li key={i} className="text-text-secondary p-2 bg-bg-secondary/50 rounded-lg">
                <span className="text-text-primary font-medium">{f.entityType}/{f.entityId}</span> — {t("ruleLabel")}{" "}
                <span className="text-gold-bright">{f.rule}</span> — {t("fieldLabel")}: {f.fields.join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasSkipped && (
        <div>
          <h3 className="text-xs text-text-muted uppercase tracking-wider mb-2 font-semibold">{t("skipped")}</h3>
          <ul className="space-y-1 text-sm max-h-48 overflow-y-auto">
            {lastScan.skipped.map((s, i) => (
              <li key={i} className="text-text-muted p-2 bg-bg-secondary/30 rounded-lg">
                <span className="text-text-secondary">{s.entityType}/{s.entityId}</span> — {s.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}