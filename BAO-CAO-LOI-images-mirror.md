# Báo cáo: lỗi "Domains: 0/65" khi chạy `npm run images:mirror`

## Nguyên nhân gốc (đã xác minh bằng cách cài thật `genshin-db@5.2.12` và
gọi thẳng API của nó, không đoán)

Các bí cảnh (Domain) mới thuộc bản cập nhật gần đây (Natlan / Nod-Krai)
**dùng chung một số rất nhỏ file ảnh nền** cho hàng chục domain khác nhau.
Ví dụ, kiểm tra trực tiếp qua `genshin-db`:

| Filename gốc                        | Số domain dùng chung |
|--------------------------------------|----------------------|
| UI_DungeonPic_NTDungeon_Cycle01      | 16                   |
| UI_DungeonPic_NKDungeon_Cycle03      | 16                   |
| UI_DungeonPic_FDRelic01              | 12                   |
| UI_DungeonPic_NTCycle02              | 12                   |
| UI_DungeonPic_Ice / Water / Thunder…  | 12 mỗi loại          |
| UI_DungeonPic_XMRelic02              | 8                    |
| UI_DungeonPic_ThunderCave_Dq         | 8                    |
| ... (tổng 28 filename phủ hết 256 domain) | |

Đây là asset của nội dung **rất mới**, nên cả `enka.network` lẫn 2 CDN dự
phòng (`gi.yatta.moe`, `static.nanoka.cc`) đều **chưa kịp mirror** —
không phải do code gọi sai API hay sai field.

## Bug thật sự trong code (đây là phần đã sửa)

Script cũ **chỉ cache khi mirror THÀNH CÔNG**, không cache khi THẤT BẠI.
Hệ quả: với 1 asset chết dùng chung bởi 16 domain, script thử lại **toàn
bộ chuỗi fallback** (enka → mihoyo → fandom wiki → 2 CDN, mỗi URL retry
tối đa 3 lần kèm backoff) **lặp lại y hệt 16 lần** trong cùng một lần
chạy — đúng như log trong ảnh chụp bạn gửi (cùng 1 URL 404 lặp lại liên
tiếp cho nhiều domain khác nhau). Với hàng chục domain như vậy, một lần
chạy có thể tốn hàng chục phút một cách hoàn toàn vô ích.

Ngoài ra, cơ chế override thủ công (`MANUAL_MIRROR_FALLBACKS`) đang key
theo **id từng bản ghi**, trong khi asset lại dùng chung theo **filename**
— nghĩa là muốn vá cho 16 domain dùng chung 1 ảnh, phải gõ tay 16 dòng
giống hệt nhau.

## Đã sửa gì trong file đính kèm (`mirror-images-to-r2.ts`)

1. **Cache cả kết quả thất bại trong phạm vi 1 lần chạy** — domain thứ 2,
   3... dùng chung 1 asset đã biết chết được trả lời ngay lập tức, không
   gọi mạng lại. Giảm thời gian chạy nhiều lần với các asset dùng chung.
2. **Đổi override thủ công sang key theo filename** thay vì id
   (`MANUAL_MIRROR_FALLBACKS_BY_FILENAME`) — giờ 1 dòng vá được toàn bộ
   domain dùng chung asset đó, thay vì phải lặp lại theo từng id. Vẫn giữ
   map cũ theo id (`MANUAL_MIRROR_FALLBACKS_BY_ID`) để tương thích ngược.
3. **In tổng kết lỗi theo asset ở cuối run** thay vì hàng chục dòng
   "❌ Không thể mirror" trùng lặp — liệt kê rõ từng filename còn thiếu và
   số bản ghi bị ảnh hưởng, sắp theo mức ảnh hưởng giảm dần, để bạn biết
   nên ưu tiên tìm nguồn thay thế cho asset nào trước.
4. Gộp `fandomMap` (trước đây khai báo lại mỗi lần gọi hàm) thành 1 hằng
   số module-level `FANDOM_DUNGEON_PIC_MAP`, tránh tạo lại object không
   cần thiết mỗi lần gọi `getFallbackUrls()`.

Đã kiểm tra cú pháp/kiểu bằng `esbuild` — biên dịch sạch, không lỗi.
Logic được rà lại thủ công dòng theo dòng và đối chiếu diff với bản gốc.

## Việc tôi KHÔNG làm — vì sao

Tôi có tìm vài nguồn ảnh thay thế khả dĩ (wiki, honeyhunterworld...) cho
các filename Natlan/Nod-Krai đang thiếu, nhưng **không xác minh chắc chắn
được URL trực tiếp còn sống** bằng công cụ hiện có. Tôi cố tình **không
đoán bừa và nhét vào `MANUAL_MIRROR_FALLBACKS_BY_FILENAME`**, vì một URL
sai sẽ âm thầm mirror nhầm ảnh vào R2 — hậu quả khó phát hiện hơn nhiều so
với việc domain đó tạm thời hiện "—" (không có ảnh).

**Việc bạn cần làm tiếp:** chạy lại `npm run images:mirror`, đọc phần
tổng kết mới ở cuối log (giờ liệt kê rõ từng filename + số domain bị ảnh
hưởng), tự tìm 1 URL ảnh còn sống cho các filename ảnh hưởng nhiều domain
nhất, rồi thêm vào `MANUAL_MIRROR_FALLBACKS_BY_FILENAME`. Vì đây là asset
rất mới, nhiều khả năng chỉ cần đợi vài tuần để `enka.network`/2 CDN kia
tự cập nhật là domain sẽ tự mirror thành công ở lần chạy sau, không cần
can thiệp tay.

## Các phần khác đã rà soát nhưng không thấy lỗi

Tôi đã đọc kỹ và không thấy vấn đề ở: `middleware.ts` (CORS), `rate-limit.ts`,
`env.ts`, `prisma.ts` (SSL/connection pooling), `pagination.ts`/`query.ts`
(validate input), `next.config.ts` (CSP/remotePatterns), `SafeImage.tsx`
(cơ chế fallback ảnh). Code phần này viết cẩn thận, có comment giải thích
rõ lý do từng quyết định — chất lượng tốt cho một dự án chạy dài hạn.
