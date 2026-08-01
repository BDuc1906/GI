# Hướng dẫn áp dụng vào repo

## 1. Copy đè các file trong zip này vào đúng đường dẫn tương ứng trong repo
C��u trúc thư mục trong zip khớp 100% với repo — chỉ cần giải nén đè lên.

## 2. Xóa thủ công 3 file rác (không nằm trong zip vì đây là XÓA, không phải sửa)
```bash
git rm debug-talent-book.txt debug-talent-book-2.txt debug-talent-book-output.txt
```

## 3. Cài Vitest (mới thêm ở bước 2)
```bash
npm install
```
`package.json` đã khai báo `vitest` trong devDependencies + script `test`/`test:watch`.

## 4. Điền `.env` từ `.env.example` (nếu chưa có)
Xem hướng dẫn lấy 2 connection string Neon (pooled + direct), và 2 biến
Upstash (`UPSTASH_REDIS_REST_URL`/`TOKEN`, bắt buộc cho production) ngay
trong file.

## 5. Chạy thử để tự xác nhận
```bash
npm run test        # phải pass hết — không đụng DB thật (đã mock)
npx tsc --noEmit     # sau khi `npx prisma generate` chạy thành công với DB thật của bạn
npm run lint
```

## Tóm tắt đã thay đổi (Bước 1–3)

**Bước 1 — dọn dẹp & tài liệu**
- Xóa 3 file debug (xem mục 2 ở trên)
- `.env.example`: viết lại đầy đủ, giải thích rõ pooled vs direct URL của Neon
- `README.md`: viết mới hoàn toàn

**Bước 2 — test (Vitest)**
- `vitest.config.ts`, `tests/setup.ts` (mock `@prisma/client` để test không cần DB thật)
- `tests/lib/api/*.test.ts`: unit test cho `query.ts`, `response.ts`, `errors.ts` (29 test)
- `tests/api/*.route.test.ts`: smoke test tất cả route API — characters/weapons/artifacts/materials/search/health (23 test)
- `package.json`: thêm script `test`, `test:watch`, devDependency `vitest`

**Bước 3 — refactor factory pattern: KHÔNG CÒN ÁP DỤNG**
> ⚠️ Mục này trước đây ghi là đã hoàn thành (`src/lib/api/list-route-factory.ts`,
> `detail-route-factory.ts`, 8 route viết lại dùng factory), nhưng rà soát lại
> codebase hiện tại **không tìm thấy 2 file factory này**, và các route
> (`characters/route.ts`, `weapons/route.ts`...) vẫn là code viết tay như
> trước Bước 3. Không rõ do refactor bị revert hay chưa từng merge đầy đủ.
> Ghi nhận lại đúng sự thật thay vì để tài liệu mô tả sai code đang chạy —
> nếu vẫn muốn factory pattern, cần làm lại từ đầu, không giả định đã có.

**Đã xác minh, không phải chỉ viết cho có (tại thời điểm Bước 1–2):**
- Toàn bộ test chạy pass
- `npx tsc --noEmit` sạch, trừ các lỗi do sandbox không tải được Prisma engine binary qua network (`binaries.prisma.sh` bị chặn ở môi trường test này) — sẽ tự hết khi bạn chạy `prisma generate` thật với DB Neon. Có 1 lỗi implicit-any nhỏ có sẵn từ trước ở `character-helpers.ts:147`, không thuộc phạm vi các bước trên, nêu ra để bạn biết.

## Bước 4–5: THỰC RA ĐÃ LÀM (mục "Chưa làm" trước đây ghi sai)
> ⚠️ Bản ghi cũ liệt kê 2 mục này là "chưa làm, sẽ gửi tiếp". Rà soát lại
> codebase hiện tại thì cả hai **đã tồn tại và đang chạy thật**:
- **Rate limiting**: `src/lib/api/rate-limit.ts` (Upstash Redis, sliding window, fail-open, có test riêng `src/lib/api/rate-limit.test.ts`) — đã được áp dụng ở mọi route qua `withRateLimit(...)`.
- **`docs/api.md`**: đã viết đầy đủ, khớp với hành vi API thật.

## Đợt sửa gần nhất — dọn lỗi phát hiện khi audit lại repo
- **CI**: thêm bước `npm run test` vào job `lint-and-typecheck` (`.github/workflows/ci.yml`) — trước đó bộ test tồn tại nhưng CI không bao giờ chạy, nên code hỏng test vẫn merge được bình thường.
- **`vitest.config.ts`**: mở rộng `include` thành `["tests/**/*.test.ts", "src/**/*.test.ts"]` — trước đó `src/lib/api/rate-limit.test.ts` không khớp glob cũ (`"tests/**/*.test.ts"`), nên chưa từng được `npm run test` chạy tới dù file tồn tại và tự chạy riêng thì pass.
- **Link docs chết** (`GET /api` trả `docs: "/docs/API.md"`): `docs/` không được Next.js serve như route web, chỉ `public/` mới được. Sửa thành `/docs/api.md` (đúng chữ thường) và thêm `scripts/sync-docs.mjs` + hook `predev`/`prebuild` trong `package.json` để tự copy `docs/api.md` → `public/docs/api.md` — không cần nhớ copy tay, tránh 2 file lệch nhau theo thời gian.
- **`weapons/page.tsx`, `artifacts/page.tsx`**: thêm `export const metadata` riêng (trước đó fallback về title/description chung của layout gốc, không nhất quán với `characters/page.tsx`).
- **`layout.tsx`**: thêm `metadataBase` + Open Graph/Twitter cơ bản — cần để link chia sẻ lên Discord/Facebook hiển thị đúng preview.
- **`README.md`**: sửa 2 chỗ ghi sai "tìm kiếm 4 loại dữ liệu" (thực tế 3, không gồm materials); bổ sung hướng dẫn Upstash vào mục cấu hình môi trường, thêm `npm run test`/`test:watch` vào bảng Scripts, thêm rate limiting vào mục Bảo mật, cập nhật mục CI/CD.
- **`LICENSE`**: tạo file MIT thật — README đã link `./LICENSE` từ trước nhưng file này chưa tồn tại trong repo.
- **`package.json`**: thêm field `"license": "MIT"` cho khớp README.