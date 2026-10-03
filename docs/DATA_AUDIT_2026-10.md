# Kiểm toán dữ liệu, route và SEO — 2026-10-03

## Kết luận điều hành

Database đã được seed lại từ `genshin-db@5.2.14`, schema production được đồng
bộ bằng migration có thể tái lập, lỗi dữ liệu Traveler trong các dòng variant
đã được sửa, và các route/namecard/material có sai lệch rõ ràng đã được chỉnh.
Mười lăm nhóm dữ liệu thô khớp chính xác với snapshot crawl của cùng package.

**Không thể tuyên bố toàn bộ dữ liệu “chính xác tuyệt đối”.** `genshin-db` là
nguồn cộng đồng, HoYoWiki cũng tự mô tả là dữ liệu cùng xây dựng bởi editor và
người chơi. Có trường hợp package mới trả dữ liệu chi phí sai/placeholder, và
chưa thể xác minh độc lập mọi chỉ số, nội dung lịch sử hay cách phân loại wiki.
Bản ghi không chắc chắn được liệt kê bên dưới thay vì được coi là đã xác nhận.

## Phạm vi và cách kiểm tra

- Ngày kiểm tra: 2026-10-03.
- Package được ghim: `genshin-db@5.2.14`; package trước đó: `5.2.13`.
- Upstream README nói package dùng dữ liệu từ Fandom Wiki và GenshinData; cùng
  README cảnh báo định dạng có thể thay đổi theo phiên bản.
- So sánh `5.2.13` và `5.2.14` theo ID nguồn, cấu trúc JSON chuẩn hoá theo
  thứ tự key và các folder tương ứng.
- Crawl 15 folder phụ, so sánh record `raw` đã lưu trong DB với snapshot theo
  ID. Characters được so sánh riêng theo `raw` của 122 record crawl.
- Kiểm tra record counts của cả 20 Prisma models, các invariant sau seed,
  migration status/schema diff, package projection của weapon/artifact, material
  references và danh mục HoYoWiki truy cập được.
- Đây là kiểm tra tính nhất quán nguồn + cấu trúc. Không phải dump/so sánh từng
  byte của game client và không thay thế xác minh mọi field trong gameplay.

## Nguồn đối chiếu và giới hạn

