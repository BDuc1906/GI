# LEIBO - KẾ HOẠCH CẢI THIỆN TOÀN DIỆN

**Ngày tạo:** 2026-09-20  
**Trạng thái dự án:** Production-ready (8.3/10)  
**Mục tiêu:** Tăng lên 9.5/10 (production-ready hoàn chỉnh)

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

## 🔴 P0 - CRITICAL (Phải sửa ngay - 2-3 giờ)

### 1. Fix 2 Parsing Errors ❌

**Vị trí:**
- `src/lib/game/dps-calculator.ts:145:89` - ':' expected
- `src/lib/game/meta-tracker.ts:416:8` - ')' expected

**Chi tiết lỗi:**
```typescript
// src/lib/game/dps-calculator.ts line 145
const er = 1 + (artifacts.gobletMainStat === "Energy Recharge%" ? artifacts.gobletValue / 0) + // ❌ Lỗi ở đây
```

**Fix:**
```typescript
// src/lib/game/dps-calculator.ts line 145
const er = 1 + (artifacts.gobletMainStat === "Energy Recharge%" ? artifacts.gobletValue / 100 : 0) +
```

**Cách sửa:**
1. Mở `src/lib/game/dps-calculator.ts`
2. Tìm line 145
3. Thay `/ 0)` thành `/ 100)`

```typescript
// src/lib/game/meta-tracker.ts line 416
// Kiểm tra và fix ngoặc đơn
```

---

### 2. Fix 29 Lint Errors ❌

**Chi tiết lỗi theo file:**

#### Scripts (8 errors):
- `scripts/backup/database-backup.ts`: 2 errors (unused variables)
- `scripts/i18n/translate-with-glossary.ts`: 2 errors (unused variables)
- `scripts/i18n/translation-consistency-checker.ts`: 2 errors (unused variables)
- `scripts/i18n/translation-review-system.ts`: 2 errors (unused variables)
- `scripts/monitoring/data-quality-dashboard.ts`: 2 errors (require import, unused variable)
- `scripts/seed/seed-enemies-enhanced.ts`: 2 errors (unused parameters)

**Fix mẫu:**
```typescript
// scripts/backup/database-backup.ts
// ❌ Before:
const err = error;

// ✅ After:
const _err = error; // Thêm prefix underscore để mark unused
```

#### Agent Core (7 errors):
- `src/agent/core/AgentCore.ts`: 2 errors (unused variables)
- `src/agent/core/continuous-learning.ts`: 1 error (unused variable)
- `src/agent/core/rag-system.ts`: 5 errors (`any` types)

**Fix mẫu:**
```typescript
// src/agent/core/rag-system.ts
// ❌ Before: any types
const data: any = result;

// ✅ After: proper types
const data: KnowledgeChunk = result;
```

#### API Routes (4 errors):
- `src/app/api/agent/feedback/route.ts`: 2 errors (unused schema, req)
- `src/app/api/tools/material-calculator/route.ts`: 2 errors (prefer-const, any)

**Fix mẫu:**
```typescript
// src/app/api/tools/material-calculator/route.ts
// ❌ Before:
let data = fetch();

// ✅ After:
const data = fetch();
```

#### Components (2 warnings):
- `src/components/admin/RecentActivity.tsx`: 1 warning (useEffect dependency)
- `src/components/character/ElementIcon.tsx`: 1 warning (use <img> instead of <Image>)

**Fix mẫu:**
```typescript
// src/components/character/ElementIcon.tsx
// ❌ Before:
<img src={iconUrl} alt={name} />

// ✅ After:
<Image src={iconUrl} alt={name} width={24} height={24} />
```

#### Game Logic (3 errors):
- `src/lib/game/material-calculator.ts`: 1 error (`any` type)
- `src/lib/game/dps-calculator.ts`: 1 parsing error ❌ (đã fix ở trên)
- `src/lib/game/meta-tracker.ts`: 1 parsing error ❌ (đã fix ở trên)

**Fix mẫu:**
```typescript
// src/lib/game/material-calculator.ts
// ❌ Before:
const data: any = parseData();

// ✅ After:
const data: MaterialData = parseData();
```

#### Utils (1 error):
- `src/agent/utils/cost-tracker.ts`: 1 error (unused variable)

**Fix mẫu:**
```typescript
// src/agent/utils/cost-tracker.ts
// ❌ Before:
const cost = calculateCost();

// ✅ After:
const _cost = calculateCost();
```

**Cách sửa nhanh:**
```bash
# Auto-fix có thể dùng
npm run lint --fix

# Hoặc sửa thủ công từng file
```

---

### 3. Fix Configuration Issues ⚠️

**.env.example duplicates:**
```bash
# ❌ Before (line 7-8):
NEXT_PUBLIC_SITE_URL=...
NEXT_PUBLIC_SITE_URL=...

# ✅ After:
NEXT_PUBLIC_SITE_URL=...
# (Xóa dòng duplicate)
```

**.gitignore duplicates:**
```bash
# ❌ Before (line 12 và 52):
.env
.env

# ✅ After:
.env
# (Xóa dòng duplicate)
```

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

