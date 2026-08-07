# Cấu trúc thư mục LEIBO

- `src/app/` – Next.js App Router (routes, layouts, pages)
- `src/components/` – React components (Server + Client)
- `src/lib/` – Utilities, helpers, services
- `src/lib/api/` – API helpers (errors, response, rate-limit, query)
- `scripts/` – Automation scripts (crawl, seed, mirror, verify)
- `prisma/` – Database schema và migrations
- `tests/` – Unit tests (Vitest)
- `public/` – Static assets (được đồng bộ từ docs)
- `data/raw/` – Dữ liệu crawl (gitignored)