- [genshin-db upstream](https://github.com/theBowja/genshin-db) và package
  [5.2.14 trên npm](https://www.npmjs.com/package/genshin-db/v/5.2.14).
- [HoYoWiki Genshin Impact](https://wiki.hoyolab.com/pc/genshin/). Trang ghi
  rằng đây là database do HoYoLAB editors và players cùng xây dựng.
- Fandom bị HTTP 403 trong môi trường audit; các trang wiki.gg đã thử không
  truy cập được; shell HoYoWiki có thể mở nhưng phần catalog/render không đọc
  trực tiếp như trang HTML tĩnh. Vì thế package comparisons và API/catalog
  HoYoWiki không phải xác nhận độc lập cho toàn bộ trường.
- Số lượng danh mục HoYoWiki ghi dưới đây là kết quả truy vấn menu/catalog tại
  thời điểm audit; chênh lệch danh sách không đồng nghĩa tự động với lỗi dữ liệu.

## Database sau seed

| Model | Số dòng |
|---|---:|
| Character | 138 |
| Weapon | 253 |
| ArtifactSet | 63 |
| Material | 565 |
| Domain | 72 |
| AchievementGroup | 73 |
| Achievement | 1,558 |
| AdventureRank | 60 |
| Animal | 223 |
| Constellation | 127 |
| Craft | 295 |
| ElementInfo | 7 |
| Enemy | 347 |
| Food | 403 |
| Geography | 268 |
| Namecard | 293 |
| Outfit | 152 |
| Rarity | 5 |
| Talent | 127 |
| Windglider | 19 |
| **Tổng** | **5,048** |

Character count 138 gồm 122 record canonical của crawl, 14 dòng Traveler theo
nguyên tố và 2 record Manekin/Manekina được giữ lại theo yêu cầu. Vì thế count
không được diễn giải là 138 playable characters.

## Khớp snapshot và cập nhật package

### Snapshot crawl → database

Mỗi nhóm dưới đây khớp tất cả record theo ID và JSON `raw`; không có thiếu,
thừa hoặc JSON khác trong lần so sánh:

| Folder | Số record khớp |
|---|---:|
| achievementgroups | 73 |
| achievements | 1,558 |
| adventureranks | 60 |
| animals | 223 |
| constellations | 127 |
| crafts | 295 |
| elements | 7 |
| enemies | 347 |
| foods | 403 |
| geographies | 268 |
| namecards | 293 |
| outfits | 152 |
| rarity | 5 |
| talents | 127 |
| windgliders | 19 |

122/122 `Character.raw` trong database cũng trùng JSON thô của crawl. Các
trường transformed được kiểm tra riêng cho weapon/artifact và Traveler.

### `genshin-db` 5.2.13 → 5.2.14

| Folder | Bản ghi mới / thay đổi |
|---|---|
| Characters | Thêm Vesna và Vodyanitsa. Hai companion Manekin/Manekina cũng có trong danh sách package nhưng bị quy tắc crawl hiện tại loại khỏi tập playable. |
| Weapons | Thêm Beyond the Chrysalis, Breezeborne Refrain, Hymn of the Maelstrom, New Bough, Silver Light, Winter's Heavy Heart. Story thay đổi ở Blade of Atonement, Clash of Kings và Heretic's Molten Blade. |
| Artifacts | Heart of the Furnace đổi `effect4Pc`; Scarlet Proof đổi `effect4Pc` và `sands`. DB sau seed khớp các bonus hiện tại của package. |
| Materials | Thêm Tea-Scented Tassel và Vagabond's Cracked Armor; thay đổi Bluebeech Wood description, Cryo Sigil/Luna Sigil sort rank, Rise of the Pale Star Army description, ảnh Snow Poplar Wood và White Birch Wood. |
| Achievements | Thêm 10; `Across the Icebound Snowscape (I)` đổi `stage1`. |
| Animals | 19 record đổi `sortOrder`; không thêm/xóa record. |
| Constellations | Thêm Vesna và Vodyanitsa. |
| Enemies | Thêm Guardian Blade of Drifting Snow. |
| Foods | Thêm Celestial Tea Crisp, Hoarfrost Soup, Iridescent Aria, Mors và Royal Grilled Fish. |
| Namecards | Thêm Snezhnaya: Frostfall, Travel Notes: Moontrace, Vesna: Revelry và Vodyanitsa: Whirlpool. |
| Outfits | Thêm Spring's Bond, Winter's Oath và Surging Resonance. |
| Talents | Thêm Vesna/Vodyanitsa; Alyosha đổi `combat3` và `passive4`; Odette đổi `combat2`, `combat3` và `passive4`. |
| Windgliders | Thêm Wings of Starry Winterfrost. |
| Domains | Không phát hiện thay đổi giữa hai phiên bản được so sánh. |

### Package projection vào bảng chính

- Character: 122/122 JSON thô khớp nguồn crawl.
- Weapon: 253 record lưu khớp tên, description, version và base ATK với package;
  ascension costs khớp ngoại trừ trường hợp dưới đây.
- ArtifactSet: 63/63 bonus 4 mảnh khớp nguồn 5.2.14.
- Domain: 72 record được nhóm từ 284 entry domain theo độ khó; package domains
  không đổi giữa hai phiên bản.
- Name translations: audit trước đó không phát hiện mismatch ở 5 bảng tên dịch
  so với nguồn game-name đã cài cho các locale có tên chính thức trong package.

## Ngoại lệ còn cần xác minh độc lập

### Exaiphanes Blade

Package 5.2.14 đổi description từ “light of the very stars” sang “Pale Star's
light”, đồng thời trả về `Mora = 0` và không có nguyên liệu khác ở cả sáu
ascension phase. Seed guard đã ngăn ghi đè chi phí nâng cấp cũ bằng placeholder.
DB hiện giữ sáu phase chi phí từ snapshot 5.2.13; description và game version
đã cập nhật theo package 5.2.14.

**Trạng thái:** description khớp package mới; chi phí DB có nguồn package cũ và
chưa được xác nhận độc lập với game/wiki tại lần audit này.

### Traveler và companion

- 14 dòng Aether/Lumine theo bảy nguyên tố hiện có ít nhất 5 talent và đúng
  6 constellation; Cryo có 6 talent theo package 5.2.14. Script
  `scripts/fix/fix-traveler-element-talents.ts` tái tạo các trường này từ
  `Traveler (Element)` trong nguồn.
- Hai dòng Aether/Lumine gốc lưu bộ Anemo làm mặc định vì record canonical
  `Aether`/`Lumine` của package không chỉ rõ một nguyên tố.
- Manekin/Manekina được giữ trong DB theo yêu cầu người dùng nhưng không được
  tính/hiển thị như playable character ở catalog nhân vật công khai. Integrity
  check phát 2 cảnh báo có chủ đích.

### Enemy metadata mở rộng

Trước audit, `seed-enemies-enhanced.ts` gán drop rate cố định 10% và suy diễn
weakness, behavior, spawn regions, difficulty từ tên/nhóm. Cơ chế đó đã bị loại
khỏi auto-sync và codebase để tránh ghi dữ liệu suy luận như sự thật. Các cột
schema mở rộng vẫn tồn tại; không có dữ liệu suy diễn mới được seed bởi pipeline.
Chỉ dùng trường này khi có nguồn cụ thể và ghi nguồn riêng.

### Material

- 565 dòng trong bảng Material; 529 tên tham chiếu qua dữ liệu có cấu trúc đã
  kiểm tra đều có record tương ứng (0 tên thiếu).
- 56 dòng không được các trường nguyên liệu cấu trúc đang kiểm tra tham chiếu;
  55 tên trùng tên artifact set và `Sourcewater Droplet` là trường hợp còn lại.
- Không xóa các dòng này: có thể là phân loại inventory riêng hoặc dữ liệu cũ;
  cần xác định nguồn và quan hệ sử dụng trước khi dọn.

## Đối chiếu HoYoWiki

Catalog menu truy vấn được: Character 130, Weapon 252, Artifact 63, Enemy 420,
Teyvat resources 4,151, Wildlife 223, Namecard 292.

- Artifact names: 63/63 tên DB cũ có mặt.
- Enemy names: 346/346 tên DB cũ có mặt trong 420 mục. Các mục phụ trội chưa
  được phân loại từng record.
- Wildlife names: 223/223 tên DB có mặt.
- Weapon: 6 weapon 7.1 mới có trong package/DB sau seed. `Prized Isshin Blade`
  có trong local package nhưng không thấy trong catalog HoYoWiki đã truy vấn;
  chưa xác định đây là khác biệt phạm vi hay record cần sửa.
- Namecards: catalog có 292 mục, bảng sau seed có 293. `Celebration: Tuneful
  Delight` từng là mục local-only trong phép đối chiếu; chưa được xác minh là
  stale hay do khác biệt phạm vi/name.
- Số lượng catalog hoặc trùng tên không chứng minh thiếu/thừa nếu catalog dùng
  nhóm, alias hoặc loại nội dung khác nhau.

## Schema và migration

- Migration `20261003100000_restore_missing_seed_columns` được lưu trong Git và
  đã được áp dụng. Nó phục hồi `Weapon.gameVersion`, `ArtifactSet.gameVersion`
  cùng các cột/index Enemy được khai báo trong Prisma nhưng thiếu ở database.
- `prisma migrate status` báo up-to-date; `prisma migrate diff` giữa datasource
  được cấu hình và schema Prisma báo không có khác biệt.
- `DATABASE_URL` là pooled connection runtime; `DIRECT_URL` là kết nối direct
  cho migration. Cần bảo đảm cả hai URL cùng trỏ đúng môi trường/database.

## Route, folder và SEO

Đã sửa các sai lệch đã xác nhận:

- `/namecards` đọc `Namecard` thay vì `Outfit`.
- `/outfits` đọc `Outfit`, không còn trùng trang `/windgliders`.
- Achievement list dùng phân trang, nên có thể duyệt đủ 1,558 bản ghi thay vì
  chỉ 100 mục đầu.
- Các trang materials, crafts, animals, adventure ranks, geography và food
  không còn cắt danh sách bằng giới hạn cứng mà không báo.
- Sitemap có các trang danh mục công khai theo 15 locale, trang công cụ và
  detail pages có ID; Manekin/Manekina được loại khỏi catalog và sitemap công khai.
- Đã kiểm tra 515 tracked file paths: không có xung đột tên phân biệt hoa/thường.
  Route outfits/windgliders trước đây trùng byte đã được tách đúng trách nhiệm.
  Ba ADR và một file `cache.ts` rỗng đã được thay bằng nội dung hợp lệ hoặc xóa
  sau khi xác nhận không có import.

`NEXT_PUBLIC_SITE_URL` vẫn phải được cấu hình đúng domain production; fallback
localhost chỉ phù hợp phát triển. Báo cáo này không khẳng định mọi trang đã có
metadata riêng được bản địa hoá hoàn chỉnh.

## Kiểm tra sau cập nhật

- `npm run db:verify`: đạt; chỉ có 2 cảnh báo Manekin/Manekina được giữ lại.
- `npx prisma migrate status`: 20 migration, up-to-date.
- `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code`: không có khác biệt.
- Typecheck: đạt sau khi chạy `npx next typegen` để tái sinh route types.
- Unit tests: 20 test files, 109 tests đạt.
- Lint cho các file đã sửa: đạt ở lượt kiểm tra trước cập nhật tài liệu.

**Giới hạn còn lại:** không xác nhận tuyệt đối được mọi tên/dịch/balance/drop
rate/field gameplay chỉ bằng nguồn community và danh mục wiki. Hãy giữ các
ngoại lệ ở trạng thái “chưa xác minh độc lập” cho tới khi có chứng cứ mới.
