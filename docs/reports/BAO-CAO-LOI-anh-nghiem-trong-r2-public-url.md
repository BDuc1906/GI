# Báo cáo: Lỗi ảnh nghiêm trọng toàn site — `R2_PUBLIC_URL` trỏ nhầm vào endpoint riêng tư của R2

## Tóm tắt

**Nguyên nhân:** Biến môi trường `R2_PUBLIC_URL` (dùng ở production) đang
được set thành endpoint API **riêng tư** của Cloudflare R2 —
`https://<accountId>.r2.cloudflarestorage.com/<bucket>` — thay vì **Custom
Domain public** đúng như tài liệu (`.env.example`) và comment trong
`scripts/lib/r2-client.ts` mô tả.

Endpoint riêng tư này bắt buộc chữ ký AWS SigV4 để truy cập object. Trình
duyệt gọi thẳng URL này (như `<img src="...">` / `next/image` vẫn đang làm)
**luôn nhận 403 Forbidden**. Vì `scripts/mirror-images-to-r2.ts` đã mirror
gần như toàn bộ ảnh của site (nhân vật, vũ khí, thánh di vật, nguyên liệu,
bí cảnh) sang R2 và ghi URL kiểu này vào các cột `iconUrl` /
`sideIconUrl` / `splashUrl` / `elementIcon` / `imageUrl`, sự cố này khiến
**gần hết ảnh trên toàn site chết cùng lúc**.

## Bằng chứng

File `scripts/data/archive/r2-check-report-*.json` (đã commit sẵn trong
repo, tạo bởi `scripts/check-r2-objects.ts`) chứa các URL thật đang lưu
trong DB, ví dụ:

```
https://8dbf881d8c1cc0b2521d4054e476675b.r2.cloudflarestorage.com/leibo-images/characters/aino/icon.png
```

Đây chính xác là dạng `https://<accountId>.r2.cloudflarestorage.com/<bucket>/<key>`
— endpoint riêng tư, không phải domain public.

## Vì sao báo cáo cũ không phát hiện ra

`scripts/check-r2-objects.ts` (bản cũ) chỉ dùng `HeadObjectCommand` của
AWS SDK — request này **có ký** (dùng `R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`
đã cấu hình cho S3Client) nên luôn xác nhận được object **tồn tại trong
bucket**, và báo `"ok": true`. Nhưng đó không phải điều trình duyệt của
người dùng thật sự trải nghiệm — trình duyệt không có chữ ký, nên vẫn nhận
403 dù script báo "ok".

## Đã sửa gì

1. **`scripts/lib/r2-client.ts`** — `r2PublicUrl()` giờ chặn cứng
   (throw lỗi rõ ràng, kèm hướng dẫn 6 bước sửa) nếu `R2_PUBLIC_URL` khớp
   pattern endpoint riêng tư (`<32-hex>.r2.cloudflarestorage.com`). Lỗi
   này không thể tái diễn âm thầm nữa — build/mirror sẽ fail ngay với
   thông báo rõ nguyên nhân, thay vì âm thầm ghi URL chết vào DB.

2. **`next.config.ts`** — cảnh báo (console.error) thật to ngay lúc build
   nếu phát hiện `R2_PUBLIC_URL` sai dạng, và **không** thêm domain đó vào
   `remotePatterns`/CSP (tránh "hợp thức hoá" một domain build sẵn sẽ chết).

3. **`scripts/check-r2-objects.ts`** — bổ sung kiểm tra khả năng truy cập
   **public thật** (`fetch()` không chữ ký, giống trình duyệt) song song
   với `HeadObjectCommand` có ký. Một URL giờ chỉ được coi là `"ok": true`
   khi **cả hai** đều pass. Thêm cờ `error: "private-r2-endpoint"` để nhận
   diện ngay chính xác trường hợp gây ra sự cố này.

4. **`scripts/fix-broken-r2-urls.ts` (mới)** — script sửa 1 lần: quét toàn
   bộ cột ảnh trong 5 bảng (`Character`, `Material`, `Weapon`,
   `ArtifactSet`, `Domain`), tách "key" object từ URL private-endpoint cũ,
   dựng lại URL đúng bằng `r2PublicUrl()` (dùng chính `R2_PUBLIC_URL` đang
   cấu hình đúng lúc chạy), rồi update vào DB. **Không cần tải/upload lại
   ảnh** — object đã có sẵn trong bucket, chỉ cần đổi tiền tố URL.

5. **`.env.example`** — làm rõ ví dụ ĐÚNG/SAI ngay trong file, để người
   set biến môi trường trên Vercel/CI không lặp lại sự cố.

## Việc bạn cần làm (theo đúng thứ tự)

1. **Sửa cấu hình trước** (bắt buộc làm trước, nếu không script fix sẽ tự
   chặn): vào Cloudflare Dashboard → R2 → bucket của bạn → Settings →
   Public access → **Connect Domain**, trỏ 1 subdomain (vd
   `assets.leibo-domain-cua-ban.com`) vào bucket.
2. Đổi `R2_PUBLIC_URL` trong `.env` (local) **và** biến môi trường
   production (Vercel → Project → Settings → Environment Variables) thành
   domain vừa tạo ở bước 1.
3. Chạy thử (dry-run, không ghi DB):
   ```
   npm run images:fix-public-url
   ```
4. Kiểm tra output — nếu danh sách hợp lý, chạy thật:
   ```
   npm run images:fix-public-url -- --apply
   ```
5. Xác nhận lại toàn bộ:
   ```
   npm run images:mirror       # mirror nốt các ảnh còn thiếu (nếu có)
   tsx --env-file=.env scripts/check-r2-objects.ts
   ```
   Report mới sẽ không còn `"error": "private-r2-endpoint"`, và `"ok"` giờ
   phản ánh đúng khả năng truy cập public thật.
6. **Redeploy** trên Vercel (đổi env var không tự redeploy) để
   `next.config.ts` build lại `remotePatterns`/CSP với domain đúng.

## Thêm vào `package.json`

```json
"images:fix-public-url": "tsx --env-file=.env scripts/fix-broken-r2-urls.ts"
```

## Các phần khác đã rà soát, không thấy lỗi thêm

`SafeImage.tsx` (cơ chế fallback nhiều lớp: R2 → `*UrlOriginal` hotlink →
placeholder "—") thiết kế đúng và không phải nguyên nhân. `next.config.ts`
(remotePatterns/CSP) đúng logic, chỉ thiếu bước validate domain — đã bổ
sung ở trên. Không phát hiện thêm lỗi nào khác liên quan đến ảnh trong
`mirror-images-to-r2.ts`, `seed-*.ts`, hay các route API.
