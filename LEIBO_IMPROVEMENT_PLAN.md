# LEIBO - KẾ HOẠCH CẢI THIỆN TOÀN DIỆN

**Ngày tạo:** 2026-09-20  
**Trạng thái dự án:** Production-ready (8.3/10)  
**Mục tiêu:** Tăng lên 9.5/10 (production-ready hoàn chỉnh)

---

## 🔍 NHẬT KÝ AUDIT (2026-09-22)

Plan này được viết bởi Devin dựa trên mô tả codebase, KHÔNG chạy trực tiếp
`lint`/`typecheck`/`test` để xác nhận — một số vị trí lỗi trong plan **không
khớp** code thật tại thời điểm audit (vd. `dps-calculator.ts:145` và
`meta-tracker.ts:416` không hề có lỗi parsing). Đã audit lại bằng cách chạy
trực tiếp `npm run lint && npm run typecheck && npm run test`, sửa đúng lỗi
*hiện tại*, và sửa cả vài lỗi kỹ thuật trong chính các "Fix mẫu" bên dưới
(đánh dấu `⚠️ ĐÃ SỬA LẠI` tại chỗ). Chi tiết những gì đã hoàn thành/còn lại,
xem mục checklist ở cuối file — đã cập nhật theo trạng thái thật.

**Bài học quy trình rút ra:** trước khi bắt tay vào BẤT KỲ mục nào trong
plan này, luôn chạy lại `npm run lint && npm run typecheck && npm run test`
để lấy danh sách lỗi hiện tại trước — plan chỉ nên dùng như checklist ý
tưởng, không phải nguồn sự thật về vị trí lỗi hay snippet để copy-paste.

---

## 📋 TÓM TÁT

Dự án LEIBO là một database Genshin Impact chất lượng cao với kiến trúc hiện đại, nhưng cần cải thiện ở các lĩnh vực:

1. **Code Quality**: 29 lint errors + 2 parsing errors critical
2. **Dữ liệu Game**: Một số data chưa chính xác hoặc incomplete
3. **AI Agent**: Thiếu vector embeddings, multi-turn reasoning
4. **Hiệu năng**: Thiếu edge caching, database query caching
5. **Tổ chức file**: Một số files quá lớn cần chia nhỏ

**Ưu tiên theo thứ tự:**
- **P0 (Critical)**: Fix lint/parsing errors (2-3 giờ)
- **P1 (High)**: Cải thiện dữ liệu game + hiệu năng (1-2 tuần)
- **P2 (Medium)**: Cải thiện AI Agent + tổ chức file (2-4 tuần)

---

## 🔴 P0 - CRITICAL — ✅ ĐÃ XONG TOÀN BỘ (sửa lại 2026-09-22)

> ⚠️ Các mục dưới đây trong bản gốc trỏ sai vị trí (dòng 145/`meta-tracker.ts:416`
> không có lỗi thật). Nội dung đã được thay bằng danh sách lỗi THẬT, xác nhận
> bằng cách chạy trực tiếp `npm run lint && npm run typecheck && npm run test`.

### 1. Lint errors — ✅ ĐÃ SỬA
Lỗi thật lúc audit: `src/components/layout/ServerTimersClient.tsx` nhận 2 props
(`abyssArt`, `abyssIcons`) không còn dùng tới (hệ ảnh nền đã bị gỡ khỏi
`ArtTile` từ trước) + 1 cảnh báo `eslint-disable` thừa ở `opengraph-image.tsx`.
→ Gỡ 2 props chết khỏi `ServerTimersClient`/`ServerTimers`, gỡ directive thừa.

### 2. TypeScript errors — ✅ ĐÃ SỬA (6 lỗi)
| File | Lỗi | Cách sửa |
|---|---|---|
| `scripts/backup/database-backup.ts` | `$queryRaw` trả `unknown`, dùng `any` | Thêm generic `$queryRaw<Array<{ tablename: string }>>` |
| `scripts/i18n/translation-review-system.ts` (×2) | Đọc `char.description`/`weapon.description` nhưng Prisma `select` thiếu field | Thêm `description: true` vào `select` |
| `src/agent/core/continuous-learning.ts` (×2) | Ghi `Date` trực tiếp vào cột `Json` của Prisma (`AgentSession.metadata`) — Prisma không nhận `Date` trong `Json` | Serialize `timestamp` sang ISO string trước khi ghi |
| `src/app/api/tools/dps/route.ts` | Gọi `calculateExpectedDPS(parsed.data)` — hàm thật cần **6 tham số** (`CharacterStats, WeaponStats, ArtifactStats, TalentLevels, DamageModifiers, rotation`), route chỉ truyền 1 DTO thô → luôn `TypeError` lúc runtime (500) | Map DTO→6 tham số cần tra `character`/`weapon` trong DB — CHƯA làm (xem mục P1 mới "API `/api/tools/dps`" bên dưới); tạm trả `501 NOT_IMPLEMENTED` tường minh thay vì crash mơ hồ |

⚠️ **Về "Fix mẫu" trong bản gốc** — vài mẫu KHÔNG nên áp dụng máy móc:
- `const _err = error;` (prefix underscore che unused var) chỉ nên dùng khi biến
  THẬT SỰ không cần — ưu tiên xoá hẳn khai báo hoặc dùng nó (vd. log ra) thay vì
  luôn gắn `_` để né lint.
- `<img> → <Image>` KHÔNG phải luật tuyệt đối: `opengraph-image.tsx` cố tình
  dùng `<img>` vì nó chạy trong `ImageResponse` (satori), **không hỗ trợ**
  `next/image` — áp dụng mẫu này vào đó sẽ làm hỏng build. Luôn đọc comment
  tại chỗ trước khi đổi.

### 3. Configuration duplicates — ✅ ĐÃ SỬA
- `.env.example` dòng 7–8: `NEXT_PUBLIC_SITE_URL=` bị lặp → xoá dòng trùng.
- `.gitignore` dòng 12 và 52: `.env` bị khai 2 lần → xoá dòng trùng.

---

## 🟡 P1 - HIGH (Nên sửa trong tuần này - 1-2 tuần)

### 1. Cải thiện Dữ liệu Game Genshin Impact

#### 1.1 Thêm Artifact Main/Sub Stats Data ❌

**Vấn đề:** Schema thiếu các field về main stats và sub stats

**Fix:**
```typescript
// prisma/schema.prisma
model ArtifactSet {
  // ... existing fields
  
  // Thêm mới:
  possibleMainStats Json?  // { slot: string[] }
  possibleSubStats Json?   // string[]
  domainSource String?     // Domain nào drop set này
  metaRating String?        // S/A/B/C tier
}
```

