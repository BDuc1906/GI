<div align="center">

# ⚔️ LEIBO

### Cơ sở dữ liệu Genshin Impact — Nhân vật · Vũ khí · Thánh di vật · Nguyên liệu

<p>
  <img src="https://img.shields.io/badge/status-active-3fb950?style=for-the-badge" alt="status" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="license" />
  <img src="https://img.shields.io/github/actions/workflow/status/your-org/leibo/ci.yml?branch=main&style=for-the-badge&label=CI" alt="CI" />
</p>

<p>
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Neon-Serverless_DB-00E599?style=for-the-badge&logo=neon&logoColor=white" alt="Neon" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/ESLint-9-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint" />
  <img src="https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions" />
</p>

</div>

---

## 📖 Giới thiệu

**LEIBO** là một ứng dụng web tra cứu dữ liệu **Genshin Impact**, cung cấp thông tin chi tiết và có cấu trúc về **nhân vật**, **vũ khí**, **thánh di vật (artifact set)**, **nguyên liệu đột phá/thiên phú** và **bí cảnh (domain)**.

> Phạm vi hiện tại tập trung vào dữ liệu phục vụ *build nhân vật*. Dự án **chưa** có: quái/boss dạng bảng riêng (Enemy), thành tựu (Achievements), namecard, đồ nội thất Nhà Lư (Serenitea Pot), Thất Thánh Triệu Hồi (TCG), cốt truyện/nhiệm vụ, sự kiện, lịch sử banner. Xem mục [Nguồn dữ liệu & giới hạn đã biết](#-nguồn-dữ-liệu--giới-hạn-đã-biết) để biết chi tiết và định hướng mở rộng.

Toàn bộ dữ liệu game được trích xuất từ package cộng đồng [`genshin-db`](https://www.npmjs.com/package/genshin-db) (cập nhật theo từng phiên bản game), sau đó được chuẩn hoá và nạp (seed) vào cơ sở dữ liệu **PostgreSQL** thông qua **Prisma ORM**, phục vụ qua một REST API tự xây dựng và giao diện **Next.js App Router**.

Dự án được thiết kế theo hướng **production-ready**: có migration lịch sử, có CI (lint, typecheck, build, smoke test API), có validate biến môi trường khi khởi động, whitelist domain ảnh để tránh SSRF, và tách bạch rõ ràng giữa kết nối pooled (runtime) và direct (migration).

---

## ✨ Tính năng chính

| Tính năng | Mô tả |
|---|---|
| 🧑‍🤝‍🧑 **Nhân vật** | Chỉ số theo cấp độ, thiên phú, cung mệnh, nguyên liệu đột phá/thiên phú, lồng tiếng, thông tin cốt truyện |
| ⚔️ **Vũ khí** | Chỉ số cơ bản, hiệu ứng theo 5 mốc tinh luyện, nguyên liệu đột phá |
| 💠 **Thánh di vật** | Hiệu ứng 1/2/4 mảnh, danh sách các mảnh trong bộ |
| 🧪 **Nguyên liệu** | Bảng nguyên liệu dùng chung, tránh lặp dữ liệu ảnh giữa các nhân vật/vũ khí |
| 🗺️ **Bí cảnh** | Lịch mở theo ngày trong tuần, nguyên liệu đặc trưng, gợi ý "hôm nay nên đánh gì" |
| 🔍 **Tìm kiếm tổng hợp** | Tìm kiếm xuyên suốt 4 loại dữ liệu (nhân vật, vũ khí, thánh di vật, bí cảnh) trong một endpoint |
| 🌗 **Dark / Light mode** | Chuyển giao diện mượt mà bằng `next-themes` |
| 🗺️ **SEO tự động** | `sitemap.xml` / `robots.txt` sinh động theo dữ liệu thật trong DB |
| 🛡️ **API an toàn** | Envelope response chuẩn hoá, phân trang có giới hạn, xử lý lỗi tập trung |

---

## 🧱 Công nghệ sử dụng

| Nhóm | Công nghệ | Vai trò |
|---|---|---|
| **Framework** | ![Next.js](https://img.shields.io/badge/-Next.js%2015-000000?style=flat-square&logo=next.js&logoColor=white) | App Router, Server Components, Route Handlers, ISR |
| **UI** | ![React](https://img.shields.io/badge/-React%2019-149ECA?style=flat-square&logo=react&logoColor=white) ![Tailwind](https://img.shields.io/badge/-Tailwind%20CSS%204-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) | Giao diện, dark/light theme |
| **Ngôn ngữ** | ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) | Type-safety toàn bộ codebase |
| **ORM** | ![Prisma](https://img.shields.io/badge/-Prisma%207-2D3748?style=flat-square&logo=prisma&logoColor=white) | Schema, migration, truy vấn DB |
| **Cơ sở dữ liệu** | ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) ![Neon](https://img.shields.io/badge/-Neon-00E599?style=flat-square&logo=neon&logoColor=white) | Postgres serverless, có pooling & branching |
| **Data source** | ![npm](https://img.shields.io/badge/-genshin--db-CB3837?style=flat-square&logo=npm&logoColor=white) | Nguồn dữ liệu gốc của game |
| **CI/CD** | ![GitHub Actions](https://img.shields.io/badge/-GitHub%20Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white) | Lint, typecheck, migrate, build, smoke test |
| **Chất lượng code** | ![ESLint](https://img.shields.io/badge/-ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white) | Flat config (`eslint.config.mjs`), kiểm tra style & lỗi tĩnh |
| **Runtime scripts** | ![tsx](https://img.shields.io/badge/-tsx-3178C6?style=flat-square&logo=typescript&logoColor=white) | Chạy script seed TypeScript trực tiếp |

---

## 🗂️ Cấu trúc dự án

```
leibo/
├── .github/workflows/ci.yml       # Pipeline CI: lint → typecheck → migrate → build → smoke test
├── prisma/
│   ├── schema.prisma               # Định nghĩa model: Character, Weapon, ArtifactSet, Material
│   └── migrations/                 # Lịch sử migration (không dùng db push)
├── scripts/
│   ├── seed.ts                     # Điểm vào seed, gọi lần lượt characters → weapons → artifacts → domains
│   ├── seed-characters.ts
│   ├── seed-weapons.ts
│   ├── seed-artifacts.ts
│   ├── seed-domains.ts
│   ├── verify-seed-integrity.ts    # Kiểm tra toàn vẹn dữ liệu sau seed (npm run db:verify)
│   ├── mirror-images-to-r2.ts      # Tự host ảnh sang Cloudflare R2 (npm run images:mirror)
│   └── lib/
│       ├── seed-helpers.ts         # Helper dùng chung: slugify, upsertMaterial, resolve icon URL...
│       └── r2-client.ts            # S3Client cấu hình cho Cloudflare R2
├── middleware.ts                   # CORS cho toàn bộ /api/*
├── src/
│   ├── app/
│   │   ├── api/                    # REST API (route handlers)
│   │   │   ├── characters | weapons | artifacts | materials | domains
│   │   │   ├── search/              # Tìm kiếm tổng hợp
│   │   │   ├── health/              # Health check (?counts=true để xem số dòng mỗi bảng)
│   │   │   └── route.ts             # Mục lục API (GET /api)
│   │   ├── characters | weapons | artifacts | domains | search   # Trang giao diện (SSR)
│   │   ├── icon.tsx / opengraph-image.tsx   # Favicon + ảnh chia sẻ, sinh bằng code
│   │   ├── characters/[id]/opengraph-image.tsx   # Ảnh chia sẻ riêng từng nhân vật
│   │   ├── sitemap.ts / robots.ts   # SEO tự sinh theo dữ liệu DB
│   │   └── layout.tsx / error.tsx / not-found.tsx
│   ├── components/                 # ElementIcon, SafeImage, SearchBar, ThemeToggle...
│   └── lib/
│       ├── genshin-server-time.ts  # Tính "hôm nay" theo đúng giờ server Genshin (reset 4h sáng)
│       ├── api/                    # errors.ts, query.ts, response.ts — chuẩn hoá API
│       ├── prisma.ts               # Khởi tạo Prisma Client + adapter pg + SSL
│       └── env.ts                  # Validate biến môi trường bắt buộc
├── next.config.ts                  # Whitelist domain ảnh (chống SSRF)
├── eslint.config.mjs                # Flat config (bắt buộc từ ESLint v9) — kế thừa next/core-web-vitals + next/typescript
└── package.json
```

---

## 🚀 Bắt đầu nhanh

### Yêu cầu

- Node.js ≥ 20
- Một database PostgreSQL (khuyến nghị dùng [Neon](https://console.neon.tech) — miễn phí, có pooling & branching)

### Cài đặt

```bash
git clone <repo-url> leibo
cd leibo
npm install
```

### Cấu hình môi trường

1. Vào [Neon Console](https://console.neon.tech) → project của bạn → **Connect**:
   - Nếu project từng bị lộ thông tin đăng nhập ra bên ngoài → đổi mật khẩu ngay tại **Settings → Reset password**.
   - Lấy connection string **Pooled connection** (host có hậu tố `-pooler`) → dùng cho `DATABASE_URL` (runtime app, chịu tải nhiều connection đồng thời).
   - Lấy connection string **Direct connection** (host **không** có `-pooler`) → dùng cho `DIRECT_URL` (chỉ dành cho `prisma migrate`).
2. Tạo file `.env` từ mẫu và điền giá trị:

   ```bash
   cp .env.example .env
   ```

   ```env
   DATABASE_URL="postgresql://<user>:<password>@<host>-pooler.neon.tech/<db>?sslmode=require"
   DIRECT_URL="postgresql://<user>:<password>@<host>.neon.tech/<db>?sslmode=require"
   # Chỉ cần khi deploy thật (sinh sitemap.xml / robots.txt đúng domain)
   NEXT_PUBLIC_SITE_URL="https://your-domain.com"

   # Bắt buộc khi deploy production — thiếu 2 biến này, rate limiting sẽ
   # TỰ TẮT (API vẫn chạy bình thường, chỉ log 1 dòng cảnh báo), tức là
   # API public không còn được chặn lạm dụng/scraping. Tạo miễn phí tại
   # https://console.upstash.com (Redis database → tab "REST API").
   UPSTASH_REDIS_REST_URL="https://<your-db>.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="<your-token>"
   ```

   > `.env` đã nằm trong `.gitignore` — **không bao giờ commit file này**.

### Khởi tạo cơ sở dữ liệu

```bash
npx prisma migrate dev --name init   # Tạo bảng theo migration có lịch sử
npm run db:seed                      # Nạp dữ liệu thật từ genshin-db
```

### Chạy ứng dụng

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

---

## 📜 Scripts

| Lệnh | Chức năng |
|---|---|
| `npm run dev` | Chạy server phát triển (Turbopack) |
| `npm run build` | Build production |
| `npm run start` | Chạy bản build production |
| `npm run lint` | Kiểm tra lint (ESLint) |
| `npm run test` | Chạy toàn bộ unit test (Vitest, mock Prisma — không cần DB thật) |
| `npm run test:watch` | Chạy test ở chế độ watch |
| `npm run db:generate` | Sinh lại Prisma Client |
| `npm run db:migrate` | Tạo/áp migration mới (dev) |
| `npm run db:studio` | Mở Prisma Studio để xem/sửa dữ liệu |
| `npm run db:seed` | Nạp dữ liệu từ `genshin-db` vào DB |

---

## 🔌 API Reference

Base URL: `/api` — mọi response đều theo envelope chuẩn `{ success, data, meta? }` hoặc `{ success: false, error }`.

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api` | Mục lục toàn bộ endpoint |
| `GET` | `/api/health` | Kiểm tra tình trạng kết nối DB |
| `GET` | `/api/characters` | Danh sách nhân vật (hỗ trợ phân trang `page`, `limit`) |
| `GET` | `/api/characters/:id` | Chi tiết một nhân vật |
| `GET` | `/api/weapons` | Danh sách vũ khí |
| `GET` | `/api/weapons/:id` | Chi tiết một vũ khí |
| `GET` | `/api/artifacts` | Danh sách thánh di vật |
| `GET` | `/api/artifacts/:id` | Chi tiết một bộ thánh di vật |
| `GET` | `/api/materials` | Danh sách nguyên liệu |
| `GET` | `/api/materials/:id` | Chi tiết một nguyên liệu |
| `GET` | `/api/domains` | Danh sách bí cảnh (hỗ trợ lọc `category`, `day`, `today`) |
| `GET` | `/api/domains/:id` | Chi tiết một bí cảnh |
| `GET` | `/api/search?q=...` | Tìm kiếm tổng hợp trên 4 loại dữ liệu — characters, weapons, artifacts, domains (không gồm materials — xem `docs/api.md`) |

> Phân trang mặc định `limit=24`, tối đa `limit=100` — chặn client kéo toàn bộ bảng trong 1 request.

---

## 🔐 Bảo mật

- `.env` không bao giờ commit — kiểm soát qua `.gitignore`.
- Kết nối DB luôn bắt buộc SSL (`rejectUnauthorized: true`) tại `src/lib/prisma.ts`.
- `src/lib/env.ts` validate biến môi trường **ngay khi khởi động app** — thiếu/sai `DATABASE_URL` sẽ báo lỗi rõ ràng thay vì crash mơ hồ ở request đầu tiên.
- `next.config.ts` chỉ whitelist đúng các domain ảnh đang dùng (Enka Network, Fandom Wikia, miHoYo BBS, và domain R2 nếu đã cấu hình `R2_PUBLIC_URL` — tự thêm động, xem mục Nguồn dữ liệu) — không dùng wildcard `**`, tránh next/image bị lợi dụng làm proxy ảnh (SSRF).
- `middleware.ts`: CORS cho toàn bộ `/api/*` (`Access-Control-Allow-Origin: *`) — phù hợp vì đây là API public chỉ đọc (GET), không cookie/session.
- `next.config.ts` (`headers()`): security headers cơ bản theo khuyến nghị OWASP (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) cho mọi response.
- **Rate limit theo IP** (`src/lib/api/rate-limit.ts`, Upstash Redis sliding window): mặc định 60 request/phút cho mỗi resource, 30 req/phút cho `/api/search`. Đây là lớp chống scraping/lạm dụng chính của một API public không cần auth — **bắt buộc** set `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` khi deploy production (xem mục Cấu hình môi trường), nếu không sẽ tự tắt và chỉ log cảnh báo.
- Khuyến nghị dùng **Neon Roles** để tạo Postgres role riêng cho runtime (least privilege) thay vì role owner mặc định khi chạy production lâu dài.
- Có thể tận dụng **Neon Branching** để tách DB dev/preview khỏi production khi nhiều người cùng phát triển.
- `scripts/seed.ts` chỉ log host/port của DB, **không** log full connection string.

---

## 📊 Nguồn dữ liệu & giới hạn đã biết

Toàn bộ dữ liệu game lấy từ `genshin-db` — dữ liệu thật, không tự bịa — nhưng có vài điểm cần lưu ý khi bảo trì:

- **`releaseDate` luôn là `null`**: `genshin-db` không cung cấp ngày ra mắt ngoài đời thật, chỉ có ngày trong game. Đây là quyết định có chủ đích, không phải lỗi.
- **Ảnh tự host trên Cloudflare R2** (khuyến nghị, tùy chọn) — mặc định ảnh vẫn hotlink trực tiếp từ Enka Network/Fandom Wikia/miHoYo BBS; `SafeImage` tự ẩn ảnh lỗi thay vì hiển thị icon vỡ, nhưng nếu 1 trong 3 nguồn đổi cấu trúc URL hoặc chặn hotlink, ảnh vỡ hàng loạt không có cách tự phục hồi. Để tự host:

  ```bash
  # 1. Điền R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
  #    R2_BUCKET_NAME, R2_PUBLIC_URL trong .env — xem hướng dẫn lấy giá trị
  #    ngay trong .env.example.
  # 2. Chạy thử trước, KHÔNG upload/sửa DB gì cả:
  npm run images:mirror -- --dry-run
  # 3. Chạy thật — idempotent, chạy lại nhiều lần an toàn (bỏ qua ảnh đã mirror):
  npm run images:mirror
  ```

  Sau khi chạy, `next.config.ts` tự thêm domain R2 vào whitelist ảnh nếu thấy `R2_PUBLIC_URL` — không cần sửa gì thêm. Chạy lại `images:mirror` sau mỗi lần `db:seed` để mirror nốt ảnh của dữ liệu mới (script tự bỏ qua ảnh đã mirror từ trước, không tải/upload lại).
- **Traveler (Aether/Lumine)** cần tra cứu 2 tên khác nhau tuỳ loại dữ liệu — xem chi tiết trong `resolveTravelerSibling()`.
- Khi nâng cấp `genshin-db` lên major version mới, cần kiểm tra lại tên field trước khi seed:

  ```bash
  node -e "const db=require('genshin-db'); console.log(JSON.stringify(db.characters('Kazuha'), null, 2))"
  ```

### Phạm vi dữ liệu hiện tại (chưa có gì)

Dự án hiện chỉ phủ dữ liệu phục vụ build nhân vật. Các mảng nội dung khác của Genshin Impact **chưa** được đưa vào, dù `genshin-db` có sẵn dữ liệu thô cho phần lớn:

| Chưa có | Ghi chú |
|---|---|
| Quái/Boss (Enemy) | `Domain.monsterNames` hiện chỉ lưu tên dạng text thô, chưa có bảng riêng liên kết ngược sang `Character.ascensionMaterials` |
| Thành tựu (Achievements) | Chưa có model |
| Namecard | Chưa có model |
| Đồ nội thất Nhà Lư (Serenitea Pot) | Chưa có model |
| Thất Thánh Triệu Hồi (TCG) | Chưa có model |
| Cốt truyện / nhiệm vụ | Chưa có model |
| Sự kiện, lịch sử banner wish | Chưa có model |

### Cập nhật dữ liệu khi có bản mới của game

```bash
npm update genshin-db
npm run db:seed
npm run db:verify   # kiểm tra tính toàn vẹn dữ liệu vừa seed — xem scripts/verify-seed-integrity.ts
```

`db:verify` không chạy trong CI (CI chỉ test trên DB rỗng, không seed dữ liệu thật — xem `.github/workflows/ci.yml`), nên đây là bước thủ công bắt buộc sau mỗi lần `db:seed` nhắm vào DB production, để bắt các lớp lỗi seed "chạy xong không báo lỗi nhưng dữ liệu sai/thiếu" (2 case thật đã từng xảy ra, xem CHANGELOG.md).

---

## 🔄 CI/CD

Pipeline `.github/workflows/ci.yml` có 4 job chạy tuần tự (`needs: ...`), job nào fail thì các job phía sau **không chạy**:

1. **Lint, Typecheck & Test** (mọi push/PR) — `npm run lint` (ESLint), `npx tsc --noEmit`, rồi `npm run test` (Vitest — mock Prisma hoàn toàn, không cần DB thật nên chạy được ngay trong job này).
2. **Migrate & Build** (mọi push/PR) — dựng service Postgres tạm, `npx prisma migrate deploy`, sau đó `next build` (build có query DB thật vì dùng ISR).
3. **API smoke test** (mọi push/PR) — gọi thử các endpoint chính sau khi build để phát hiện lỗi runtime sớm.
4. **Deploy to Vercel (Production)** — **chỉ chạy khi push thẳng vào `main`** (không chạy cho PR), và chỉ sau khi 3 job trên đều pass. Job này áp migration lên **database production thật** (`prisma migrate deploy` với `DIRECT_URL` production, khác với `DIRECT_URL` giả dùng để test ở job 1–3), rồi `vercel build --prod` + `vercel deploy --prebuilt --prod`.

Workflow còn có `concurrency` (hủy run cũ hơn của cùng nhánh khi có push mới, tránh chạy trùng) và job cuối gắn với GitHub Environment `production` — bạn có thể bật [required reviewers](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment) trong **Settings → Environments → production** nếu muốn có bước duyệt thủ công trước khi lên production.

> ⚠️ Dự án dùng **ESLint v9 flat config** (`eslint.config.mjs` ở thư mục gốc) — đây là *bắt buộc*, không phải tuỳ chọn. Thiếu file này khiến `npm run lint` fail ngay lập tức với lỗi `ESLint couldn't find an eslint.config.(js|mjs|cjs) file`, khiến toàn bộ pipeline dừng lại ở bước đầu tiên. Rule `@typescript-eslint/no-explicit-any` được bật nghiêm ở `src/**` nhưng tắt riêng cho `scripts/**` (script seed làm việc với dữ liệu thô từ `genshin-db`, một package không có type definitions chính thức).

Chạy đúng những gì CI chạy trước khi push, để tránh phải chờ CI báo lỗi:

```bash
npm run lint
npx tsc --noEmit
npm run test
npm run build
```

### Vercel: chỉ hosting, không tự deploy

`vercel.json` đặt `"ignoreCommand": "exit 0"` — điều này **tắt tính năng tự build/deploy của Vercel Git integration**. Vercel vẫn giữ project (domain, SSL, env var, Image Optimization, ISR runtime...) nhưng không tự trigger deploy khi có push nữa. Việc build + deploy hoàn toàn do job `deploy-production` trong Actions gọi vào qua Vercel CLI (`vercel build` + `vercel deploy --prebuilt`) — tránh tình trạng 2 hệ thống (Vercel và Actions) cùng tự deploy song song, gây build trùng và race condition giữa 2 bản deploy.

Cần cấu hình các **GitHub Secrets** sau (Settings → Secrets and variables → Actions) để job `deploy-production` chạy được:

| Secret | Lấy ở đâu | Dùng để |
|---|---|---|
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens | Xác thực Vercel CLI |
| `VERCEL_ORG_ID` | File `.vercel/project.json` sau khi chạy `npx vercel link` ở local | `vercel pull`/`vercel build` biết đúng project |
| `VERCEL_PROJECT_ID` | File `.vercel/project.json` sau khi chạy `npx vercel link` ở local | Như trên |
| `PROD_DIRECT_URL` | Neon Console → connection string **không** có hậu tố `-pooler` | `prisma migrate deploy` lên DB production thật |

Biến môi trường runtime của app (`DATABASE_URL`, `UPSTASH_REDIS_REST_URL`/`TOKEN`, `NEXT_PUBLIC_SITE_URL`...) **không** đặt trong GitHub Secrets — vẫn khai báo trong **Vercel Project Settings → Environment Variables** như trước, vì `vercel pull` sẽ tự kéo các biến đó về lúc build.

---

## 🌍 Deploy production

Deploy production diễn ra **tự động** qua job `deploy-production` trong `.github/workflows/ci.yml` mỗi khi push vào `main` và pass hết lint/typecheck/test/build/smoke-test — xem chi tiết ở mục [CI/CD](#-cicd) phía trên. Không cần chạy tay.

Các lệnh dưới đây chỉ dùng khi cần deploy thủ công từ máy local (ví dụ Actions đang gặp sự cố, cần khắc phục khẩn cấp):

```bash
npx prisma migrate deploy   # Chỉ áp migration có sẵn, không tạo shadow DB — an toàn cho CI/CD
                             # (cần DIRECT_URL trỏ đúng DB production)
vercel build --prod
vercel deploy --prebuilt --prod
```

Nhớ set `NEXT_PUBLIC_SITE_URL` đúng domain thật trong Vercel Project Settings, nếu không `sitemap.xml`/`robots.txt` sẽ trỏ về `localhost:3000`.

---

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh! Vui lòng tạo issue hoặc pull request. Trước khi gửi PR:

```bash
npm run lint
npx tsc --noEmit
npm run test
npm run build
```

## 📄 Giấy phép

Phát hành theo giấy phép [MIT](./LICENSE). Dữ liệu game thuộc bản quyền của **miHoYo/HoYoverse**; dự án này chỉ nhằm mục đích tra cứu phi thương mại.

---

<div align="center">
  <sub>Xây dựng với ❤️ bằng Next.js, Prisma và dữ liệu từ cộng đồng Genshin Impact.</sub>
</div>