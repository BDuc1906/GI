# Module Breakdown

## API Routes (`src/app/api/`)
- `/api/characters` – Danh sách và chi tiết nhân vật.
- `/api/weapons` – Danh sách và chi tiết vũ khí.
- `/api/artifacts` – Danh sách và chi tiết thánh di vật.
- `/api/domains` – Danh sách và chi tiết bí cảnh.
- `/api/materials` – Danh sách và chi tiết nguyên liệu.
- `/api/search` – Tìm kiếm tổng hợp.
- `/api/health` – Kiểm tra DB.
- `/api/admin/*` – (sẽ có) Dashboard admin.

## Helpers (`src/lib/api/`)
- `errors.ts` – ApiError class và error handler.
- `response.ts` – Envelope chuẩn.
- `rate-limit.ts` – Rate limiting.
- `query.ts` – Parse query params.

## Services (`src/lib/`)
- `prisma.ts` – Prisma client.
- `db-retry.ts` – Retry cho DB.
- `character-helpers.ts` – Helper cho Character.

## Components (`src/components/`)
- `SafeImage.tsx` – Ảnh có fallback.
- `SearchBar.tsx` – Ô tìm kiếm.
- `Pagination.tsx` – Phân trang.
- `CharacterLevelSlider.tsx` – Thanh trượt level.

## Scripts (`scripts/`)
- `seed.ts` – Seed toàn bộ.
- `seed-characters.ts`, `seed-weapons.ts`, ...
- `mirror-images-to-r2.ts` – Mirror ảnh sang R2.
- `verify-seed-integrity.ts` – Kiểm tra dữ liệu.