#### 1.4 Fix Reaction Direction Detection ❌

**Vấn đề:** DPS calculator không phân biệt forward/reverse reactions

**Fix:**
```typescript
// src/lib/game/dps-calculator.ts
calculateReactionMultiplier(
  reaction: string,
  direction: "forward" | "reverse", // Thêm param
  em: number,
  level: number
): number {
  switch (reaction) {
    case "Vaporize":
      if (direction === "forward") return 2.0 * levelBonus; // Hydro on Pyro
      if (direction === "reverse") return 1.5 * levelBonus; // Pyro on Hydro
      break;
    case "Melt":
      if (direction === "forward") return 2.0 * levelBonus; // Pyro on Cryo
      if (direction === "reverse") return 1.5 * levelBonus; // Cryo on Pyro
      break;
    // ... các reactions khác
  }
}
```

**File cần sửa:**
- `src/lib/game/dps-calculator.ts`

---

### 2. Cải thiện Hiệu Năng

#### 2.1 Add Edge Caching ❌

**Vấn đề:** Cache chỉ ở server-side, không có edge cache

**Fix:**
```typescript
// src/app/api/characters/route.ts
export const dynamic = "force-static"; // Enable edge cache
export const revalidate = 60; // Keep ISR for background revalidation
export const fetchCache = "force-cache";
export const runtime = "edge"; // Run on edge
```

**Apply cho tất cả API routes:**
- `src/app/api/characters/route.ts`
- `src/app/api/weapons/route.ts`
- `src/app/api/artifacts/route.ts`
- `src/app/api/domains/route.ts`
- `src/app/api/materials/route.ts`
- `src/app/api/build/route.ts`

---

#### 2.2 Implement Database Query Caching ❌

**Vấn đề:** Chỉ 2 query được cache, nhiều query khác chưa cache

**Fix:**
```typescript
// src/features/characters/service.ts
import { unstable_cache } from "next/cache";

class CharactersService {
  async getById(id: string) {
    return unstable_cache(
      async () => prisma.character.findUnique({ where: { id } }),
      [`character-${id}`],
      { revalidate: 300 } // 5 minutes
    )(id);
  }
  
  async getList(filters: CharacterFilters) {
    const cacheKey = `characters-${JSON.stringify(filters)}`;
    return unstable_cache(
      async () => prisma.character.findMany({ where: filters }),
      [cacheKey],
      { revalidate: 60 } // 1 minute
    )(filters);
  }
}
```

**Apply cho:**
- `src/features/characters/service.ts`
- `src/features/weapons/service.ts`
- `src/features/artifacts/service.ts`
- `src/features/domains/service.ts`

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

#### 3.1 Add Vector Embeddings for RAG ❌

**Vấn đề:** RAG dùng keyword matching thay vì vector embeddings

**Fix:**
```typescript
// 1. Integrate vector database (pgvector trong PostgreSQL)
// prisma/schema.prisma
model KnowledgeChunk {
  id String @id
  content String
  category String
  embedding Float[]?  // Thêm field embeddings
  
  @@index([embedding], type: vector)
}

// 2. Generate embeddings
import { OpenAIEmbeddings } from "@langchain/openai";

const embeddings = new OpenAIEmbeddings({
  modelName: "text-embedding-3-small"
});

const embedding = await embeddings.embedQuery(content);

// 3. Vector similarity search
const similarChunks = await prisma.$queryRaw`
  SELECT *, embedding <=> $1 as distance
  FROM knowledge_chunks
  WHERE category = $2
  ORDER BY distance
  LIMIT 5
`;
```

**File cần sửa:**
- `prisma/schema.prisma`
- `src/agent/core/rag-system.ts`

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

## 📝 CHECKLIST

### Code Quality
- [ ] Fix 2 parsing errors
- [ ] Fix 29 lint errors
- [ ] Fix configuration duplicates
- [ ] Run `npm run typecheck` pass
- [ ] Run `npm run lint` pass
- [ ] Run `npm run test` pass

### Dữ liệu Game
- [ ] Add artifact main/sub stats
- [ ] Add enemy exact weakness/resistance values
- [ ] Implement real-time meta integration
- ] Fix reaction direction detection
- [ ] Verify data accuracy vs official sources

### AI Agent
- [ ] Add vector embeddings for RAG
- [ ] Implement multi-turn reasoning
- [ ] Add structured output generation
- [ ] Add context summarization
- [ ] Add tool chaining

### Hiệu năng
- [ ] Add edge caching
- [ ] Implement database query caching
- [ ] Add CDN for images
- [ ] Implement query batching
- [ ] Add performance monitoring

### Tổ chức File
- [ ] Refactor large data files
- [ ] Refactor game logic files
- [ ] Restructure components by feature
- [ ] Create shared API utilities
- [ ] Add integration tests
- [ ] Add E2E tests

### Security
- [ ] Add PII detection
- [ ] Add content moderation
- [ ] Add jailbreak detection
- [ ] Add output filtering
- [ ] Add rate limiting per user

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

**Tài liệu được tạo bởi Devin - AI Engineering Assistant**
**Dựa trên phân tích chi tiết codebase LEIBO**
