# Hướng dẫn áp dụng vào repo

## 1. Copy đè các file trong zip này vào đúng đường dẫn tương ứng trong repo
Cấu trúc thư mục trong zip khớp 100% với repo — chỉ cần giải nén đè lên.

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
Xem hướng dẫn lấy 2 connection string Neon (pooled + direct) ngay trong file.

## 5. Chạy thử để tự xác nhận
```bash
npm run test        # 52/52 test phải pass — không đụng DB thật (đã mock)
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
- `.github/workflows/ci.yml`: thêm bước `npm run test` vào job lint-and-typecheck

**Bước 3 — refactor factory pattern**
- Mới: `src/lib/api/list-route-factory.ts` (`createListRoute`) và `src/lib/api/detail-route-factory.ts` (`createDetailRoute`)
- Viết lại 8 route dùng factory: `characters`, `weapons`, `artifacts`, `materials` (cả list + detail mỗi resource) — mỗi file giờ chỉ còn khai báo config, không còn logic phân trang/query lặp lại
- `search/route.ts` **giữ nguyên, không refactor** — nó gộp 3 resource cùng lúc, cấu trúc khác hẳn route đơn, ép vào factory sẽ làm code khó đọc hơn chứ không giúp gì
- `src/lib/api/errors.ts`: export `RouteContext`, và sửa 1 lỗi type nhỏ do factory lộ ra — `ctx` giờ optional ở hàm route trả về (route không có `[id]` được Next.js gọi mà không kèm `ctx`, trước đây bắt buộc là sai type dù không lỗi runtime)

**Đã xác minh, không phải chỉ viết cho có:**
- Toàn bộ 52 test chạy pass TRƯỚC khi refactor (baseline) và SAU khi refactor (regression) — hành vi API không đổi
- `npx tsc --noEmit` sạch, trừ các lỗi do sandbox không tải được Prisma engine binary qua network (`binaries.prisma.sh` bị chặn ở môi trường test này) — sẽ tự hết khi bạn chạy `prisma generate` thật với DB Neon. Có 1 lỗi implicit-any nhỏ có sẵn từ trước ở `character-helpers.ts:147`, không thuộc phạm vi 5 bước, nêu ra để bạn biết.

## Chưa làm (Bước 4–5, sẽ gửi tiếp)
- Bước 4: rate limiting qua Upstash Redis
- Bước 5: `docs/API.md` (khớp với link `/api` đang trả về, hiện đang là link chết)
