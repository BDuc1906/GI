# LEIBO — Genshin Impact Database

Web dữ liệu Genshin Impact (nhân vật / vũ khí / thánh di vật) dùng Next.js + Prisma + Postgres (Supabase).
Toàn bộ dữ liệu game lấy từ package `genshin-db` (trích xuất từ dữ liệu chính thức của game, cộng đồng cập nhật theo mỗi bản mới).

## Cài đặt (chuẩn, có bảo mật)

1. `npm install`
2. Trong Supabase Dashboard → Settings → Database:
   - Đổi mật khẩu database (Reset database password) — không dùng lại mật khẩu cũ nếu đã từng dán ra ngoài (chat, log công khai...).
   - Lấy **Transaction pooler** (cổng `6543`) cho `DATABASE_URL` — dùng cho app runtime.
   - Lấy **Direct connection** (host dạng `db.<project-ref>.supabase.co`, cổng `5432`) cho `DIRECT_URL` — dùng riêng cho migrate, không dùng session pooler.
3. Copy `.env.example` → `.env`, điền 2 URL trên. File `.env` đã có trong `.gitignore`, không commit lên Git.
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
- Kết nối bắt buộc SSL (`src/lib/prisma.ts`), strict ở production.
- Khuyến nghị: tạo Postgres role riêng cho app runtime (least privilege) thay vì dùng thẳng user `postgres` (superuser) trong production lâu dài.

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
