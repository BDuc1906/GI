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

**LEIBO** là một ứng dụng web tra cứu dữ liệu **Genshin Impact**, cung cấp thông tin chi tiết và có cấu trúc về **nhân vật**, **vũ khí**, **thánh di vật (artifact set)** và **nguyên liệu đột phá/thiên phú**.

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
| 🔍 **Tìm kiếm tổng hợp** | Tìm kiếm xuyên suốt cả 4 loại dữ liệu trong một endpoint |
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
| **Chất lượng code** | ![ESLint](https://img.shields.io/badge/-ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white) | Kiểm tra style & lỗi tĩnh |
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
│   ├── seed.ts                     # Điểm vào seed, gọi lần lượt seed-characters → weapons → artifacts
│   ├── seed-characters.ts
│   ├── seed-weapons.ts
│   ├── seed-artifacts.ts
│   └── lib/seed-helpers.ts         # Helper dùng chung: slugify, upsertMaterial, resolve icon URL...
├── src/
│   ├── app/
│   │   ├── api/                    # REST API (route handlers)
│   │   │   ├── characters | weapons | artifacts | materials
│   │   │   ├── search/              # Tìm kiếm tổng hợp
│   │   │   ├── health/              # Health check
│   │   │   └── route.ts             # Mục lục API (GET /api)
│   │   ├── characters | weapons | artifacts | search   # Trang giao diện (SSR)
│   │   ├── sitemap.ts / robots.ts   # SEO tự sinh theo dữ liệu DB
│   │   └── layout.tsx / error.tsx / not-found.tsx
│   ├── components/                 # ElementIcon, SafeImage, SearchBar, ThemeToggle...
│   └── lib/
│       ├── api/                    # errors.ts, query.ts, response.ts — chuẩn hoá API
│       ├── prisma.ts               # Khởi tạo Prisma Client + adapter pg + SSL
│       └── env.ts                  # Validate biến môi trường bắt buộc
├── next.config.ts                  # Whitelist domain ảnh (chống SSRF)
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
| `GET` | `/api/search?q=...` | Tìm kiếm tổng hợp trên cả 4 loại dữ liệu |

> Phân trang mặc định `limit=24`, tối đa `limit=100` — chặn client kéo toàn bộ bảng trong 1 request.

---

## 🔐 Bảo mật

- `.env` không bao giờ commit — kiểm soát qua `.gitignore`.
- Kết nối DB luôn bắt buộc SSL (`rejectUnauthorized: true`) tại `src/lib/prisma.ts`.
- `src/lib/env.ts` validate biến môi trường **ngay khi khởi động app** — thiếu/sai `DATABASE_URL` sẽ báo lỗi rõ ràng thay vì crash mơ hồ ở request đầu tiên.
- `next.config.ts` chỉ whitelist đúng các domain ảnh đang dùng (Enka Network, Fandom Wikia, miHoYo BBS) — không dùng wildcard `**`, tránh next/image bị lợi dụng làm proxy ảnh (SSRF).
- Khuyến nghị dùng **Neon Roles** để tạo Postgres role riêng cho runtime (least privilege) thay vì role owner mặc định khi chạy production lâu dài.
- Có thể tận dụng **Neon Branching** để tách DB dev/preview khỏi production khi nhiều người cùng phát triển.
- `scripts/seed.ts` chỉ log host/port của DB, **không** log full connection string.

---

## 📊 Nguồn dữ liệu & giới hạn đã biết

Toàn bộ dữ liệu game lấy từ `genshin-db` — dữ liệu thật, không tự bịa — nhưng có vài điểm cần lưu ý khi bảo trì:

- **`releaseDate` luôn là `null`**: `genshin-db` không cung cấp ngày ra mắt ngoài đời thật, chỉ có ngày trong game. Đây là quyết định có chủ đích, không phải lỗi.
- **Ảnh hotlink trực tiếp** từ Enka Network/Fandom Wikia. `SafeImage` tự ẩn ảnh lỗi thay vì hiển thị icon vỡ; cân nhắc tự host ảnh (S3/R2) nếu chạy production lâu dài.
- **Traveler (Aether/Lumine)** cần tra cứu 2 tên khác nhau tuỳ loại dữ liệu — xem chi tiết trong `resolveTravelerSibling()`.
- Khi nâng cấp `genshin-db` lên major version mới, cần kiểm tra lại tên field trước khi seed:

  ```bash
  node -e "const db=require('genshin-db'); console.log(JSON.stringify(db.characters('Kazuha'), null, 2))"
  ```

### Cập nhật dữ liệu khi có bản mới của game

```bash
npm update genshin-db
npm run db:seed
```

---

## 🌍 Deploy production

```bash
npx prisma migrate deploy   # Chỉ áp migration có sẵn, không tạo shadow DB — an toàn cho CI/CD
npm run build
npm run start
```

Nhớ set `NEXT_PUBLIC_SITE_URL` đúng domain thật, nếu không `sitemap.xml`/`robots.txt` sẽ trỏ về `localhost:3000`.

---

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh! Vui lòng tạo issue hoặc pull request. Trước khi gửi PR:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## 📄 Giấy phép

Phát hành theo giấy phép [MIT](./LICENSE). Dữ liệu game thuộc bản quyền của **miHoYo/HoYoverse**; dự án này chỉ nhằm mục đích tra cứu phi thương mại.

---

<div align="center">
  <sub>Xây dựng với ❤️ bằng Next.js, Prisma và dữ liệu từ cộng đồng Genshin Impact.</sub>
</div>