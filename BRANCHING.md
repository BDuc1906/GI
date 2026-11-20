# Quy trình nhánh (Branching)

Dự án dùng **GitHub Flow** — mô hình nhẹ, phù hợp làm việc 1 mình, không
dùng nhánh `develop`/`release` như Git Flow (thừa công merge cho quy mô
này).

## Nguyên tắc

1. **`main` luôn ở trạng thái deploy được** — mọi commit được merge vào `main` sẽ tự
   động deploy lên Vercel Production (thông qua Vercel Git Integration). KHÔNG bao giờ
   push trực tiếp vào `main`.
2. Mọi thay đổi (tính năng, sửa lỗi, refactor) tạo **1 nhánh ngắn hạn**
   từ `main`:
   ```powershell
   git checkout main
   git pull
   git checkout -b feature/ten-tinh-nang
   # hoặc: fix/ten-loi, refactor/ten-phan
   ```
3. Commit, push nhánh, **mở Pull Request vào `main`**. Ngay khi mở/push
   PR, các luồng tự động được kích hoạt:
   - `ci.yml` chạy kiểm định toàn diện:
     * Code & Asset Validation Gate (Lint, TypeScript typecheck, Vitest unit tests, Asset Validation Gate, Character Build Validation Gate, Translation Quality Gate).
     * Next.js Build, API Smoke Test với PostgreSQL test container và Playwright Chromium E2E.
   - Vercel Git Integration tự động tạo một Preview Deployment riêng cho nhánh, cung cấp link xem trước ngay trên PR.
4. Xem link preview để tự kiểm tra trực quan, đợi toàn bộ checks của `ci.yml` xanh, rồi
   **merge vào `main`** (khuyến nghị dùng "Squash and merge" trong
   GitHub UI để lịch sử `main` gọn, mỗi PR = 1 commit).
5. Sau khi merge vào `main`, Vercel tự động build và deploy lên Production.
6. Với các thay đổi liên quan đến dữ liệu production, chạy workflow `production-data.yml`
   qua GitHub Environment `production` (yêu cầu phê duyệt thủ công và bắt buộc tạo snapshot `pg_dump` backup lên S3/R2 trước khi migrate/seed).
7. Xoá nhánh sau khi merge (GitHub có nút "Delete branch" ngay sau khi merge PR).

## Các nhánh tự động (không phải bạn tạo tay)

- `data-update/genshin-db-v<version>` — do `data-update.yml` tự tạo khi có dữ liệu
  game mới (hàng ngày 4:00 AM VN), crawl, sync asset, seed test DB, verify integrity
  nghiêm ngặt và tự động mở PR. Không commit/push thẳng vào `main`.
  Khi PR được mở, `ci.yml` và Vercel Preview sẽ tự động kiểm thử.
- `production-data.yml` — triển khai dữ liệu đã duyệt lên Production DB có kiểm soát
  qua GitHub Environment `production` (yêu cầu review) và backup S3 bắt buộc.

## Nên bật thêm (làm 1 lần trong GitHub UI, không phải file)

Vào **Settings → Rules → Rulesets** (hoặc **Branches → Add branch protection rule**) cho `main`:
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging → chọn 2 check của `ci.yml`:
  1. `Code & Asset Validation Gate`
  2. `Build, API Smoke & Playwright E2E`
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings
