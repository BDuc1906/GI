# LEIBO — Genshin Impact Database

Web dữ liệu Genshin Impact (nhân vật / vũ khí / thánh di vật) dùng Next.js + Prisma + Postgres (Neon).
Toàn bộ dữ liệu game lấy từ package `genshin-db` (trích xuất từ dữ liệu chính thức của game, cộng đồng cập nhật theo mỗi bản mới).

## Cài đặt (chuẩn, có bảo mật)

1. `npm install`
2. Trong [Neon Console](https://console.neon.tech) → project của bạn → **Connect**:
   - Nếu đây là project bạn từng dùng chung với thông tin đã dán ra ngoài (chat, log công khai...) trước đây — đổi mật khẩu database ngay (Neon Console → Settings → Reset password).
   - Lấy connection string **"Pooled connection"** (host có hậu tố `-pooler`) cho `DATABASE_URL` — dùng cho app runtime, đi qua PgBouncer nên chịu được nhiều connection đồng thời (quan trọng vì serverless/edge có thể mở nhiều connection song song).
   - Lấy connection string **"Direct connection"** (host KHÔNG có `-pooler`) cho `DIRECT_URL` — chỉ dùng riêng cho `prisma migrate`, không dùng cho app runtime.
3. Copy `.env.example` → `.env`, điền `DATABASE_URL`/`DIRECT_URL`. File `.env` đã có trong `.gitignore`, không commit lên Git.
   `NEXT_PUBLIC_SITE_URL` chỉ cần điền khi deploy thật (dùng để sinh `sitemap.xml`/`robots.txt` đúng domain) — bỏ qua khi chạy local.
4. Tạo bảng bằng migration có lịch sử (không dùng `db push` cho dự án thật):
   ```bash
   npx prisma migrate dev --name init
   ```
5. Seed dữ liệu thật: `npm run db:seed`
6. Chạy dev: `npm run dev`

## Deploy production

Không chạy `migrate dev` trên production. Dùng:
```bash
npx prisma migrate deploy
```
Lệnh này chỉ áp các migration đã có sẵn trong `prisma/migrations/`, không tạo shadow DB, an toàn cho CI/CD.

## Bảo mật

- `.env` không bao giờ được commit — đã cấu hình trong `.gitignore`.
- Kết nối bắt buộc SSL (`src/lib/prisma.ts`) — Neon luôn dùng chứng chỉ hợp lệ nên `rejectUnauthorized: true` ở mọi môi trường.
- `src/lib/env.ts` validate biến môi trường bắt buộc ngay khi app khởi động (`assertEnv()` được gọi từ `src/lib/prisma.ts`) — thiếu `DATABASE_URL` hoặc sai định dạng URL sẽ báo lỗi rõ ràng ngay lập tức, thay vì crash mơ hồ ở request đầu tiên.
- Khuyến nghị: dùng Neon **Roles** để tạo Postgres role riêng cho app runtime (least privilege) thay vì role owner mặc định, nếu chạy production lâu dài.
- Neon có **branching** (tạo nhánh DB riêng cho môi trường dev/preview, tách khỏi production) — cân nhắc dùng khi có nhiều người cùng phát triển, tránh seed/test đè lên dữ liệu production.
- `scripts/seed.ts` chỉ log host/port của DB, không log full connection string (tránh lộ mật khẩu ra log CI).
- Ảnh nhân vật/vũ khí/di vật hotlink trực tiếp từ Enka Network & Fandom Wikia. `next.config.ts` whitelist đúng các host đang dùng (không dùng wildcard `**`) để tránh next/image bị lợi dụng proxy ảnh từ domain bất kỳ.

## SEO

- `src/app/sitemap.ts` và `src/app/robots.ts` (file-based, Next.js tự generate `/sitemap.xml` và `/robots.txt`) — sitemap liệt kê toàn bộ nhân vật/vũ khí/thánh di vật hiện có trong DB, tự cập nhật theo dữ liệu.
- Mỗi trang chi tiết (`characters/[id]`, `weapons/[id]`, `artifacts/[id]`) có `generateMetadata` riêng (title/description theo đúng tên) — quan trọng khi chia sẻ link lên mạng xã hội/Discord.
- Cần set `NEXT_PUBLIC_SITE_URL` đúng domain thật khi deploy production, nếu không sitemap/robots sẽ trỏ về `localhost:3000`.

## Nguồn dữ liệu & giới hạn

Toàn bộ dữ liệu game lấy từ package `genshin-db`, dữ liệu thật (không tự bịa), nhưng có vài giới hạn cần biết khi maintain:

- **`releaseDate` luôn `null`** — `genshin-db` không cung cấp ngày ra mắt ngoài đời thật, chỉ có ngày trong game/banner. Đây là quyết định có chủ đích (để trống thay vì đoán), không phải bug.
- **Ảnh (`iconUrl`, `splashUrl`, `sideIconUrl`)** hotlink trực tiếp từ Enka Network. Nếu Enka đổi cấu trúc URL, ảnh sẽ vỡ hàng loạt — `SafeImage` component (`src/components/SafeImage.tsx`) tự ẩn ảnh lỗi thay vì hiện icon vỡ, nhưng không tự sửa được nguồn. Cân nhắc tự host ảnh (S3/R2) nếu dự án chạy production lâu dài.
- **Script seed được tách theo domain** (`scripts/seed.ts` là điểm vào, gọi lần lượt `seed-characters.ts` → `seed-weapons.ts` → `seed-artifacts.ts`; helper dùng chung nằm ở `scripts/lib/seed-helpers.ts`). Trước đây cả 3 loại dữ liệu bị gộp chung vào 1 file tên `seed-characters.ts` — dễ gây nhầm khi tìm chỗ sửa logic vũ khí/di vật.
- **Tên field thiên phú thật của `genshin-db`** là `combat1/combat2/combatsp/combat3/passive1..4` (xem `scripts/seed-characters.ts`), khác với field name trực quan `elementalSkill`/`elementalBurst`... Nếu update `genshin-db` lên major version mới, kiểm tra lại field name bằng lệnh ở mục dưới trước khi seed, tránh lặp lại lỗi field-mismatch từng khiến thiên phú/cung mệnh rỗng toàn bộ.
- **Traveler (Aether/Lumine)** cần tra 2 tên khác nhau tuỳ loại dữ liệu: `"Aether"/"Lumine"` cho thông tin nhân vật, `"Traveler (<Element>)"` cho thiên phú/cung mệnh — xem comment chi tiết trong `seedTraveler()`.


## Cập nhật dữ liệu khi có bản mới của game

```bash
npm update genshin-db
npm run db:seed
```

## Lưu ý quan trọng

Tên field chính xác từ `genshin-db` (v5.2.12) trong `scripts/seed-characters.ts` được viết dựa trên
cấu trúc phổ biến của package này, nhưng **bạn nên kiểm tra lại 1 lần bằng cách chạy**:

```bash
node -e "const db=require('genshin-db'); console.log(JSON.stringify(db.characters('Kazuha'), null, 2))"
```

rồi đối chiếu tên field thực tế (vd `elementText`, `weaponText`, `baseStats`, `images`...) với script seed,
vì tool trong sandbox này không có quyền truy cập mạng để cài đặt và kiểm tra trực tiếp package.