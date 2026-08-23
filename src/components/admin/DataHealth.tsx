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

/**
 * Chi tiết lần quét "Quét & tự sửa dữ liệu" GẦN NHẤT trong phiên làm
 * việc này (không lưu lịch sử — muốn xem lịch sử nhiều lần trước, xem
 * RecentActivity/AuditLog). Quan trọng nhất là danh sách "skipped" —
 * AutoFixEngine.runFullScan() bỏ qua record nào và VÌ SAO (vd chưa cấu
 * hình live provider, hoặc field live không khớp field cho phép sửa)
 * — thông tin này KHÔNG nằm trong AuditLog (AuditLog chỉ ghi những lần
 * thực sự sửa thành công/thất bại, không ghi những lần "không có gì để
 * sửa" hoặc "bỏ qua vì lỗi khi lấy dữ liệu live").
 */
export function DataHealth({ lastScan }: DataHealthProps) {
  const t = useTranslations("Admin");

  if (!lastScan) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-6 text-center text-text-muted text-sm">
        {t("noScanYet")}
      </div>
    );
  }

  const hasSkipped = lastScan.skipped.length > 0;

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
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
          <h3 className="text-xs text-text-muted uppercase tracking-wider mb-2">{t("fixed")}</h3>
          <ul className="space-y-1 text-sm">
            {lastScan.fixes.map((f, i) => (
              <li key={i} className="text-text-secondary">
                <span className="text-text-primary">{f.entityType}/{f.entityId}</span> — {t("ruleLabel")}{" "}
                <span className="text-gold-bright">{f.rule}</span> — {t("fieldLabel")}: {f.fields.join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasSkipped && (
        <div>
          <h3 className="text-xs text-text-muted uppercase tracking-wider mb-2">{t("skipped")}</h3>
          <ul className="space-y-1 text-sm max-h-64 overflow-y-auto">
            {lastScan.skipped.map((s, i) => (
              <li key={i} className="text-text-muted">
                <span className="text-text-secondary">{s.entityType}/{s.entityId}</span> — {s.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}