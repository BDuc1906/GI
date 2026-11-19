/**
 * src/core/assets/asset-audit-reporter.ts
 *
 * Sinh báo cáo & bảng đối chiếu hình ảnh trực quan (Visual Verification Matrix) cho LEIBO.
 * Tạo ra 2 sản phẩm:
 * 1. public/asset-audit-report.html: Giao diện trực quan cho người dùng / biên tập viên kiểm tra trực quan.
 * 2. public/local-genshin-assets/asset-validation-report.json: Báo cáo dữ liệu thô phục vụ CI.
 */

import fs from "fs";
import path from "path";
import type { AssetAuditResult, AssetManifest } from "./types";

export function generateHtmlAuditReport(
  manifest: AssetManifest,
  results: AssetAuditResult[]
): string {
  const generatedDate = new Date(manifest.generatedAt).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

  const cardsHtml = results
    .map(({ entry, isValid: _isValid, errors }) => {
      const meta = entry.metadata;
      const statusClass =
        entry.status === "VERIFIED"
          ? "status-verified"
          : entry.status === "INVALID"
            ? "status-invalid"
            : "status-missing";

      const statusText =
        entry.status === "VERIFIED"
          ? "XÁC MINH HỢP LỆ"
          : entry.status === "INVALID"
            ? "LỖI KIỂM ĐỊNH"
            : "THIẾU FILE (MISSING)";

      const dimText = meta ? `${meta.width} × ${meta.height}px` : "N/A";
      const ratioText = meta ? `${meta.aspectRatio}:1` : "N/A";
      const sizeText = meta ? `${(meta.fileSizeBytes / 1024).toFixed(1)} KB` : "N/A";
      const fmtText = meta?.actualFormat?.toUpperCase() ?? "N/A";

      const isVersion = entry.category === "version";
      const previewClass = isVersion ? "preview-landscape" : "preview-square";

      const errorListHtml =
        errors.length > 0
          ? `<ul class="error-list">${errors.map((e) => `<li>${e}</li>`).join("")}</ul>`
          : "";

      return `
      <div class="asset-card ${statusClass}" data-category="${entry.category}" data-status="${entry.status}" data-id="${entry.id}">
        <div class="preview-container ${previewClass}">
          ${
            entry.status === "MISSING"
              ? `<div class="placeholder-box"><span>KHÔNG CÓ ẢNH</span><small>${entry.id}</small></div>`
              : `<img src="${entry.targetPath}" alt="${entry.label}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'placeholder-box\\'>LỖI TẢI ẢNH</div>'" />`
          }
          <span class="badge category-badge">${entry.category}</span>
          <span class="badge ${statusClass}-badge">${statusText}</span>
        </div>
        <div class="card-body">
          <h3 class="card-title" title="${entry.label}">${entry.label}</h3>
          <p class="card-id font-mono">${entry.id} (${entry.assetType})</p>
          <div class="meta-grid">
            <div><span class="meta-label">Kích thước:</span> ${dimText}</div>
            <div><span class="meta-label">Tỷ lệ:</span> ${ratioText}</div>
            <div><span class="meta-label">Định dạng:</span> ${fmtText}</div>
            <div><span class="meta-label">Dung lượng:</span> ${sizeText}</div>
          </div>
          <p class="path-text font-mono" title="${entry.targetPath}">${entry.targetPath}</p>
          ${errorListHtml}
        </div>
      </div>
    `;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LEIBO - Bảng Đối Chiếu Hình Ảnh & Kiểm Định Asset (Asset Audit)</title>
  <style>
    :root {
      --bg: #0b0f19;
      --surface: #121826;
      --surface-border: #1f293d;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --accent: #00d2aa;
      --accent-glow: rgba(0, 210, 170, 0.2);
      --danger: #ef4444;
      --danger-bg: rgba(239, 68, 68, 0.15);
      --warning: #f59e0b;
      --success: #10b981;
      --success-bg: rgba(16, 185, 129, 0.15);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 24px;
    }
    header {
      max-width: 1400px;
      margin: 0 auto 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--surface-border);
    }
    h1 { font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 8px; }
    .subtitle { color: var(--text-muted); font-size: 14px; margin-bottom: 16px; }
    .stats-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 16px;
    }
    .stat-card {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      padding: 12px 20px;
      border-radius: 12px;
      min-width: 140px;
    }
    .stat-val { font-size: 24px; font-weight: 800; }
    .stat-val.success { color: var(--success); }
    .stat-val.danger { color: var(--danger); }
    .stat-val.warning { color: var(--warning); }
    .stat-lbl { font-size: 12px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }

    .controls {
      max-width: 1400px;
      margin: 0 auto 24px;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
    }
    .filter-group { display: flex; flex-wrap: wrap; gap: 8px; }
    .btn-filter {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      color: var(--text);
      padding: 6px 14px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-filter:hover, .btn-filter.active {
      background: var(--accent);
      color: #000;
      border-color: var(--accent);
    }
    .search-box {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      color: #fff;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      width: 280px;
    }
    .search-box:focus { outline: none; border-color: var(--accent); }

    .grid {
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    .asset-card {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, border-color 0.2s;
    }
    .asset-card:hover { transform: translateY(-4px); }
    .asset-card.status-verified:hover { border-color: var(--success); }
    .asset-card.status-invalid { border-color: var(--danger); }
    .asset-card.status-missing { border-color: var(--warning); opacity: 0.8; }

    .preview-container {
      position: relative;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .preview-square { height: 180px; }
    .preview-landscape { height: 160px; }
    .preview-container img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      transition: transform 0.3s;
    }
    .preview-landscape img { object-fit: cover; }
    .asset-card:hover img { transform: scale(1.05); }

    .placeholder-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
      background: #181d2c;
      color: var(--text-muted);
      font-size: 12px;
      font-weight: 700;
    }

    .badge {
      position: absolute;
      top: 8px;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .category-badge { left: 8px; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); color: #fff; }
    .status-verified-badge { right: 8px; background: var(--success-bg); color: var(--success); border: 1px solid var(--success); }
    .status-invalid-badge { right: 8px; background: var(--danger-bg); color: var(--danger); border: 1px solid var(--danger); }
    .status-missing-badge { right: 8px; background: rgba(245, 158, 11, 0.2); color: var(--warning); border: 1px solid var(--warning); }

    .card-body { padding: 14px; display: flex; flex-direction: column; flex: 1; }
    .card-title { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .card-id { font-size: 12px; color: var(--text-muted); margin-bottom: 10px; }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 10px;
      font-size: 11px;
      background: rgba(0,0,0,0.3);
      padding: 8px;
      border-radius: 8px;
      margin-bottom: 10px;
    }
    .meta-label { color: var(--text-muted); }
    .path-text {
      font-size: 10px;
      color: #6b7280;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: auto;
    }
    .error-list {
      margin-top: 10px;
      padding-left: 16px;
      font-size: 11px;
      color: var(--danger);
      background: var(--danger-bg);
      padding: 8px 8px 8px 24px;
      border-radius: 6px;
    }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  </style>
</head>
<body>
  <header>
    <h1>LEIBO &mdash; Bảng Đối Chiếu Hình Ảnh & Kiểm Định Asset</h1>
    <p class="subtitle">Báo cáo tạo lúc: <strong>${generatedDate}</strong> &bull; Tuân thủ quy tắc: Không tự động chọn ảnh gần giống khi không tìm thấy ảnh chính xác.</p>
    <div class="stats-bar">
      <div class="stat-card">
        <div class="stat-val">${manifest.stats.total}</div>
        <div class="stat-lbl">Tổng Asset Mapped</div>
      </div>
      <div class="stat-card">
        <div class="stat-val success">${manifest.stats.verified}</div>
        <div class="stat-lbl">Xác Minh Hợp Lệ</div>
      </div>
      <div class="stat-card">
        <div class="stat-val ${manifest.stats.invalid > 0 ? "danger" : ""}">${manifest.stats.invalid}</div>
        <div class="stat-lbl">Lỗi Kiểm Định</div>
      </div>
      <div class="stat-card">
        <div class="stat-val ${manifest.stats.missing > 0 ? "warning" : ""}">${manifest.stats.missing}</div>
        <div class="stat-lbl">Thiếu File (Placeholder)</div>
      </div>
    </div>
  </header>

  <div class="controls">
    <div class="filter-group" id="categoryFilters">
      <button class="btn-filter active" data-filter="all">Tất cả</button>
      <button class="btn-filter" data-filter="version">Phiên bản (Key Art)</button>
      <button class="btn-filter" data-filter="character">Nhân vật</button>
      <button class="btn-filter" data-filter="weapon">Vũ khí</button>
      <button class="btn-filter" data-filter="artifact">Thánh di vật</button>
    </div>
    <div class="filter-group" id="statusFilters">
      <button class="btn-filter active" data-status-filter="all">Tất cả trạng thái</button>
      <button class="btn-filter" data-status-filter="VERIFIED">Hợp lệ</button>
      <button class="btn-filter" data-status-filter="INVALID">Lỗi</button>
      <button class="btn-filter" data-status-filter="MISSING">Thiếu file</button>
    </div>
    <input type="text" id="searchInput" class="search-box" placeholder="Tìm ID hoặc tên..." />
  </div>

  <main class="grid" id="assetGrid">
    ${cardsHtml}
  </main>

  <script>
    const cards = document.querySelectorAll(".asset-card");
    let currentCategory = "all";
    let currentStatus = "all";
    let searchQuery = "";

    function filterCards() {
      cards.forEach(card => {
        const cat = card.getAttribute("data-category");
        const stat = card.getAttribute("data-status");
        const id = card.getAttribute("data-id").toLowerCase();
        const text = card.textContent.toLowerCase();

        const matchCat = currentCategory === "all" || cat === currentCategory;
        const matchStat = currentStatus === "all" || stat === currentStatus;
        const matchSearch = !searchQuery || id.includes(searchQuery) || text.includes(searchQuery);

        if (matchCat && matchStat && matchSearch) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    }

    document.querySelectorAll("#categoryFilters .btn-filter").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#categoryFilters .btn-filter").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentCategory = btn.getAttribute("data-filter");
        filterCards();
      });
    });

    document.querySelectorAll("#statusFilters .btn-filter").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#statusFilters .btn-filter").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentStatus = btn.getAttribute("data-status-filter");
        filterCards();
      });
    });

    document.getElementById("searchInput").addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      filterCards();
    });
  </script>
</body>
</html>`;
}

/**
 * Ghi các báo cáo ra đĩa
 */
export function writeAuditReports(
  manifest: AssetManifest,
  results: AssetAuditResult[],
  outHtmlPath: string,
  outJsonPath: string
): void {
  // 1. Ghi file HTML
  const html = generateHtmlAuditReport(manifest, results);
  fs.mkdirSync(path.dirname(outHtmlPath), { recursive: true });
  fs.writeFileSync(outHtmlPath, html, "utf8");

  // 2. Ghi file JSON
  fs.mkdirSync(path.dirname(outJsonPath), { recursive: true });
  fs.writeFileSync(outJsonPath, JSON.stringify(manifest, null, 2), "utf8");
}