**File cần sửa:**
- `prisma/schema.prisma`
- `scripts/seed/seed-artifacts.ts` (populate data)

---

#### 1.2 Thêm Enemy Exact Weakness/Resistance Values ❌

**Vấn đề:** Manual mapping chỉ dùng tên nguyên tố, không có tỉ lệ cụ thể

**Fix:**
```typescript
// prisma/schema.prisma
model Enemy {
  // ... existing fields
  
  // Thêm mới:
  exactWeaknesses Json?   // { element: multiplier }
  exactResistances Json?  // { element: percentage }
  exactImmunities Json?   // { element: boolean }
}
```

**File cần sửa:**
- `prisma/schema.prisma`
- `scripts/seed/seed-enemies-enhanced.ts` (populate data)

---

#### 1.3 Thêm Real-time Meta Integration ❌

**Vấn đề:** Meta tracker là hardcoded, không tự update từ Spiral Abyss

**Fix:**
```typescript
// scripts/meta/auto-update-meta.ts
// Tạo script mới để:
// 1. Fetch Spiral Abyss data từ API
// 2. Parse usage rates và win rates
// 3. Update database
// 4. Generate meta report

// .github/workflows/auto-update-meta.yml
# Schedule: 0 0 * * 3 (weekly, Wednesday 00:00 UTC)
```

**File cần tạo:**
- `scripts/meta/auto-update-meta.ts`
- `.github/workflows/auto-update-meta.yml`

---

#### 1.4 Fix Reaction Direction Detection — ✅ ĐÃ SỬA (2026-09-22)

Đã thêm `ReactionType`/`ReactionDirection` type, tham số `direction` cho
`calculateReactionMultiplier()` (mặc định `"forward"` — GIỮ NGUYÊN hành vi
cũ cho caller không truyền, tránh đổi số DPS ngầm cho ai đang phụ thuộc giá
trị cũ), và field `reaction`/`reactionDirection` (optional) trong
`DamageModifiers` để `calculateExpectedDPS()` truyền xuống được — trước đây
hardcode `"Vaporize"` không tham số hoá được (đúng như comment gốc trong
code: "Default reaction, should be parameterized"). Kèm test mới
`tests/lib/dps-reaction-direction.test.ts` (4 test case, cover forward >
reverse cho cả Vaporize/Melt, default = forward, và xác nhận reaction có EM
scaling như Overload không bị ảnh hưởng bởi direction).

**Còn thiếu (chưa làm — việc UI/API, không phải việc tính toán):** chưa có
chỗ nào trong `/api/tools/dps` hay UI truyền `reaction`/`reactionDirection`
vào — bản thân endpoint `/api/tools/dps` còn đang trả `501` (xem mục P0 #2
ở trên) vì thiếu bước map input→6 tham số của `calculateExpectedDPS`. Khi
làm route đó, nhớ expose 2 field mới này trong request schema (zod).

