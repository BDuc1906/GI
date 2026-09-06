# Build Planner API - V2 Feature

Bộ API hoàn chỉnh cho xây dựng nhân vật, so sánh, gợi ý đội hình, và kế hoạch farm.

## Endpoints

### 1. Gợi ý Vũ Khí (Weapon Recommendation)
```
GET /api/build?characterId=kazuha
```

**Tham số:**
- `characterId` (required): Slug nhân vật (vd: "kazuha", "hu-tao")

**Phản hồi:**
```json
{
  "success": true,
  "data": {
    "characterId": "kazuha",
    "characterName": "Kazuha",
    "vision": "Anemo",
    "weaponType": "Sword",
    "recommendedWeapon": {
      "id": "freedom-sworn",
      "name": "Freedom-Sworn",
      "type": "Sword",
      "rarity": 5
    },
    "summary": "..."
  }
}
```

---

### 2. So Sánh Nhân Vật (Character Comparison)
```
GET /api/build/compare?characterId1=kazuha&characterId2=hu-tao
```

**Tham số:**
- `characterId1` (required): Nhân vật thứ 1
- `characterId2` (required): Nhân vật thứ 2 (phải khác với characterId1)

**Phản hồi:**
```json
{
  "success": true,
  "data": {
    "character1": {
      "id": "kazuha",
      "name": "Kazuha",
      "vision": "Anemo",
      "weaponType": "Sword",
      "rarity": 5,
      "baseHp": 193.5,
      "baseAtk": 50.3,
      "baseDef": 69.5
    },
    "character2": {
      "id": "hu-tao",
      "name": "Hu Tao",
      "vision": "Pyro",
      "weaponType": "Polearm",
      "rarity": 5,
      "baseHp": 230.2,
      "baseAtk": 47.0,
      "baseDef": 49.3
    },
    "similarities": {
      "sameVision": false,
      "sameWeaponType": false
    },
    "differences": {
      "rarityDiff": 0,
      "atkDiff": 3.3,
      "hpDiff": 36.7,
      "defDiff": 20.2
    },
    "recommendation": "..."
  }
}
```

---

### 3. Gợi ý Thánh Di Vật (Artifact Recommendation)
```
GET /api/build/artifact?characterId=kazuha
```

**Tham số:**
- `characterId` (required): Slug nhân vật

**Phản hồi:**
```json
{
  "success": true,
  "data": {
    "characterId": "kazuha",
    "characterName": "Kazuha",
    "vision": "Anemo",
    "recommendedArtifacts": [
      {
        "id": "viridescent-venerer",
        "name": "Viridescent Venerer",
        "rarityRange": [4, 5],
        "twoPieceBonus": "+15% Anemo DMG Bonus",
        "fourPieceBonus": "+15% Anemo DMG Bonus, and increases all party members' elemental damage..."
      }
    ],
    "buildSummary": "Kazuha nên sử dụng bộ thánh di vật: Viridescent Venerer,... để tối ưu hóa sức mạnh."
  }
}
```

---

### 4. Gợi ý Bí Cảnh (Domain Recommendation)
```
GET /api/build/domain?characterId=kazuha
```

**Tham số:**
- `characterId` (required): Slug nhân vật

**Phản hồi:**
```json
{
  "success": true,
  "data": {
    "characterId": "kazuha",
    "characterName": "Kazuha",
    "vision": "Anemo",
    "recommendedDomains": [
      {
        "id": "domain-of-windy-storms",
        "name": "Domain of Windy Storms",
        "category": "Talent",
        "description": "...",
        "recommendReason": "Kazuha cần farm kỹ năng để nâng cấp"
      }
    ],
    "farmingPlan": "Kazuha nên farm Talent và Weapon để phát triển. Ưu tiên talent trước, sau đó là vũ khí."
  }
}
```

---

### 5. Bản Đồ Xây Dựng Hoàn Chỉnh (Full Build Plan)
```
GET /api/build/full?characterId=kazuha
```

**Tham số:**
- `characterId` (required): Slug nhân vật

**Phản hồi:**
```json
{
  "success": true,
  "data": {
    "character": {
      "id": "kazuha",
      "name": "Kazuha",
      "vision": "Anemo",
      "weaponType": "Sword",
      "rarity": 5
    },
    "weaponRecommendation": { ... },
    "artifactRecommendation": { ... },
    "domainRecommendation": { ... },
    "buildSummary": "Bản đồ xây dựng hoàn chỉnh cho Kazuha: Vũ khí: Freedom-Sworn. Thánh di vật: Viridescent Venerer. Ưu tiên farm: Domain of Windy Storms."
  }
}
```

---

### 6. Gợi ý Đội Hình (Team Composition Recommendation)
```
GET /api/build/team?characterId=kazuha
```

**Tham số:**
- `characterId` (required): Slug nhân vật (Main DPS)

**Phản hồi:**
```json
{
  "success": true,
  "data": {
    "mainCharacterId": "kazuha",
    "mainCharacterName": "Kazuha",
    "mainCharacterVision": "Anemo",
    "recommendedTeamMembers": [
      {
        "id": "hu-tao",
        "name": "Hu Tao",
        "vision": "Pyro",
        "weaponType": "Polearm",
        "rarity": 5,
        "synergy": 40,
        "role": "Main DPS",
        "reason": "Hu Tao hỗ trợ tốt cho Kazuha với nguyên tố Pyro."
      }
    ],
    "teamComposition": "Đội hình: Kazuha (Main DPS) + Hu Tao, ... (Main DPS, Support, Sub-DPS)",
    "teamSynergy": "Độ hỗ trợ trung bình: 40%. Đội hình này phù hợp với Anemo DPS."
  }
}
```

---

## Rate Limits

Mỗi endpoint có giới hạn tốc độ:

| Endpoint | Limit | Prefix |
|----------|-------|--------|
| `/api/build` | 30 req/min | build-recommend |
| `/api/build/compare` | 30 req/min | build-compare |
| `/api/build/artifact` | 30 req/min | build-artifact |
| `/api/build/domain` | 30 req/min | build-domain |
| `/api/build/full` | 30 req/min | build-full-plan |
| `/api/build/team` | 30 req/min | build-team |

---

## Cache

Tất cả các endpoint được cache lại trong **5 phút** (300 giây) để giảm tải server.

```
Cache-Control: public, max-age=300, s-maxage=300
```

---

## Lỗi Phổ Biến

### 400 Bad Request
```json
{
  "success": false,
  "error": "Dữ liệu ... không hợp lệ",
  "fieldErrors": {
    "characterId": ["characterId không được để trống"]
  }
}
```

### 404 Not Found (Character)
```json
{
  "success": false,
  "error": "Không tìm thấy nhân vật với ID: invalid-id"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": "Vượt quá giới hạn yêu cầu. Vui lòng chờ."
}
```

---

## Phiên Bản

- **API Version**: 1.0.0
- **Last Updated**: 2024-2025
- **Build Feature**: V2

---

## Liên Kết

- [API Tổng Quan](/api)
- [Tài Liệu Kiến Trúc](./docs/API_ARCHITECTURE.md)
- [Tài Liệu Lỗi](./docs/ERROR_HANDLING.md)
