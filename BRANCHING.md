# Quy trình nhánh (Branching)

Dự án dùng **GitHub Flow** — mô hình nhẹ, phù hợp làm việc 1 mình, không
dùng nhánh `develop`/`release` như Git Flow (thừa công merge cho quy mô
này).

## Nguyên tắc

1. **`main` luôn ở trạng thái deploy được** — mọi commit vào `main` sẽ tự
   động deploy lên production (xem job `deploy-production` trong
   `ci.yml`). KHÔNG bao giờ push thẳng vào `main`.
2. Mọi thay đổi (tính năng, sửa lỗi, refactor) tạo **1 nhánh ngắn hạn**
   từ `main`:
   ```powershell
   git checkout main
   git pull
   git checkout -b feature/ten-tinh-nang
   # hoặc: fix/ten-loi, refactor/ten-phan
   ```
3. Commit, push nhánh, **mở Pull Request vào `main`**. Ngay khi mở/push
   PR, 2 việc tự động xảy ra:
   - `ci.yml` chạy lint + typecheck + test + build + API smoke test
   - `preview.yml` (mới thêm) deploy 1 bản xem trước lên Vercel, comment
     link thẳng vào PR
4. Xem link preview để tự kiểm tra bằng mắt, đợi `ci.yml` xanh, rồi
   **merge vào `main`** (khuyến nghị dùng "Squash and merge" trong
   GitHub UI để lịch sử `main` gọn, mỗi PR = 1 commit).
5. Merge xong, job `deploy-production` trong `ci.yml` tự chạy migrate +
   seed + deploy production — không cần làm gì thêm.
6. Xoá nhánh sau khi merge (GitHub có nút "Delete branch" ngay sau khi
   merge PR).

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
