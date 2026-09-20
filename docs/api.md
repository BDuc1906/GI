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
| `/api/enemies*`                | 60 request/phút |
| `/api/achievements*`           | 60 request/phút |
| `/api/food*`                   | 60 request/phút |
| `/api/geography*`              | 60 request/phút |
| `/api/crafts*`                 | 60 request/phút |
| `/api/search`                  | 30 request/phút (chạy 4 query song song mỗi lần gọi) |
| `/api/tools/dps`               | 30 request/phút |
| `/api/tools/team-builder`      | 30 request/phút |
| `/api/tools/material-calculator`| 30 request/phút |
| `/api/tools/meta-tracker`      | 10 request/phút |

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
| `today`    | `true`     | Rút gọn cho `day=<thứ hôm nay theo giờ server Châu Á UTC+8, đổi ngày lúc 4:00 sáng — xem src/lib/genshin-server-time.ts>` |
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

---

## `GET /api/enemies` — danh sách quái vật

| Param        | Ví dụ      | Ghi chú                                              |
|--------------|------------|------------------------------------------------------|
| `q`          | `hilichurl`| Tìm theo tên, không phân biệt hoa/thường             |
| `monsterType`| `Humanoid`  | Lọc loại quái                                        |
| `enemyType`  | `Common`    | Lọc sub-type quái                                    |
| `isBoss`     | `true`      | Chỉ boss quái                                        |
| `weeklyBoss` | `true`      | Chỉ weekly boss                                      |
| `difficulty` | `hard`      | Lọc độ khó (`easy`, `medium`, `hard`, `very hard`)    |
| `sort`       | `-level`    | `name` \| `level` \| `isBoss` \| `difficulty` \| `createdAt` (mặc định `name`) |
| `page`,`limit` |        |                                                      |

```bash
curl "https://<domain>/api/enemies?isBoss=true&sort=-level&limit=10"
```

---

## `GET /api/enemies/:id` — chi tiết quái vật

Trả về toàn bộ field của quái vật, gồm `stats`, `weaknesses`, `resistances`,
`immunities`, `dropRates`, `spawnRegions`, `behavior`, `domains`, `difficulty`.

---

## `POST /api/tools/dps` — tính toán DPS

Tính toán DPS dựa trên character, weapon, artifact stats, và target enemy.

| Body Field        | Type     | Ghi chú                                      |
|-------------------|----------|----------------------------------------------|
| `characterId`     | string   | Character ID (bắt buộc)                      |
| `weaponId`        | string   | Weapon ID (optional)                         |
| `level`           | number   | Character level (1-90, mặc định 90)          |
| `talentLevels`    | object   | Talent levels (1-10, mặc định 10)            |
| `artifactStats`   | object   | Artifact stats (hp, atk, def, em, er, cr, cd)|
| `targetEnemy`     | object   | Target enemy info (level, defense, resistance)|
| `includeBreakdown`| boolean  | Include detailed breakdown (mặc định false)  |

```bash
curl -X POST "https://<domain>/api/tools/dps" \
  -H "Content-Type: application/json" \
  -d '{
    "characterId": "kazuha",
    "level": 90,
    "talentLevels": { "normalAttack": 10, "elementalSkill": 10, "elementalBurst": 10 },
    "artifactStats": { "atk": 2000, "em": 300, "cr": 60, "cd": 120 },
    "includeBreakdown": true
  }'
```

---

## `POST /api/tools/team-builder` — phân tích đội hình

Phân tích team composition, tính elemental reactions, synergies, và weaknesses.

| Body Field | Type     | Ghi chú                                    |
|------------|----------|--------------------------------------------|
| `characters`| array    | Team members (1-4 characters)              |
| `name`      | string   | Team name (optional)                       |

```bash
curl -X POST "https://<domain>/api/tools/team-builder" \
  -H "Content-Type: application/json" \
  -d '{
    "characters": [
      { "id": "kazuha", "name": "Kazuha", "vision": "Anemo", "weaponType": "Sword", "role": "main DPS" },
      { "id": "bennett", "name": "Bennett", "vision": "Pyro", "weaponType": "Sword", "role": "support" }
    ]
  }'
```

---

## `GET /api/tools/team-builder` — gợi ý đội hình

Gợi ý optimal team cho một character cụ thể.

