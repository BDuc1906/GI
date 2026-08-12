// src/components/admin/DataHealth.tsx
"use client";

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
  if (!lastScan) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center text-muted text-sm">
        Chưa chạy lần quét nào trong phiên này. Bấm &quot;🔍 Quét & tự sửa dữ liệu&quot; ở panel bên trên.
      </div>
    );
  }

  const hasSkipped = lastScan.skipped.length > 0;

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">
        🩺 Kết quả lần quét gần nhất
      </h2>

      <div className="flex gap-6 text-sm mb-4">
        <div>
          <span className="text-2xl font-semibold text-green-400">{lastScan.fixedCount}</span>
          <span className="text-muted ml-2">đã sửa</span>
        </div>
        <div>
          <span className="text-2xl font-semibold text-yellow-400">{lastScan.skipped.length}</span>
          <span className="text-muted ml-2">bỏ qua</span>
        </div>
      </div>

      {lastScan.fixes.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs text-muted uppercase tracking-wider mb-2">Đã sửa</h3>
          <ul className="space-y-1 text-sm">
            {lastScan.fixes.map((f, i) => (
              <li key={i} className="text-secondary">
                <span className="text-primary">{f.entityType}/{f.entityId}</span> — rule{" "}
                <span className="text-gold-bright">{f.rule}</span> — field: {f.fields.join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasSkipped && (
        <div>
          <h3 className="text-xs text-muted uppercase tracking-wider mb-2">Bỏ qua</h3>
          <ul className="space-y-1 text-sm max-h-64 overflow-y-auto">
            {lastScan.skipped.map((s, i) => (
              <li key={i} className="text-muted">
                <span className="text-secondary">{s.entityType}/{s.entityId}</span> — {s.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