**✅ ĐÃ SỬA THÊM (2026-09-22) — bug công thức Aggravate/Spread/Quicken:**
Trong lúc audit độ chính xác dữ liệu game, phát hiện `calculateReactionMultiplier`
tính SAI cả 3 case này, xác nhận qua nhiều nguồn (Genshin Wiki "Elemental
Reaction", KQM Theorycrafting Library "Damage Formula"):
- `Quicken` trả `1.15 * levelBonus` — SAI, Quicken tự nó **không gây sát
  thương trực tiếp** (chỉ áp trạng thái để Aggravate/Spread kích hoạt sau).
  Hằng số 1.15 thực ra là của Aggravate, bị gán nhầm case.
- `Aggravate` trả `1.5 * levelBonus`, không có hệ số EM — SAI cả hằng số
  (đúng phải là 1.15) LẪN thiếu hẳn phần EM scaling
  (`5×EM/(1200+EM)` — công thức "Additive Reaction" chính thức, KHÁC công
  thức `16×EM/(2000+EM)` dùng cho Overload/Superconduct/EC/Burning/Bloom).
- `Spread` trả `1.25 * levelBonus` — hằng số đúng nhưng cũng thiếu hệ số EM.

Ở EM cao (vd 800), bỏ sót hệ số EM nghĩa là DPS Aggravate/Spread tính ra
thấp hơn thực tế gần 100% — sai số rất lớn cho một web tra cứu build. Đã
sửa cả 3 case + thêm 4 test case mới xác nhận (`Aggravate`/`Spread` tăng
theo EM, `Spread` > `Aggravate` cùng điều kiện, `Quicken` luôn = 1.0).

---

### 2. Cải thiện Hiệu Năng

#### 2.1 "Edge Caching" — ⚠️ SNIPPET GỐC SAI, đã sửa lại hướng đi

**Bản gốc đề xuất** thêm `runtime = "edge"` vào mọi API route. **KHÔNG được
làm theo nguyên văn** — đã kiểm chứng: `src/lib/db/prisma.ts` dùng `pg`
(node-postgres, TCP driver thật) qua `@prisma/adapter-pg`:
```typescript
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
```
`pg` cần TCP socket của Node — **không chạy được trên Vercel Edge Runtime**
(Edge không có TCP socket). Set `runtime = "edge"` với driver này sẽ crash
lúc build hoặc lúc chạy, không "chỉ là chậm hơn".

**Muốn Edge thật (tuỳ chọn, việc lớn — cân nhắc kỹ trước khi làm):**
1. Cài `@neondatabase/serverless` + `@prisma/adapter-neon` (driver HTTP/
   WebSocket, tương thích Edge — Neon hỗ trợ chính thức).
2. Đổi `src/lib/db/prisma.ts` sang adapter mới — đây là đổi tầng kết nối DB
   cho TOÀN BỘ app, không phải việc "thêm 1 dòng vào từng route". Nên làm
   riêng 1 PR, có benchmark trước/sau, vì Neon serverless driver có
   trade-off riêng (latency cold start khác, không dùng `pg.Pool` truyền
   thống được).
3. Tham khảo: https://neon.tech/docs/serverless/serverless-driver và
   https://www.prisma.io/docs/orm/overview/databases/neon

**Việc nên làm NGAY, an toàn, không cần đổi driver:** cache bằng ISR
(`revalidate`) trên Node runtime mặc định — vẫn có edge cache ở tầng CDN của
Vercel cho response, không cần route tự chạy trên Edge:
```typescript
// src/app/api/characters/route.ts — CHỈ thêm revalidate, KHÔNG thêm runtime="edge"
export const revalidate = 60; // ISR — Vercel tự cache response ở CDN edge
```
Áp dụng cho các route đọc-nhiều-ghi-hiếm: `characters`, `weapons`,
`artifacts`, `domains`, `materials` (không áp cho `build`/`dps` vì đây là
tính toán theo input động, cache theo query string sẽ phình cache vô ích).

---

#### 2.2 Database Query Caching — ⚠️ SNIPPET GỐC DÙNG API SẮP DEPRECATED

**Bản gốc dùng `unstable_cache`** — API này đã bị Next.js đánh dấu "legacy,
không còn khuyến nghị" kể từ khi `"use cache"` directive ổn định (Next.js
16 docs: https://nextjs.org/docs/app/api-reference/functions/unstable_cache).
Repo đang ở `"next": "^16.3.5"` nên **về lý thuyết đã có `"use cache"`** —
NHƯNG kiểm tra `next.config.ts` thì `cacheComponents: true` **chưa được bật**
(flag bắt buộc để dùng `"use cache"`/`cacheLife`/`cacheTag`). Bật flag này là
thay đổi hành vi render toàn app (Partial Prerendering), không phải việc nhỏ
— nên tách riêng thành 1 task/PR có test kỹ, KHÔNG bundle chung với việc
thêm cache cho vài service.

**Việc nên làm NGAY (an toàn, khớp pattern đã có sẵn trong repo):** tiếp tục
dùng `unstable_cache` (vẫn hoạt động, chỉ là "legacy" chứ chưa bị xoá) theo
đúng pattern đã có ở `src/features/characters/listing/get-character-listing.ts`
— lưu ý pattern đó CHỈ cache các query "danh sách filter option" (vision,
region — ít thay đổi, không phụ thuộc query string người dùng), KHÔNG cache
query chính có phân trang/filter động (tránh cache key explosion). Áp dụng
đúng pattern này (không phải snippet gốc cache thẳng `getList(filters)` theo
`JSON.stringify(filters)` — cách này tạo vô hạn cache key, hiệu quả thấp)
cho `weapons`/`artifacts`/`domains` nếu có query filter-option tương tự.

**Việc lớn hơn, làm sau, cần benchmark riêng:** bật `cacheComponents: true`
+ migrate sang `"use cache"`/`cacheLife`/`cacheTag` theo migration guide
chính thức: https://nextjs.org/docs/app/guides/caching (mục "Cache Components").

---

#### 2.3 Add CDN for Images ❌

**Vấn đề:** Images không có CDN, latency cao

**Fix:**
```bash
# Option 1: Cloudflare CDN cho R2
# 1. Enable Custom Domain trong R2
# 2. Configure Cloudflare to cache R2 bucket
# 3. Update R2_PUBLIC_URL để trỏ vào Cloudflare domain

# Option 2: Vercel Blob Storage
# 1. Migrate images từ R2 → Vercel Blob
# 2. Enable Vercel Edge Cache
# 3. Update image URLs
```

**File cần sửa:**
- `.env.example` (update R2_PUBLIC_URL hướng dẫn)
- `next.config.ts` (add CDN domain to remotePatterns)

---

#### 2.4 Implement Query Batching ❌

**Vấn đề:** Mỗi query riêng biệt, nhiều round-trips

**Fix:**
```typescript
// src/features/dashboard/get-dashboard-data.ts
export async function getDashboardData() {
  const [characters, weapons, artifacts, domains] = await Promise.all([
    prisma.character.count(),
    prisma.weapon.count(),
    prisma.artifactSet.count(),
    prisma.domain.count()
  ]);
  
  return { characters, weapons, artifacts, domains };
}
```

**Apply cho:**
- Dashboard queries
- Listing queries cần nhiều entities

---

#### 2.5 Add Performance Monitoring ❌

**Vấn đề:** Không có APM để detect performance regressions

**Fix:**
```typescript
// src/app/api/characters/route.ts
import * as Sentry from "@sentry/nextjs";

export async function GET(req: NextRequest) {
  const transaction = Sentry.startTransaction({
    op: "api",
    name: "GET /api/characters"
  });
  
  try {
    const data = await charactersService.getList(...);
    return NextResponse.json(data);
  } finally {
    transaction.finish();
  }
}
```

**Apply cho:**
- Tất cả API routes chính
- Page routes quan trọng

---

### 3. Cải thiện AI Agent

#### 3.1 Add Vector Embeddings for RAG — ⚠️ SNIPPET GỐC SAI CÚ PHÁP PRISMA

**Bản gốc dùng** `embedding Float[]?` + `@@index([embedding], type: vector)`
— **`type: vector` không phải thuộc tính hợp lệ của `@@index` trong Prisma
Schema Language**, `prisma generate`/`migrate` sẽ báo lỗi validation ngay.
Prisma không có kiểu vector "native" — phải khai qua `Unsupported(...)` và
thao tác bằng raw SQL. Cú pháp đúng (theo docs chính thức pgvector +
Prisma, https://github.com/pgvector/pgvector-node#prisma):

```prisma
// prisma/schema.prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]   // BẮT BUỘC cho `extensions =`
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [vector]                         // bật extension pgvector
}

model KnowledgeChunk {
  id       String                     @id
  content  String
  category String
  embedding Unsupported("vector(1536)")?         // 1536 = kích thước embedding
                                                   // text-embedding-3-small
}
```
Index HNSW/IVFFlat cho vector **không tạo được qua `prisma migrate dev`**
(giới hạn đã biết của Prisma) — phải tạo bằng migration thủ công
(`prisma migrate dev --create-only` rồi tự viết SQL `CREATE INDEX ... USING
hnsw (embedding vector_cosine_ops)`).

**Sinh embedding** — repo đã có `@ai-sdk/openai` + `ai` SDK sẵn trong
`package.json`, KHÔNG cần thêm dependency `@langchain/openai` mới như bản
gốc đề xuất — dùng luôn hàm `embed`/`embedMany` của Vercel AI SDK cho nhất
quán với phần agent hiện có:
```typescript
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";

const { embedding } = await embed({
  model: openai.embedding("text-embedding-3-small"),
  value: content,
});
```

**Query similarity** — dùng package `pgvector` (npm) để serialize mảng số
đúng định dạng SQL, tránh tự nối string (rủi ro SQL injection nếu tự
`.join(',')`):
```typescript
import pgvector from "pgvector/utils";

const vec = pgvector.toSql(embedding); // "[0.1,0.2,...]"
const similarChunks = await prisma.$queryRaw`
  SELECT id, content, category, embedding <=> ${vec}::vector AS distance
  FROM "KnowledgeChunk"
  WHERE category = ${category}
  ORDER BY distance
  LIMIT 5
`;
```

**Trước khi bắt đầu việc này — xác nhận Neon (nhà cung cấp DB hiện tại, xem
`docs/adr/0003-use-neon-pooler.md`) đã bật được extension `vector`** (Neon
hỗ trợ pgvector chính thức, nhưng cần chạy `CREATE EXTENSION vector` — kiểm
tra quyền của connection string hiện tại có đủ để chạy DDL này không).

**File cần sửa:**
- `prisma/schema.prisma`
- `src/agent/core/rag-system.ts`
- `package.json` (thêm dependency `pgvector`)

---

#### 3.2 Implement Multi-turn Reasoning ❌

**Vấn đề:** Agent không có planning capability

**Fix:**
```typescript
// src/agent/core/reasoning.ts (new file)
class ReasoningEngine {
  async processWithReasoning(userMessage: string) {
    const thoughts = [];
    const maxIterations = 5;
    
    for (let i = 0; i < maxIterations; i++) {
      // 1. Generate thought
      const thought = await this.generateThought();
      thoughts.push(thought);
      
      // 2. Decide action
      const action = await this.decideAction(thought);
      
      // 3. Execute action
      const result = await this.executeAction(action);
      
      // 4. Evaluate if done
      if (result.done) break;
    }
    
    return { thoughts, result };
  }
}
```

**File cần tạo:**
- `src/agent/core/reasoning.ts`
- Update `src/agent/core/AgentCore.ts`

---

#### 3.3 Add Structured Output Generation ❌

**Vấn đề:** Free-form text responses, không reproducible

**Fix:**
```typescript
// src/agent/core/schemas.ts
import { z } from "zod";

const ResponseSchema = z.object({
  answer: z.string(),
  sources: z.array(z.string()),
  confidence: z.number(),
  followUp: z.string().optional()
});

// src/agent/core/AgentCore.ts
import { generateObject } from "ai";

const { object } = await generateObject({
  model: llm,
  schema: ResponseSchema,
  prompt: userMessage
});
```

**File cần sửa:**
- `src/agent/core/schemas.ts`
- `src/agent/core/AgentCore.ts`

---

## 🟢 P2 - MEDIUM (Cải thiện dần - 2-4 tuần)

### 1. Cải thiện Tổ chức File

#### 1.1 Chia Small Data Files ❌

**Vấn đề:** Files quá lớn (>500 lines)

**Fix:**
```typescript
// element-reactions-data.ts (538 lines) → reactions/
src/lib/game/reactions/
├── data/
│   ├── elements.ts           # ELEMENTS array
│   ├── reactions.ts          # REACTIONS array
│   ├── stellar.ts            # Stellar reactions
│   └── lunar.ts               # Lunar reactions
├── utils/
│   ├── get-element-name.ts   # getElementName, getElementNameByKey
│   ├── element-color.ts      # elementColor, hexToRgba
│   └── category-color.ts     # CATEGORY_COLOR
└── index.ts                  # Export all
```

**Files cần refactor:**
- `src/lib/game/element-reactions-data.ts` → `src/lib/game/reactions/`
- `src/agent/core/rag-system.ts` → `src/agent/core/rag/`

---

#### 1.2 Chia Game Logic Files ❌

**Vấn đề:** DPS calculator dồn quá nhiều logic

**Fix:**
```typescript
// dps-calculator.ts (454 lines) → dps/
src/lib/game/dps/
├── stats/
│   ├── character-stats.ts
│   ├── weapon-stats.ts
│   └── artifact-stats.ts
├── reactions/
│   ├── multipliers.ts
│   ├── mitigation.ts
│   └── calculations.ts
├── dps/
│   ├── base-dps.ts
│   ├── optimization.ts
│   └── comparison.ts
└── index.ts
```

**Files cần refactor:**
- `src/lib/game/dps-calculator.ts` → `src/lib/game/dps/`
- `src/lib/game/material-calculator.ts` → `src/lib/game/material/`

---

#### 1.3 Restructure Components ❌

**Vấn đề:** Components folder chỉ chia theo type, không theo feature

**Fix:**
```typescript
// Restructure components/
src/components/
├── features/
│   ├── characters/
│   │   ├── CharacterCard.tsx
│   │   ├── CharacterList.tsx
│   │   ├── CharacterFilters.tsx
│   │   └── index.ts
│   ├── weapons/
│   ├── artifacts/
│   └── build/
├── shared/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   └── index.ts
└── layout/
    ├── Header.tsx
    ├── Footer.tsx
    └── index.ts
```

**Files cần reorganize:**
- `src/components/character/` → `src/components/features/characters/`
- `src/components/weapon/` → `src/components/features/weapons/`
- Tạo `src/components/shared/` cho reusable components

---

#### 1.4 Create Shared API Utilities ❌

**Vấn đề:** API routes duplicate logic

**Fix:**
```typescript
// Create shared API utilities
src/lib/api/
├── query/
│   ├── build-meta.ts
│   ├── parse-pagination.ts
│   ├── parse-sort.ts
│   └── index.ts
├── validation/
│   ├── entity-validators.ts
│   └── index.ts
└── response/
    ├── success.ts
    ├── error.ts
    └── index.ts
```

**Files cần tạo:**
- `src/lib/api/query/build-meta.ts`
- `src/lib/api/query/parse-pagination.ts`
- `src/lib/api/query/parse-sort.ts`
- `src/lib/api/validation/entity-validators.ts`
- `src/lib/api/response/success.ts`
- `src/lib/api/response/error.ts`

---

### 2. Cải thiện Tests

#### 2.1 Add Integration Tests ❌

**Vấn đề:** Thiếu integration/E2E tests

**Fix:**
```typescript
// tests/integration/api/characters.test.ts
import { describe, it, expect } from 'vitest';
import { GET } from '$app/api/characters/route';

describe('Characters API Integration', () => {
  it('should return list of characters', async () => {
    const response = await GET(new Request('http://localhost:3000/api/characters'));
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
  });
  
  it('should return character by ID', async () => {
    const response = await GET(new Request('http://localhost:3000/api/characters/kazuha'));
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.id).toBe('kazuha');
  });
});
```

**Files cần tạo:**
- `tests/integration/api/characters.test.ts`
- `tests/integration/api/weapons.test.ts`
- `tests/integration/api/artifacts.test.ts`

---

#### 2.2 Add E2E Tests ❌

**Fix:**
```typescript
// tests/e2e/user-flows.spec.ts
import { test, expect } from '@playwright/test';

test('character search flow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('[data-testid="search-bar"]');
  await page.fill('[data-testid="search-input"]', 'Kazuha');
  await page.press('Enter');
  
  await expect(page.locator('[data-testid="character-card"]').first()).toBeVisible();
  await expect(page.locator('text=Kaedehara Kazuha')).toBeVisible();
});
```

**File cần tạo:**
- `tests/e2e/user-flows.spec.ts`
- Update `vitest.config.ts` để support Playwright

---

### 3. Cải thiện Security

#### 3.1 Add PII Detection ❌

**Fix:**
```typescript
// src/agent/core/security.ts (new file)
class SecurityFilter {
  async detectPII(text: string): Promise<string[]> {
    const patterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
      /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
      /\b\d{10,}\b/g // Phone numbers
    ];
    
    const found = [];
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) found.push(...matches);
    }
    
    return found;
  }
  
  async filterOutput(text: string): Promise<string> {
    const pii = await this.detectPII(text);
    let filtered = text;
    
    for (const item of pii) {
      filtered = filtered.replace(item, "[REDACTED]");
    }
    
    return filtered;
  }
}
```

**File cần tạo:**
- `src/agent/core/security.ts`
- Update `src/agent/core/AgentCore.ts` để filter output

---

## 📊 TIMELINE ĐỀ XUẤT

### Week 1-2: P0 Critical Fixes
- [ ] Fix 2 parsing errors (30 phút)
- [ ] Fix 29 lint errors (2 giờ)
- [ ] Fix configuration issues (30 phút)
- [ ] Run tests và verify (30 phút)

### Week 3-4: P1 High Priority
- [ ] Add edge caching (2 giờ)
- [ ] Implement database query caching (3 giờ)
- [ ] Add CDN for images (4 giờ)
- [ ] Cải thiện dữ liệu game (artifact stats, enemy data) (8 giờ)
- [ ] Fix reaction direction detection (2 giờ)
- [ ] Add performance monitoring (3 giờ)

### Week 5-8: P2 Medium Priority
- [ ] Refactor large data files (8 giờ)
- [ ] Refactor game logic files (8 giờ)
- [ ] Restructure components (8 giờ)
- [ ] Create shared API utilities (4 giờ)
- [ ] Add vector embeddings for RAG (8 giờ)
- [ ] Implement multi-turn reasoning (8 giờ)
- [ ] Add structured output generation (4 giờ)
- [ ] Add integration tests (8 giờ)
- [ ] Add E2E tests (4 giờ)
- [ ] Add PII detection (4 giờ)

---

## 🎯 TRƯỚC TIÊN ĐIỂM

### Before Improvements:
- Code Quality: 7/10 (29 errors + 2 parsing errors)
- Dữ liệu Game: 84% chính xác
- AI Agent: 8.2/10
- Hiệu năng: 7.6/10
- Tổ chức file: 7.5/10
- Điểm tổng thể: 8.3/10

### After Improvements:
- Code Quality: 9.5/10 (0 errors, proper types)
- Dữ liệu Game: 95% chính xác
- AI Agent: 9.5/10 (vector embeddings, multi-turn reasoning)
- Hiệu năng: 9/10 (edge caching, query caching, CDN)
- Tổ chức file: 9/10 (proper file sizes, feature-based)
- Điểm tổng thể: **9.5/10**

---

## 🔗 FILES CẦN SỬA CHI TIẾT

### Files cần sửa ngay (P0):
1. `src/lib/game/dps-calculator.ts` - Fix parsing error line 145
2. `src/lib/game/meta-tracker.ts` - Fix parsing error line 416
3. `scripts/backup/database-backup.ts` - Fix unused variables
4. `scripts/i18n/translate-with-glossary.ts` - Fix unused variables
5. `scripts/i18n/translation-consistency-checker.ts` - Fix unused variables
6. `scripts/i18n/translation-review-system.ts` - Fix unused variables
7. `scripts/monitoring/data-quality-dashboard.ts` - Fix require import
8. `scripts/seed/seed-enemies-enhanced.ts` - Fix unused parameters
9. `src/agent/core/AgentCore.ts` - Fix unused variables
10. `src/agent/core/continuous-learning.ts` - Fix unused variable
11. `src/agent/core/rag-system.ts` - Fix any types
12. `src/app/api/agent/feedback/route.ts` - Fix unused schema, req
13. `src/app/api/tools/material-calculator/route.ts` - Fix prefer-const, any
14. `src/components/admin/RecentActivity.tsx` - Fix useEffect dependency
15. `src/components/character/ElementIcon.tsx` - Replace img with Image
16. `src/lib/game/material-calculator.ts` - Fix any type
17. `src/agent/utils/cost-tracker.ts` - Fix unused variable
18. `.env.example` - Remove duplicate NEXT_PUBLIC_SITE_URL
19. `.gitignore` - Remove duplicate .env

### Files cần sửa (P1):
1. `prisma/schema.prisma` - Add artifact/enemy fields
2. `scripts/seed/seed-artifacts.ts` - Populate artifact stats
3. `scripts/seed/seed-enemies-enhanced.ts` - Populate enemy exact values
4. `src/lib/game/dps-calculator.ts` - Add reaction direction
5. `src/app/api/characters/route.ts` - Add edge caching
6. `src/features/characters/service.ts` - Add query caching
7. `next.config.ts` - Add CDN domain
8. `src/app/api/characters/route.ts` - Add Sentry performance
9. Tạo `scripts/meta/auto-update-meta.ts`
10. Tạo `.github/workflows/auto-update-meta.yml`

### Files cần refactor (P2):
1. `src/lib/game/element-reactions-data.ts` → `src/lib/game/reactions/`
2. `src/agent/core/rag-system.ts` → `src/agent/core/rag/`
3. `src/lib/game/dps-calculator.ts` → `src/lib/game/dps/`
4. `src/lib/game/material-calculator.ts` → `src/lib/game/material/`
5. `src/components/character/` → `src/components/features/characters/`
6. `src/components/weapon/` → `src/components/features/weapons/`
7. Tạo `src/lib/api/query/` utilities
8. Tạo `src/agent/core/reasoning.ts`
9. Tạo `src/agent/core/security.ts`
10. Tạo integration tests
11. Tạo E2E tests

---

## 📝 CHECKLIST (cập nhật 2026-09-22 — theo trạng thái thật, đã chạy công cụ xác nhận)

### Code Quality
- [x] Fix lint errors (2 lỗi thật — không phải 29 như bản gốc liệt kê)
- [x] Fix TypeScript errors (6 lỗi thật)
- [x] Fix configuration duplicates (`.env.example`, `.gitignore`)
- [x] Run `npm run typecheck` pass
- [x] Run `npm run lint` pass
- [x] Run `npm run test` pass (113/113, +4 test mới cho reaction direction)
- [x] Fix GitHub Actions workflows (`auto-sync.yml` thiếu env + `--env-file`
      bug; xoá `release.yml` — leftover từ repo khác, dùng changesets mà
      LEIBO không cài, fail mọi lần push vào `main`)

### Dữ liệu Game
- [ ] Add artifact main/sub stats (schema chưa có field)
- [ ] Add enemy exact weakness/resistance values (schema chưa có field)
- [ ] Implement real-time meta integration + `auto-update-meta.yml`
- [x] Fix reaction direction detection (`calculateReactionMultiplier` + test)
- [ ] Verify data accuracy vs official sources

### AI Agent
- [ ] Add vector embeddings for RAG (snippet đã sửa đúng cú pháp Prisma —
      xem mục 3.1, cần xác nhận Neon bật được extension `vector` trước)
- [ ] Implement multi-turn reasoning (`src/agent/core/reasoning.ts` — file
      chưa tồn tại)
- [ ] Add structured output generation (dùng `generateObject` của `ai` SDK
      đã có sẵn trong deps — không cần thêm lib mới)
- [ ] Add context summarization
- [ ] Add tool chaining

### Hiệu năng
- [ ] Thêm ISR (`revalidate`) cho API routes đọc-nhiều — **KHÔNG** thêm
      `runtime="edge"` (không tương thích driver `pg` hiện tại, xem mục 2.1)
- [ ] Mở rộng `unstable_cache` cho filter-option queries ở weapons/
      artifacts/domains, theo đúng pattern đã có ở characters (xem mục 2.2)
- [ ] (Việc lớn, tách riêng) Bật `cacheComponents` + migrate `"use cache"`
- [ ] Add CDN for images — cần khảo sát hiện trạng R2/Cloudflare trước
- [ ] Implement query batching cho dashboard
- [ ] Add performance monitoring (Sentry transactions trên API routes)

### Tổ chức File
- [ ] Refactor large data files (`element-reactions-data.ts`, ...)
- [ ] Refactor game logic files (`dps-calculator.ts` → module con)
- [ ] Restructure components by feature
- [ ] Create shared API utilities
- [ ] Add integration tests
- [ ] Add E2E tests

### Security
- [ ] Add PII detection (`src/agent/core/security.ts` — file chưa tồn tại;
      nếu làm, ưu tiên pattern SĐT/CCCD Việt Nam thay vì SSN kiểu Mỹ như
      bản gốc, vì người dùng site chủ yếu ở VN)
- [ ] Add content moderation
- [ ] Add jailbreak detection
- [ ] Add output filtering
- [ ] Add rate limiting per user

---

## 🧭 HƯỚNG SỬA LỖI & CẢI THIỆN TIẾP THEO (bổ sung 2026-09-22)

Thứ tự đề xuất tiếp theo, ưu tiên việc rủi ro thấp/giá trị rõ trước:

**Bước kế tiếp ngay (rủi ro thấp, không đổi kiến trúc):**
1. Hoàn thiện `/api/tools/dps` — map request schema (zod) sang 6 tham số
   thật của `calculateExpectedDPS()` (cần tra `character`/`weapon` trong
   DB theo `characterId`/`weaponId` từ request). Route hiện trả `501`.
2. Mở rộng `unstable_cache` cho filter-option queries ở `weapons`/
   `artifacts`/`domains` — copy đúng pattern `get-character-listing.ts`,
   KHÔNG cache query chính có phân trang.
3. Thêm `revalidate` (ISR) cho các route GET đọc-nhiều: `characters`,
   `weapons`, `artifacts`, `domains`, `materials`.
4. Rà lại `docs/AUTOMATION_GUIDE.md` — tài liệu mô tả auto-sync là "đã hoàn
   thành" nhưng workflow thực tế bị lỗi cho tới hôm nay; sau khi verify
   `auto-sync.yml` chạy ổn trên Actions thật, cập nhật lại doc cho khớp.
   Cũng cân nhắc: `auto-sync.yml` (daily 2AM UTC), `update-data.yml`
   (weekly), và `full-pipeline.yml` (weekly) đều crawl+seed cùng nguồn
   `genshin-db` — có khả năng dư thừa/trùng việc, nên rà lại xem có cần
   giữ cả 3 hay gộp bớt.
4b. ✅ ĐÃ XONG (2026-09-22) — 2/3 khoảng trống "chỉ chạy tay" đã audit ở
   lượt trước giờ đã tự động: `data-quality-monitor.yml` (chạy
   `monitor:dashboard --json` hàng ngày, tự tạo/update GitHub Issue nếu có
   alert `critical`) và `i18n-consistency-monitor.yml` (chạy
   `translation-consistency-checker.ts --check-terminology
   --check-formatting --check-length` hàng ngày — script này ĐÃ XÁC NHẬN
   chỉ đọc DB, không `update()`/`create()` nào, nên an toàn tự động 100%
   không cần review). Cả 2 đều dedup issue (comment vào issue cũ thay vì
   tạo issue mới mỗi ngày cho cùng 1 vấn đề chưa xử lý). Còn thiếu khâu 3
   (`translate-with-glossary.ts` — SINH bản dịch mới) — xem mục "🤖 KIẾN
   TRÚC AI AGENT TỰ ĐỘNG HOÁ" bên dưới để hiểu vì sao khâu này CHƯA nối
   vào cron và hướng làm đúng.
4c. ✅ ĐÃ SỬA (2026-09-22) — `_checkTerminologyConsistency()` trong
   `translation-consistency-checker.ts` được viết nhưng CHƯA TỪNG được gọi
   (tên hàm bị gắn `_` để né lint thay vì nối dây thật) — nghĩa là flag
   `--fix-terminology` documented trong CLI usage không hề làm gì. Đã nối
   dây thật cho field `description` (character + weapon) + thêm flag
   `--check-terminology` đúng pattern với `--check-formatting`/
   `--check-length` đã có. `--fix-terminology` giờ xuất
   `terminology-fix-queue.json` (KHÔNG tự đoán-ghi-đè DB — sai 1 thuật ngữ
   có thể làm sai cả câu, và không thể tự động xác nhận bản dịch nào
   "đúng hơn" mà không có người/LLM review). Còn thiếu: `talents`/
   `constellations` (bug khác — đang so sánh bản dịch với chính nó, xem
   comment "Would need original text here" trong code — để lại việc sau
   vì cần restructure sâu hơn, không muốn vá ẩu phần đang có nguy cơ ảnh
   hưởng dữ liệu thật).

**Việc vừa (cần thiết kế trước khi code):**
5. Sentry performance monitoring — dùng `Sentry.startSpan()` (API hiện tại
   của `@sentry/nextjs` v10, **không phải** `startTransaction()` như bản
   gốc — API đó đã bị thay thế) bọc quanh vài route chậm nhất trước, đo rồi
   mới quyết định bọc thêm.
6. Artifact/Enemy schema mở rộng (P1.1, P1.2 trong plan) — cần viết
   migration Prisma đúng cách (`prisma migrate dev --name ...`), có kế
   hoạch backfill dữ liệu cũ, không chỉ sửa `schema.prisma` rồi seed lại từ
   đầu (sẽ mất dữ liệu đã có).

**Việc lớn (tách PR riêng, có benchmark/test trước khi merge):**
7. Vector embeddings cho RAG — theo đúng cú pháp đã sửa ở mục 3.1, xác
   nhận Neon bật extension `vector` trước khi viết code.
8. Bật `cacheComponents: true` + migrate `unstable_cache` → `"use cache"`.
9. Edge runtime cho API routes — chỉ làm SAU khi đã đổi driver DB sang
   `@neondatabase/serverless` + `@prisma/adapter-neon` (xem mục 2.1); đo
   latency trước/sau bằng dữ liệu thật, không giả định "edge = nhanh hơn"
   khi chưa benchmark.
10. Refactor file lớn theo feature — nên làm SAU khi đã có nhiều test hơn
    (mục Tổ chức File + Security), để refactor có lưới an toàn.

---

## 🎓 LƯU Ý QUAN TRỌNG

### Khi sửa code:
1. **Luôn chạy tests trước khi commit**
2. **Run typecheck trước khi commit**
3. **Run lint trước khi commit**
4. **Kiểm tra breaking changes**
5. **Review carefully trước merge**

### Khi refactor file:
1. **Preserve functionality** - không thay đổi behavior
2. **Update imports** - update các file import file đã refactor
3. **Run tests** - đảm bảo không break
4. **Commit từng refactor riêng** - để dễ rollback nếu cần

### Khi add new features:
1. **Document changes** - update README/docs
2. **Add tests** - cover new functionality
3. **Review performance** - không degrade performance
4. **Security review** - check security implications

---

## 🚀 NEXT STEPS

### Ngay lập tức (bắt đầu):
1. Fix 2 parsing errors (30 phút)
2. Fix 29 lint errors (2 giờ)
3. Run tests và verify (30 phút)

### Tuần này:
1. Cải thiện dữ liệu game (artifact stats, enemy data)
2. Add edge caching và database query caching
3. Add CDN cho images

### Tuần sau:
1. Refactor large files
2. Cải thiện AI Agent (vector embeddings, multi-turn reasoning)
3. Add integration và E2E tests

---

## 📞 SUPPORT

Nếu gặp vấn đề trong quá trình sửa:
- Kiểm tra error messages carefully
- Review documentation của Next.js, Prisma, AI SDK
- Search online cho error messages cụ thể
- Đừng hesitate để rollback nếu cần

---

## 🕰️ LƯU DỮ LIỆU GAME THEO PHIÊN BẢN (bổ sung 2026-09-22)

**Câu hỏi đặt ra:** có lấy được toàn bộ dữ liệu Genshin từ bản 1.0 (28/09/2020)
đến hiện tại (~7.0) và lưu theo phiên bản không?

### Đã điều tra thực tế (không đoán) — 2 hướng, chọn hướng an toàn hơn

**Hướng 1 — cào lại dữ liệu THÔ từng bản game cũ (không chọn):**
- Nguồn datamine gốc (`Dimbreath/AnimeGameData`) đã chuyển sang GitLab, và
  **sandbox môi trường này chặn `gitlab.com`** (`x-deny-reason:
  host_not_allowed`) — không tự kiểm chứng trực tiếp được ở đây (workflow
  GitHub Actions thật của bạn thì KHÔNG bị chặn, có thể thử lại ở đó).
- `genshin-db` (dependency đang dùng) có **123 bản npm** từ 2020-11-08 (~2
  tháng sau launch, không phải đúng ngày 1.0) đến hôm qua — nhưng đã tải
  và so sánh trực tiếp bản `1.4.5` (2020) với bản hiện tại: **cấu trúc dữ
  liệu hoàn toàn khác nhau** (bản cũ không có stats/talents, chỉ có
  info cơ bản lấy từ Fandom Wiki). Nghĩa là parser cho từng thời kỳ phải
  viết riêng — dự án lớn, không nên làm ẩu trong 1 lần sửa.

**Hướng 2 — dùng field `version` genshin-db ĐÃ CÓ SẴN (đã chọn, làm luôn):**
Bản genshin-db hiện tại (đã kiểm tra `node_modules/genshin-db/src/min/data.min.json`)
có bảng `version` gắn "phiên bản ra mắt" cho GẦN NHƯ MỌI entity — nhân vật,
vũ khí, artifact set, material, thành tựu... — từ 1.0 tới 7.0, ví dụ
`"amber": "1.0"`, `"chiori": "4.5"`. Đã verify field này thật sự trả về
qua API (`genshindb.characters("Amber").version === "1.0"`), không chỉ có
trong file JSON tĩnh.

**Phát hiện khi audit:** `Character` và `Domain` **đã có sẵn** cột
`gameVersion` và **đã ghi đúng** từ `crawl-characters.ts` — nhưng
`Weapon`, `ArtifactSet`, `Material` **bị bỏ sót hoàn toàn** dù genshin-db
cũng trả `.version` cho cả 3 loại này (đã verify bằng cách gọi trực tiếp
`genshindb.weapons()`/`.artifacts()`/`.materials()`).

### ✅ Đã sửa (2026-09-22)
- Thêm cột `gameVersion String?` cho `Weapon`, `ArtifactSet`, `Material`
  trong `prisma/schema.prisma`, kèm migration
  `20260922070000_add_weapon_artifact_material_game_version`.
- `seed-weapons.ts`, `seed-artifacts.ts`, `seed-helpers.ts::upsertMaterial`
  đã ghi field này vào payload upsert.
- **Chưa backfill dữ liệu cũ** — migration chỉ thêm cột (NULL cho record
  hiện có); giá trị thật tự điền dần vào lần `npm run db:seed` (hoặc
  `update-data.yml`/`auto-fix.yml`/`full-pipeline.yml`) kế tiếp chạy,
  không cần thao tác gì thêm.

### Ý nghĩa thực tế
Sau khi seed lại, bạn có thể lọc/hiển thị "nhân vật/vũ khí/artifact/vật
liệu mới trong bản X" cho MỌI bản từ 1.0 tới hiện tại — đúng phần giá trị
nhất của "lưu theo phiên bản" mà không cần hạ tầng cào dữ liệu lịch sử
phức tạp. Nếu sau này thực sự cần dữ liệu CHỈ SỐ chi tiết qua từng bản
(vd Diluc bản 1.0 có ATK bao nhiêu, sau rebalance thay đổi ra sao) thì mới
cần quay lại Hướng 1 — đó là việc lớn, nên tách PR riêng, có thời gian
thử với GitLab (ngoài sandbox này) trước.

---

## 🤖 KIẾN TRÚC AI AGENT TỰ ĐỘNG HOÁ (bổ sung 2026-09-22)

**Bối cảnh:** dự án làm 1 mình, muốn AI agent gánh phần lớn việc lặp lại
(cập nhật, đối chiếu, dịch thuật) để không phải tự tay làm hết.

### Vì sao "AI agent tự viết thẳng vào DB production, 0% người duyệt" là SAI hướng — kể cả khi làm 1 mình

Đọc kỹ `ToolRegistry.ts` sẽ thấy chính codebase này **đã có chủ đích** khoá
`FixTool`/`SyncTool` ở `permission = "admin"` để LLM (chatbot công khai,
nhận input từ bất kỳ ai gõ vào ô chat) **không bao giờ** tự gọi được 2 tool
ghi dữ liệu. Đây không phải thiếu sót — đây là phòng 3 rủi ro cụ thể:
1. **Prompt injection**: chat là bề mặt công khai, ai cũng gõ được. Một
   tin nhắn khéo léo có thể dụ LLM "tưởng" nó đang được admin yêu cầu sửa
   data.
2. **Hallucination**: LLM có thể tự tin đưa ra 1 con số ATK/HP sai hoàn
   toàn (giống hệt kiểu bug công thức Aggravate/Spread vừa sửa ở trên —
   nếu không ai kiểm lại, sai số này lên thẳng production).
3. **Không có "người thứ 2"**: làm nhóm thì có teammate review PR. Làm 1
   mình, KHÔNG có review nào từ AI cả — vậy cái gì đóng vai trò người
   review? Câu trả lời chuẩn (và codebase đã tự chứng minh nó khả thi,
   xem `update-data.yml`): **CI tự động (lint/typecheck/test/build/
   migrate + integrity check) chính là "người review" thay bạn.**

### Pattern chuẩn ĐÃ CÓ SẴN trong repo — chỉ cần nhân rộng

`update-data.yml` đã làm đúng thứ bạn muốn — tự động 100%, không cần bấm
gì ở đường happy path, NHƯNG vẫn an toàn:
```
crawl → seed vào DB test → verify integrity
  → tạo PR → CI (ci.yml) chạy lại toàn bộ lint/typecheck/test/build/migrate
  → CHỈ merge khi CI xanh (gh pr merge --auto)
  → nếu verify fail → tạo GitHub Issue thay vì merge
```
Đây chính xác là mức tự động hoá "chuẩn chuyên nghiệp" cho 1 người: việc
của bạn co lại thành **0 thao tác** khi mọi thứ ổn, và **1 thông báo rõ
ràng** (Issue) khi có gì bất thường cần bạn tự quyết định — không phải
"AI tự quyết luôn không cần hỏi ai."

**Đã nhân rộng pattern này thêm 2 khâu** (xem file đính kèm):
- `data-quality-monitor.yml` — tự động, không cần PR (đây là báo cáo đọc,
  không phải thay đổi code/data).
- `i18n-consistency-monitor.yml` — tự động, an toàn 100% vì
  `translation-consistency-checker.ts` CHỈ ĐỌC DB (đã verify bằng grep,
  không có `.update()`/`.create()` nào).

### Khâu CHƯA nối được vào cron — vì sao, và thiết kế đúng để làm tiếp

`translate-with-glossary.ts` (sinh bản dịch MỚI qua Azure Translator) khác
về bản chất với `data/raw/` (file trong git, diff được, CI verify được):
translations nằm trong cột JSON của Prisma (`descriptionTranslations`...),
**ghi thẳng vào DB, không qua file nào để tạo PR-diff được** — nên không
áp được y nguyên pattern `update-data.yml`. Và quan trọng hơn: sai số ATK/
HP là nhị phân (đúng/sai, `verify-seed-integrity.ts` kiểm được), còn "bản
dịch máy này tốt hay dở" thì **CI không có cách nào tự chấm điểm được** —
đây là ranh giới thật giữa việc CÓ THỂ tự động 100% và việc BẮT BUỘC cần
mắt người, không phải do dự án thiếu code.

**Thiết kế đề xuất (chưa làm — việc lớn, cần 1 PR riêng):**
1. Sửa `translate-with-glossary.ts` để chạy nhắm vào **DB test** (giống
   `update-data.yml` seed vào Postgres service tạm trong CI) thay vì DB
   production trực tiếp.
2. Thêm bước export các row `character`/`weapon` VỪA được dịch ra 1 file
   JSON snapshot (vd `data/translations-pending/<locale>.json`) — CHÍNH
   bước "đổi từ ghi-DB-trực-tiếp sang xuất-ra-file" này là thứ biến nó
   thành diff-được, PR-được.
3. Tạo PR chứa file snapshot đó — **KHÔNG auto-merge** (khác
   `update-data.yml`) — gắn label `needs-human-review`, vì đây đúng là
   chỗ cần mắt người thật (đọc thử vài dòng bản dịch xem có ổn không).
4. 1 script riêng, chạy khi PR được merge (`workflow_run` trigger), đọc
   file snapshot đã duyệt rồi mới `prisma.update()` thật vào production.

Cách này giữ đúng nguyên tắc: **tự động hoá TOÀN BỘ phần việc lặp lại,
tốn thời gian** (gọi API dịch, áp glossary, chạy consistency check) —
CHỈ giữ lại đúng 1 bước cần con người: đọc lướt bản dịch mới trong PR rồi
bấm Approve. Đây là chuẩn "MTPE" (Machine Translation + Human Post-Edit)
ngành dịch thuật vẫn dùng, không phải do dự án này tự nghĩ ra.

### Việc còn lại cho AI agent (chatbot) thật sự "hỗ trợ" nhiều hơn

`SearchTool`/`FetchLiveTool`/`CompareTool`/`AuditTool` (permission "user"/
"public", chỉ đọc) đã an toàn để mở rộng thoải mái — đây là chỗ nên đầu tư
thêm cho 1 người làm solo, vì không đụng tới rủi ro ghi-DB ở trên:
- Cho phép LLM tự động **phát hiện bất thường** (dùng `CompareTool` +
  `FetchLiveTool` so dữ liệu DB với nguồn live) rồi tự soạn nội dung Issue/
  PR-description — nhưng việc TẠO PR/Issue vẫn nên qua 1 script riêng có
  kiểm tra lại output của LLM trước khi gọi GitHub API (LLM soạn nội
  dung ≠ LLM tự ý hành động).
- Đây chính là hướng "agent-driven audit" — AI đọc, so sánh, đề xuất; CI +
  con người vẫn là bước chốt cuối — không phải "AI agent quyết định hết."

---

**Tài liệu được tạo bởi Devin - AI Engineering Assistant**
**Dựa trên phân tích chi tiết codebase LEIBO**
**Audit + sửa lỗi + mở rộng bởi Claude (Anthropic), 2026-09-22**