| Param       | Bắt buộc | Ghi chú                |
|-------------|----------|------------------------|
| `characterId`| Có       | Character ID           |

```bash
curl "https://<domain>/api/tools/team-builder?characterId=kazuha"
```

---

## `POST /api/tools/material-calculator` — tính toán nguyên liệu

Tính toán nguyên liệu cần thiết cho ascension và talent upgrade.

| Body Field           | Type     | Ghi chú                                      |
|----------------------|----------|----------------------------------------------|
| `characterId`        | string   | Character ID (bắt buộc)                      |
| `currentLevel`       | number   | Current level (1-90, mặc định 1)             |
| `targetLevel`        | number   | Target level (1-90, mặc định 90)             |
| `includeTalent`      | boolean  | Include talent materials (mặc định false)   |
| `talentLevels`       | object   | Current talent levels (mặc định 1)           |
| `targetTalentLevels` | object   | Target talent levels (mặc định 10)           |

```bash
curl -X POST "https://<domain>/api/tools/material-calculator" \
  -H "Content-Type: application/json" \
  -d '{
    "characterId": "kazuha",
    "currentLevel": 1,
    "targetLevel": 90,
    "includeTalent": true
  }'
```

---

## `GET /api/tools/meta-tracker` — theo dõi meta

Get meta analysis và recommendations.

| Param | Bắt buộc | Ghi chú                                                |
|-------|----------|--------------------------------------------------------|
| `type` | Không    | Report type: `general`, `characters`, `teams`, `counters` (mặc định `general`) |

```bash
curl "https://<domain>/api/tools/meta-tracker?type=general"
```

---

## `GET /api/achievements` — danh sách thành tựu

| Param        | Ví dụ      | Ghi chú                                    |
|--------------|------------|--------------------------------------------|
| `q`          | `combat`   | Tìm theo tên                                |
| `isHidden`   | `true`     | Chỉ thành tựu ẩn                           |
| `groupId`    | `combat`   | Lọc theo achievement group                 |
| `sort`       | `-sortOrder| `name` \| `sortOrder` \| `createdAt` (mặc định `sortOrder`) |
| `page`,`limit` |        |                                            |

---

## `GET /api/achievements/:id` — chi tiết thành tựu

Trả về toàn bộ field của thành tựu.

---

## `GET /api/food` — danh sách đồ ăn

| Param     | Ví dụ    | Ghi chú                                      |
|-----------|----------|----------------------------------------------|
| `q`       | `mondstadt`| Tìm theo tên                                |
| `foodtype`| `Recovery`| Lọc theo loại đồ ăn                         |
| `rarity`  | `3`       | Lọc theo phẩm cấp (1-5)                     |
| `sort`    | `-rarity` | `name` \| `rarity` \| `foodtype` \| `createdAt` (mặc định `name`) |
| `page`,`limit` |       |                                              |

---

## `GET /api/food/:id` — chi tiết đồ ăn

Trả về toàn bộ field của đồ ăn, gồm recipe và effects.

---

## `GET /api/geography` — danh sách địa lý

| Param       | Ví dụ      | Ghi chú                                    |
|-------------|------------|--------------------------------------------|
| `q`         | `mondstadt`| Tìm theo tên                                |
| `regionName`| `Mondstadt`| Lọc theo khu vực                           |
| `areaName`  | `City`     | Lọc theo sub-area                          |
| `sort`      | `name`     | `name` \| `regionName` \| `areaName` \| `createdAt` (mặc định `name`) |
| `page`,`limit` |        |                                            |

---

## `GET /api/geography/:id` — chi tiết địa lý

Trả về toàn bộ field của địa điểm.

---

## `GET /api/crafts` — danh sách chế tạo

| Param     | Ví dụ    | Ghi chú                                      |
|-----------|----------|----------------------------------------------|
| `q`       | `alchemy`| Tìm theo tên                                |
| `minRank` | `3`       | Minimum adventure rank (mặc định không lọc) |
| `maxRank` | `10`      | Maximum adventure rank (mặc định không lọc) |
| `sort`    | `-unlockRank| `name` \| `unlockRank` \| `moraCost` \| `createdAt` (mặc định `name`) |
| `page`,`limit` |       |                                              |

---

## `GET /api/crafts/:id` — chi tiết chế tạo

Trả về toàn bộ field của công thức chế tạo, gồm materials và results.