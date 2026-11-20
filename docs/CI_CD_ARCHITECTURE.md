# KIẾN TRÚC CI/CD VÀ DATA PIPELINE DỰ ÁN LEIBO

Tài liệu quy định và hướng dẫn vận hành toàn diện hệ thống Tích hợp liên tục (CI), Cập nhật dữ liệu (Data Pipeline), và Triển khai liên tục (CD) cho LEIBO Wiki.

---

## 1. TỔNG QUAN: PHÂN TÁCH 3 LUỒNG ĐỘC LẬP

Để đảm bảo tính toàn vẹn dữ liệu, hiệu năng runner và độ ổn định của website production, toàn bộ quy trình được phân định rạch ròi thành 3 luồng:

```
[LUỒNG 1: CI CODE & GATE]
Push / PR -> ESLint + Typecheck + Unit Tests + Asset Gate + Build Gate -> Postgres Container: Migrate + Test Seed + Next Build + API Smoke + Playwright E2E

[LUỒNG 2: DATA UPDATE PIPELINE]
Schedule (4:00 AM VN) -> Check genshin-db -> Crawl & Sync CDN Assets -> Test DB Seed & Strict Verify -> Create PR (data-update/...) -> Triggers LUỒNG 1

[LUỒNG 3: PRODUCTION DEPLOYMENT]
Manual Dispatch + Token -> GitHub Environment Approval -> Pre-Flight pg_dump S3 Backup -> Migrate & Seed Production DB -> Verify Integrity -> Mirror R2
```

---

## 2. CHI TIẾT CÁC LUỒNG VẬN HÀNH

### Luồng 1: Code & Asset Validation Gate (`.github/workflows/ci.yml`)
- **Mục tiêu:** Đảm bảo code sạch, không có lỗi kiểu (TypeScript), toàn bộ test đạt 100%, assets hợp lệ, builds hợp lệ, và bản build Next.js hoạt động hoàn hảo trước khi merge.
- **Kích hoạt:** Khi có `push` lên `main` hoặc tạo/cập nhật `pull_request` vào `main`.
- **Cấu trúc 2 Job tối ưu:**
  1. `lint-and-typecheck`:
     - `npm run lint` (ESLint)
     - `npm run typecheck` (`tsc --noEmit`)
     - `npm run test` (Vitest Unit/Integration Tests)
     - `npm run assets:validate` (Asset Mapping Manifest & Resolution Gate)
     - `npm run builds:update` (KQM 4-Layer Build Profiles Validation Gate)
  2. `build-and-smoke`:
     - Khởi chạy một Postgres 16 Service Container duy nhất.
     - Áp dụng migration (`npx prisma migrate deploy`).
     - Nạp dữ liệu mẫu vào DB test (`npx tsx scripts/seed/seed.ts`).
     - Biên dịch Next.js (`npm run build`).
     - Khởi động server nền và chạy bộ API Smoke Test (`/api/health`, `/api`, `/api/characters`, `/api/search`, mã 400 và 404).
     - Cài đặt Playwright Chromium và chạy E2E Smoke Test (`tests/e2e/home.spec.ts`).
  - **Lợi ích:** Loại bỏ việc khởi động runner kép, tiết kiệm 50% thời gian chạy CI, kiểm thử toàn diện từ Database -> API -> UI.

---

