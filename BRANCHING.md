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

- `auto/update-data-YYYYMMDD` — do `update-data.yml` tự tạo hàng tuần
  (thứ 4), tự mở PR, tự merge nếu `db:verify` + `ci.yml` đều pass. Không
  cần đụng vào, chỉ cần theo dõi Issues nếu có báo lỗi.
- `auto-fix.yml` **không tạo nhánh** — nó ghi thẳng vào DB production
  (không phải code), nên không đi qua PR.

## Nên bật thêm (làm 1 lần trong GitHub UI, không phải file)

Vào **Settings → Branches → Add branch protection rule** cho `main`:
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging → chọn các job của
  `ci.yml` (`Lint & Typecheck`, `Migrate & Build`, `API smoke test`)
- ✅ Require branches to be up to date before merging
- ❌ Không cần "Require approvals" vì làm 1 mình — nhưng vẫn nên bắt buộc
  PR (không cho push thẳng) để giữ lịch sử rõ ràng và luôn có preview
  trước khi lên production.

Sau khi bật rule này, kể cả bạn cũng **không thể** push thẳng vào `main`
nữa — bắt buộc qua nhánh + PR, đúng như quy trình ở trên.
