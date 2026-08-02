# Changelog

Định dạng theo [Keep a Changelog](https://keepachangelog.com/vi/1.0.0/).

## [Unreleased]

### Fixed
- `.gitignore`: quy tắc `.env*` (thừa so với `.env`/`.env.local`/`.env.*.local`) vô tình chặn `.env.example` khỏi git — người mới clone repo không có file mẫu để copy như README hướng dẫn.
- `SearchBar`: hardcode màu `neutral-800/900` thay vì dùng CSS variable theme (`--bg-card`, `--border-color`, `--text-muted`...) khiến ô tìm kiếm không đổi màu khi bật light mode.
- Header không responsive trên mobile: 3 link điều hướng + search + theme toggle nằm chung 1 hàng không wrap, tràn layout trên màn hình nhỏ. Thêm menu hamburger (`SiteNav.tsx`).
- `package.json`: `name` là `"kazuha"`, không khớp thương hiệu `LEIBO`.

### Changed
- CI: thêm bước `npm run test` vào job `lint-and-typecheck` (trước đó bộ test tồn tại nhưng CI không chạy).
- `vitest.config.ts`: mở rộng `include` để bắt được `src/lib/api/rate-limit.test.ts`.
- Sửa link chết `GET /api` (`/docs/API.md` → `/docs/api.md`), thêm `scripts/sync-docs.mjs` đồng bộ `docs/api.md` → `public/docs/api.md`.
- Thêm `metadataBase` + Open Graph/Twitter cơ bản trong `layout.tsx` để link chia sẻ hiển thị preview đúng.

### Added
- `tests/`: unit test cho `query.ts`/`response.ts`/`errors.ts`, smoke test toàn bộ route API.
- Rate limiting theo IP (`src/lib/api/rate-limit.ts`, Upstash Redis, sliding window, fail-open).
- `docs/api.md` — tài liệu API đầy đủ.
- `LICENSE` (MIT).