### Luồng 2: Data Update Pipeline (`.github/workflows/data-update.yml`)
- **Mục tiêu:** Tự động phát hiện phiên bản game/thư viện mới từ `genshin-db`, crawl dữ liệu, đồng bộ hình ảnh authentic và mở Pull Request để con người rà soát.
- **Kích hoạt:** Hàng ngày lúc 4:00 AM VN (`0 21 * * *` UTC) hoặc chạy tay qua `workflow_dispatch`.
- **Nguyên tắc an toàn (P0 & P1 Enforcement):**
  - ❌ **TUYỆT ĐỐI CẤM push trực tiếp vào `main`:** Xóa bỏ hoàn toàn `git push origin main` và cấm sử dụng cờ `[skip ci]`.
  - ❌ **TUYỆT ĐỐI CẤM bỏ qua lỗi dữ liệu:** Xóa bỏ `continue-on-error: true`. Nếu quá trình crawl, seed, hoặc integrity verification phát hiện sai lệch, workflow **DỪNG NGAY LẬP TỨC** và tự động mở GitHub Issue cảnh báo.
  - ❌ **TUYỆT ĐỐI CẤM ghi vào Production DB:** Workflow này chỉ tương tác với Postgres Service Container tạm thời trong CI.
  - ✅ **Cơ chế Pull Request cô lập:** Toàn bộ file dữ liệu thô (`data/raw/`), CDN assets (`public/local-genshin-assets/`) và dependency được commit vào branch mới `data-update/genshin-db-v<version>` và mở Pull Request tự động qua `peter-evans/create-pull-request`.
  - ✅ Khi PR được mở, **Luồng 1 (CI)** và Vercel Preview sẽ tự động kích hoạt để kiểm thử.

---

### Luồng 3: Production Data Deployment (`.github/workflows/production-data.yml`)
- **Mục tiêu:** Đồng bộ dữ liệu đã được kiểm duyệt vào Cơ sở dữ liệu Production và mirror asset lên Cloudflare R2.
- **Kích hoạt:** Chạy thủ công có chủ đích (`workflow_dispatch`) với mã xác nhận `DEPLOY_PROD`.
- **Cơ chế bảo vệ nghiêm ngặt (P0 Data Protection):**
  1. **GitHub Environment Protection:** Job được gán `environment: production`, yêu cầu phê duyệt thủ công (Reviewer Approval) từ quản trị viên repository trước khi runner được phép chạy.
  2. **Pre-Flight Backup Gate (Bắt buộc):**
     - Chạy `pg_dump` tạo custom-format snapshot của database hiện tại.
     - Tải snapshot cùng mã SHA-256 checksum lên AWS S3 / Cloudflare R2.
     - So khớp dung lượng file trên cloud với file cục bộ.
     - **FAIL-SAFE:** Nếu backup thất bại hoặc thiếu credentials S3, workflow **HỦY NGAY LẬP TỨC**, tuyệt đối không thực thi các bước seed hay migration tiếp theo.
  3. **Thực thi có kiểm soát:**
     - Chạy `prisma migrate deploy` trên Production DB.
     - Chạy `scripts/seed/seed.ts` nạp dữ liệu chuẩn.
     - Chạy `scripts/seed/verify-seed-integrity.ts` xác thực toàn vẹn.
     - Đồng bộ ảnh tĩnh lên R2 (`scripts/images/mirror-images-to-r2.ts`).

---

## 3. CÁC WORKFLOW BỔ TRỢ

| Workflow | Vai trò | Điều kiện an toàn |
| :--- | :--- | :--- |
| `auto-fix.yml` | Quét và điều chỉnh các trường dữ liệu lệch so với live source | Chạy thủ công với mã xác nhận `CONFIRM_FIX`, chạy trong environment `production` |
| `dependabot-auto-merge.yml` | Tự động merge các bản cập nhật phụ thuộc | **CHỈ** merge patch version (`semver-patch`) của `devDependencies`. **CẤM** auto-merge các runtime frameworks: `next`, `react`, `@prisma/client`, `prisma`, `zod`, `genshin-db`. |
| `data-quality-monitor.yml` | Đo lường chất lượng dữ liệu và điểm số toàn vẹn hàng ngày | Đọc dữ liệu (read-only), tạo/cập nhật GitHub Issue nếu có critical alerts |
| `i18n-consistency-monitor.yml` | Kiểm tra tính nhất quán bản dịch đa ngôn ngữ | Đọc dữ liệu (read-only), báo cáo thuật ngữ lệch qua GitHub Issue |
| `post-deploy-smoke.yml` | Smoke test trang web sau khi Vercel deploy | Kiểm tra HTTP 200, `/api/health`, `/api/characters` |

