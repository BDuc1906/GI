# LEIBO API — Tài liệu API

> File này là **nguồn thật duy nhất**. `public/docs/api.md` là bản copy tự
> sinh (chạy `scripts/sync-docs.mjs` qua hook `predev`/`prebuild`) để phục
> vụ ở `/docs/api.md` — sửa tài liệu thì luôn sửa ở đây, không sửa bản copy.

Cơ sở dữ liệu Genshin Impact (nhân vật, vũ khí, thánh di vật, nguyên liệu,
bí cảnh) — API public, chỉ đọc (read-only), không cần xác thực (API key).

## Base URL

```
https://<domain-của-bạn>/api
```

## CORS

Toàn bộ `/api/*` trả `Access-Control-Allow-Origin: *` (xem `middleware.ts`)
— gọi thẳng bằng `fetch()` từ browser ở bất kỳ domain nào đều hoạt động,
không cần proxy qua server riêng. Chỉ hỗ trợ `GET`; preflight `OPTIONS`
được middleware trả `204` trực tiếp, không chạm route handler/rate limit/DB.

## Envelope response chuẩn

Mọi endpoint đều trả về đúng 1 trong 2 dạng sau, không có ngoại lệ (kể cả
lỗi 500 bất ngờ) — client chỉ cần check field `success`.

**Thành công:**
```json
{
  "success": true,
  "data": { },
  "meta": { "page": 1, "limit": 24, "total": 96, "totalPages": 4 }
}
```
`meta` chỉ xuất hiện ở các endpoint danh sách (list), không có ở endpoint
chi tiết (detail).

**Lỗi:**
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Tham số \"rarity\" không hợp lệ: \"9\" (chỉ nhận 1–5)",
    "details": { "value": "9" }
  }
}
```
`details` là optional, không phải lỗi nào cũng có.

### Mã lỗi (`error.code`)

| Code                  | HTTP status | Ý nghĩa                                      |
|-----------------------|-------------|-----------------------------------------------|
| `BAD_REQUEST`         | 400         | Tham số query không hợp lệ                    |
| `NOT_FOUND`           | 404         | Không tìm thấy resource theo `id`             |
| `RATE_LIMITED`        | 429         | Vượt quá giới hạn request (xem mục Rate limit)|
| `DATABASE_ERROR`      | 500         | Lỗi truy vấn CSDL (không leak chi tiết Prisma)|
| `DATABASE_UNAVAILABLE`| 503         | Không kết nối được CSDL                       |
| `INTERNAL_ERROR`      | 500         | Lỗi không xác định                            |

## Rate limiting

Toàn bộ endpoint (trừ `/api` và `/api/health`) đều giới hạn theo IP:

| Endpoint                     | Giới hạn        |
|-------------------------------|-----------------|
| `/api/characters*`            | 60 request/phút |
| `/api/weapons*`                | 60 request/phút |
| `/api/artifacts*`              | 60 request/phút |
| `/api/materials*`              | 60 request/phút |
| `/api/domains*`                 | 60 request/phút |
| `/api/search`                  | 30 request/phút (chạy 4 query song song mỗi lần gọi) |

Vượt giới hạn → `429 RATE_LIMITED`, kèm header:

```
Retry-After: 15
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1785999999999
```

## Phân trang (list endpoints)

| Param   | Mặc định | Ghi chú                          |
|---------|----------|-----------------------------------|
| `page`  | 1        | Số nguyên dương                   |
| `limit` | 24       | Số nguyên dương, tối đa 100       |

## Sắp xếp (list endpoints)

Param `sort` nhận `field` (asc) hoặc `-field` (desc). Field không nằm trong
whitelist của resource đó sẽ trả `400 BAD_REQUEST`.

---

## `GET /api` — mục lục API

```bash
curl https://<domain>/api
```
Trả về danh sách endpoint hiện có, không rate limit, không chạm DB (static).

---

## `GET /api/health` — kiểm tra tình trạng CSDL

```bash
curl https://<domain>/api/health
```
Chạy `SELECT 1` thật, không rate limit (để service monitoring gọi tự do).

```json
{ "success": true, "data": { "status": "ok", "latencyMs": 12 } }
```

`?counts=true` (opt-in, không dùng cho polling tự động vì tốn thêm query
COUNT trên cả 5 bảng): trả kèm số dòng từng bảng, hữu ích để xác nhận seed
sau khi chạy `npm run db:seed` mà chưa muốn đăng nhập DB thủ công.

```bash
curl "https://<domain>/api/health?counts=true"
```
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "latencyMs": 12,
    "counts": { "characters": 120, "weapons": 140, "artifacts": 45, "materials": 210, "domains": 65 }
  }
}
```

---

## `GET /api/characters` — danh sách nhân vật

| Param        | Ví dụ            | Ghi chú                                          |
|--------------|------------------|----------------------------------------------------|
| `q`          | `kazuha`         | Tìm theo tên, không phân biệt hoa/thường           |
| `vision`     | `Pyro,Hydro`     | Lọc nguyên tố, nhiều giá trị cách nhau dấu phẩy    |
| `weaponType` | `Sword`          | Lọc loại vũ khí, nhiều giá trị cách nhau dấu phẩy  |
| `rarity`     | `4,5`            | Lọc phẩm cấp (1–5)                                 |
| `sort`       | `-rarity`        | `name` \| `rarity` \| `createdAt` (mặc định `-rarity`) |
| `page`,`limit` |                |                                                     |