---

## 4. QUY TẮC CẤU HÌNH GITHUB VÀ VERCEL

### 4.1. GitHub Branch Protection (Branch Ruleset cho `main`)
Để ngăn chặn hoàn toàn việc bypass CI hoặc vô tình ghi đè code, cần cấu hình trên GitHub: `Settings` → `Rules` → `Rulesets`:
1. **Target branches:** `default branch` (`main`).
2. **Restrict deletions & force pushes:** Bật (Bắt buộc).
3. **Require a pull request before merging:**
   - Required approvals: 1.
   - Dismiss stale pull request approvals when new commits are pushed: Bật.
4. **Require status checks to pass:**
   - Status check 1: `Code & Asset Validation Gate`
   - Status check 2: `Build, API Smoke & Playwright E2E`
   - Require branches to be up to date before merging: Bật.
5. **Do not allow bypassing the above settings:** Bật cho toàn bộ thành viên.

### 4.2. GitHub Environments (`production`)
Vào `Settings` → `Environments` → `New environment` đặt tên `production`:
1. **Required reviewers:** Chọn tài khoản quản trị viên.
2. **Environment secrets:**
   - `PROD_DATABASE_URL`: Connection string PostgreSQL có connection pooling (Vercel Postgres / Neon / Supabase).
   - `PROD_DIRECT_URL`: Direct connection string PostgreSQL (cần cho `pg_dump` và `prisma migrate`).
   - `BACKUP_S3_BUCKET`: Tên bucket S3 lưu trữ bản backup database.
   - `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` & `AWS_REGION`: Quyền ghi backup.
   - `CLOUDFLARE_R2_*`: Thông tin xác thực Cloudflare R2 mirror.

### 4.3. Vercel Git Integration
- **Production Branch:** `main` (chỉ deploy khi PR đã merge vào `main` và CI đã pass).
- **Preview Deployments:** Tự động kích hoạt khi có Pull Request từ `data-update/*` hoặc nhánh tính năng. Preview environment sử dụng biến môi trường staging/preview, không ghi đè DB production.

---

## 5. QUY TRÌNH XỬ LÝ SỰ CỐ VÀ KHÔI PHỤC (ROLLBACK)

### Sự cố 1: Lỗi giao diện / Code sau khi deploy lên Production
- **Thời gian xử lý:** < 1 phút.
- **Thực hiện:** Truy cập Vercel Dashboard → Dự án `leibo` → Tab `Deployments` → Tìm bản deployment gần nhất trước đó hoạt động tốt → Chọn `Instant Rollback`.
- **Hành động tiếp theo:** Tạo PR revert commit lỗi trên Git.

### Sự cố 2: Lỗi dữ liệu Production sau khi chạy seed
- **Thời gian xử lý:** 5-10 phút.
- **Thực hiện:**
  1. Vào tab GitHub Actions của workflow `Production Data Deployment`, kiểm tra log của step `Mandatory Pre-Flight Backup & Verification` để lấy S3 Key của file `.dump` vừa tạo (ví dụ `database-backups/leibo-prod-20261120T...dump`).
  2. Chạy lệnh phục hồi database an toàn:
     ```bash
     # Tải bản dump từ S3
     aws s3 cp s3://<BACKUP_S3_BUCKET>/database-backups/<BACKUP_FILE>.dump ./backup.dump
     
     # Phục hồi vào Direct Postgres URL
     pg_restore --clean --if-exists --no-owner --no-acl -d "$PROD_DIRECT_URL" ./backup.dump
     ```
  3. Chạy `npm run db:verify` để xác nhận dữ liệu đã trở lại trạng thái hoàn hảo.