```bash
curl "https://<domain>/api/characters?vision=Pyro&rarity=5&sort=-rarity&limit=10"
```

Mỗi item trong `data`:
```json
{
  "id": "kazuha",
  "name": "Kaedehara Kazuha",
  "title": "Poet Vagrant",
  "vision": "Anemo",
  "weaponType": "Sword",
  "rarity": 5,
  "region": "Inazuma",
  "iconUrl": "https://...",
  "elementIcon": "https://..."
}
```

## `GET /api/characters/:id` — chi tiết nhân vật

```bash
curl https://<domain>/api/characters/kazuha
```
Trả về toàn bộ field của nhân vật, gồm `talents`, `constellations`,
`ascensionMaterials`, `talentMaterials`, `statsByLevel`, `voiceActors`...
`404 NOT_FOUND` nếu `id` không tồn tại.

---

## `GET /api/weapons` — danh sách vũ khí

| Param   | Ví dụ      | Ghi chú                                                        |
|---------|------------|------------------------------------------------------------------|
| `q`     | `mistsplitter` | Tìm theo tên                                                  |
| `type`  | `Sword,Bow`    | `Sword` \| `Claymore` \| `Polearm` \| `Bow` \| `Catalyst`     |
| `rarity`| `5`            | 1–5                                                            |
| `sort`  | `-baseAtk`     | `name` \| `rarity` \| `baseAtk` \| `createdAt` (mặc định `-rarity`) |
| `page`,`limit` |         |                                                                 |

## `GET /api/weapons/:id` — chi tiết vũ khí

Trả về toàn bộ field, gồm `passiveByRefinement` (5 mốc tinh luyện) và
`ascensionMaterials`.

---

## `GET /api/artifacts` — danh sách bộ thánh di vật

| Param    | Ví dụ  | Ghi chú                                            |
|----------|--------|------------------------------------------------------|
| `q`      | `gladiator` | Tìm theo tên                                     |
| `rarity` | `5`         | Lọc set CÓ chứa phẩm cấp này trong `rarityRange` |
| `sort`   | `name`      | `name` \| `createdAt` (mặc định `name`)          |
| `page`,`limit` |       |                                                    |

## `GET /api/artifacts/:id` — chi tiết bộ thánh di vật

Trả về `onePieceBonus`, `twoPieceBonus`, `fourPieceBonus`, `pieces` (danh
sách từng món trong bộ).

---

## `GET /api/domains` — lịch bí cảnh

| Param      | Ví dụ      | Ghi chú                                                              |
|------------|------------|-----------------------------------------------------------------------|
| `q`        | `forgery`  | Tìm theo tên                                                          |
| `category` | `weapon`   | `artifact` \| `weapon` \| `talent` (nhiều giá trị: `weapon,talent`)   |
| `day`      | `Monday`   | Lọc bí cảnh mở vào ngày này (`Sunday`..`Saturday`); bí cảnh thánh di vật (mở hằng ngày) luôn khớp mọi `day` |
| `today`    | `true`     | Rút gọn cho `day=<thứ hôm nay theo giờ server>`                     |
| `sort`     | `name`     | `name` \| `recommendedLevel` \| `createdAt` (mặc định `name`)       |
| `page`,`limit` |        |                                                                        |

## `GET /api/domains/:id` — chi tiết bí cảnh

Trả về `daysOfWeek`, `recommendedElements`, `materials` (nguyên liệu đặc
trưng, không gồm Mora/EXP chung), `monsterNames`.

---

## `GET /api/materials` — danh sách nguyên liệu

| Param | Ví dụ    | Ghi chú          |
|-------|----------|-------------------|
| `q`   | `sliver` | Tìm theo tên      |
| `page`,`limit` |  |                   |

## `GET /api/materials/:id` — chi tiết nguyên liệu

---

## `GET /api/search` — tìm kiếm tổng hợp

Tìm cùng lúc trên cả 4 loại tài nguyên (characters, weapons, artifacts,
domains) — dùng cho thanh tìm kiếm toàn site. Không gồm `materials` (xem
ghi chú ở mục Nguồn dữ liệu trong README). **Không phân trang** — kết quả
là "gợi ý nhanh", giới hạn số lượng mỗi loại qua `limit`.

| Param   | Bắt buộc | Ghi chú                                    |
|---------|----------|----------------------------------------------|
| `q`     | Có       | Tối thiểu 1 ký tự sau khi trim                |
| `limit` | Không    | Số kết quả tối đa MỖI loại (mặc định 12, tối đa 50) |

```bash
curl "https://<domain>/api/search?q=kazuha&limit=5"
```

```json
{
  "success": true,
  "data": {
    "query": "kazuha",
    "total": 1,
    "characters": [ { "id": "kazuha", "name": "Kaedehara Kazuha", "...": "..." } ],
    "weapons": [],
    "artifacts": [],
    "domains": []
  }
}
```

Muốn xem đầy đủ, phân trang được: gọi thẳng `/api/characters?q=...`,
`/api/weapons?q=...`, `/api/artifacts?q=...`, hoặc `/api/domains?q=...`.