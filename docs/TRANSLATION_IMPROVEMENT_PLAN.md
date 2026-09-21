# Kế Hoạch Cải Thiện Dịch Thuật LEIBO

## Đánh Giá Hiện Tại

### Điểm Mạnh Tích Cực

**1. Nguồn dữ liệu uy tín cho 13/15 ngôn ngữ**
- Sử dụng `genshin-db` package lấy trực tiếp từ file localization của game Genshin Impact
- Đảm bảo 100% đồng bộ với bản dịch chính thức trong game
- Người dùng sẽ thấy đúng tên/terminology như họ đang chơi

**2. Phạm vi ngôn ngữ đầy đủ**
- Hỗ trợ chính xác 15 ngôn ngữ mà game hỗ trợ (Settings trong game)
- Không bịa thêm/bớt ngôn ngữ so với game gốc
- Sử dụng mã BCP-47 chuẩn quốc tế

**3. Hệ thống glossary chuyên nghiệp**
- Có từ điển thuật ngữ cho phản ứng nguyên tố, cộng hưởng
- Hỗ trợ hover tooltip và chi tiết công thức
- Đã được dịch đủ 15 ngôn ngữ với quality control

**4. Quy trình có kiểm soát**
- Tách biệt translation script và apply script (cho phép review trước khi apply)
- Có fallback an toàn khi thiếu bản dịch
- Sử dụng rate limiting để tránh bị block API

### Điểm Yếu Cần Cải Thiện

**1. Chất lượng không đồng đều giữa các ngôn ngữ**

**Nhóm A (13 ngôn ngữ - Chất lượng cao):**
- en, vi, zh-CN, zh-TW, ja, ko, id, th, de, fr, pt, es, ru
- Nguồn: genshin-db (chính thức từ game)
- Đánh giá: ⭐⭐⭐⭐⭐ (5/5) - Chuẩn 100% với game

**Nhóm B (2 ngôn ngữ - Chất lượng thấp hơn):**
- it (Italian), tr (Turkish)
- Nguồn: Azure Translator (dịch máy)
- Đánh giá: ⭐⭐⭐ (3/5) - Dịch máy cho proper nouns/tên nhân vật có thể sai

**2. UI/Interface vẫn dùng dịch máy**
- File `messages/*.json` (UI text) dùng Azure Translator cho tất cả ngôn ngữ
- Dù ít nhạy cảm hơn tên nhân vật, nhưng vẫn có thể có lỗi ngữ pháp/thiểu văn hóa

**3. Không có quy trình review cộng đồng**
- Dịch thuật tự động, không có contribution từ cộng đồng người dùng
- Thiếu feedback loop để sửa lỗi dịch thuật

### Đánh Giá Tổng Thể

**Score: 7.5/10**

**Ưu điểm chính:** Việc ưu tiên nguồn chính thức từ game cho 13/15 ngôn ngữ là quyết định xuất sắc. Người dùng chơi game bằng tiếng Việt, Nhật, Hàn, v.v. sẽ thấy tên và terminology hoàn toàn đúng.

**Nhược điểm chính:** 
- 2 ngôn ngữ it/tr bị buộc dùng dịch máy (không thể tránh được do game không hỗ trợ)
- UI text vẫn dùng dịch máy thay vì community contribution

---

## Kế Hoạch Cải Thiện Toàn Diện

### 1. Hoàn Thiện Hệ Thống Đã Có

**Kích hoạt và tích hợp các script hiện có:**
- `translation-review-system.ts` - Đã có nhưng cần tích hợp vào CI/CD
- `translation-consistency-checker.ts` - Cần chạy định kỳ
- `game-terminology-glossary.json` - Cần mở rộng và cập nhật thường xuyên

**Hành động cụ thể:**
```bash
# Thêm vào CI/CD pipeline
- name: Translation Consistency Check
  run: npx tsx scripts/i18n/translation-consistency-checker.ts

- name: Translation Review Gate
  run: npx tsx scripts/i18n/translation-review-system.ts --generate-report
```

### 2. Thêm Quy Trình Review Cộng Đồng

**Platform contribution:**
- **Crowdin/Weblate**: Tích hợp platform cho community contribute
- **GitHub Issues**: Template riêng cho translation bugs
- **Pull Request template**: Quy trình review cho translation changes

**Validation rules:**
```typescript
// Ví dụ: Quy tắc validate tên nhân vật
- Không dịch máy tên riêng cho 13 ngôn ngữ chính thức
- Kiểm tra consistency với glossary
- Validate format placeholders
```

**GitHub Issue Template:**
```markdown
---
name: Translation Issue
about: Report a translation error or suggest improvement
title: "[TRANSLATION] [locale] Brief description"
labels: translation, locale-{locale}
---

**Locale:** [vi/ja/ko/etc.]
**Page/Section:** [Character page / Weapon page / UI element]
**Current Text:** [Current incorrect translation]
**Expected Text:** [Correct translation]
**Screenshot:** [Optional screenshot]
**Context:** [Additional context if needed]
```

### 3. Nâng Cao Chất Lượng Cho 2 Ngôn Ngữ Yếu (it, tr)

**Giải pháp cụ thể:**
- **Recruit native speakers** cho Italian và Turkish
- **Crowdsourcing**: Kêu gọi community game player Genshin ở Ý/Thổ Nhĩ Kỳ
- **Professional translation**: Thuê dịch vụ chuyên nghiệp cho proper nouns
- **Fallback strategy**: Document rõ ràng giới hạn, cho phép fallback tiếng Anh

**Quy trình ưu tiên:**
1. Tạo danh sách proper nouns cần review (tên nhân vật, vũ khí, thánh di vật)
2. Gửi cho native speakers review
3. Apply manual corrections
4. Document các thay đổi trong changelog

### 4. Hệ Thống Kiểm Soát Chất Lượng Tự Động

**CI/CD Integration:**
```yaml
# Thêm vào .github/workflows/ci.yml
- name: Translation Consistency Check
  run: npx tsx scripts/i18n/translation-consistency-checker.ts --check-formatting --check-length

- name: Translation Review Gate
  run: npx tsx scripts/i18n/translation-review-system.ts --generate-report
  
- name: Block on High Translation Errors
  if: steps.translation-check.outputs.error_count > 10
  run: exit 1
```

**Pre-commit hooks:**
```bash
# .husky/pre-commit
npm run translation:validate-glossary
npm run translation:check-placeholders
```

**Automated validation:**
- Kiểm tra format placeholders trước khi commit
- Validate glossary consistency
- Prevent direct edit translation files without review

### 5. Mở Rộng Glossary Và Terminology

**Cần bổ sung:**
- **Character names consistency** (đặc biệt it/tr)
- **Skill/Talent terminology** theo từng ngôn ngữ
- **Weapon passive terminology**
- **Artifact set terminology**
- **Cultural context notes** (ví dụ: humor, references)

**Cấu trúc glossary mở rộng:**
```json
{
  "characters": {
    "Kazuha": {
      "en": "Kazuha",
      "vi": "Kazuha",
      "ja": "楓原万葉",
      "ko": "카즈하",
      // ... thêm các ngôn ngữ khác
      "notes": {
        "it": "Keep as Kazuha - proper noun",
        "tr": "Keep as Kazuha - proper noun"
      }
    }
  },
  "skills": {
    "Elemental Skill": {
      "en": "Elemental Skill",
      "vi": "Kỹ năng Nguyên tố",
      "ja": "元素スキル",
      "ko": "원소 스킬"
    }
  }
}
```

### 6. Hệ Thống Feedback Loop

**User-facing features:**
- **"Report translation error" button** trên mỗi trang
- **Translation suggestion form** 
- **Community rating system** cho chất lượng dịch

**Internal tracking:**
- **Translation quality metrics** (error rate, approval rate)
- **Locale-specific issues dashboard**
- **Translation changelog** theo từng version

**UI Component cho feedback:**
```tsx
// TranslationFeedbackButton.tsx
<button onClick={() => setShowFeedbackModal(true)}>
  📝 Report translation issue
</button>
```

### 7. Quy Trình Cập Nhật Khi Game Có Version Mới

**Automated workflow:**
```bash
# 1. Cập nhật genshin-db
npm update genshin-db

# 2. Detect new entities requiring translation
npm run translation:scan-new

# 3. Auto-translate UI text (Azure)
npm run translation:auto-translate

# 4. Extract official names for 13 languages
npm run translation:extract-official

# 5. Manual review trigger
npm run translation:review-queue

# 6. Community review phase
# 7. Apply approved translations
npm run translation:apply-approved
```

**Workflow script mới cần tạo:**
- `scripts/i18n/scan-new-entities.ts` - Phát hiện entity mới
- `scripts/i18n/auto-translate-ui.ts` - Dịch tự động UI
- `scripts/i18n/apply-approved.ts` - Apply translations đã approve

### 8. Documentation Và Training

**Tài liệu cần tạo:**
- **CONTRIBUTING.md**: Quy trình contribute translation
- **TRANSLATION_GUIDE.md**: Style guide cho từng ngôn ngữ
- **GLOSSARY_MAINTENANCE.md**: Cách maintain glossary
- **LOCALE_SPECIFIC_NOTES.md**: Lưu ý đặc thù từng ngôn ngữ

**CONTRIBUTING.md - Translation Section:**
```markdown
## Contributing Translations

### How to contribute
1. Join our Crowdin project: [link]
2. Select your language
3. Translate missing strings
4. Submit for review

### Translation Guidelines
- Use official game terminology from genshin-db
- Follow the style guide for your language
- Keep placeholders intact: {count}, <b>, etc.
- Test your translations in the preview environment

### Review Process
- All translations require approval from language maintainers
- High-priority languages have faster review times
- Technical terms must match the glossary
```

### 9. Monitoring Và Alerting

**Dashboard metrics:**
- Translation coverage per locale
- Error rate per language
- Review queue length
- Community contribution rate

**Alerts:**
- New game version detected → trigger translation workflow
- High error rate in specific locale → alert maintainers
- Stale translations (> 6 months without review)

**Dashboard component:**
```tsx
// TranslationDashboard.tsx
<TranslationStats
  locales={allLocales}
  metrics={{
    coverage: { vi: 98, ja: 95, it: 85 },
    errorRate: { vi: 0.5, ja: 1.2, it: 3.5 },
    reviewQueue: { vi: 5, ja: 12, it: 45 }
  }}
/>
```

### 10. Testing Đa Ngôn Ngữ

**Automated tests:**
```typescript
// translation.test.ts
describe('Character page translations', () => {
  locales.forEach(locale => {
    it(`should display correct character names in ${locale}`, async () => {
      const response = await fetch(`/api/characters?locale=${locale}`);
      const data = await response.json();
      
      data.characters.forEach(char => {
        expect(char.nameTranslations[locale]).toBeDefined();
        expect(char.nameTranslations[locale]).not.toBe(char.name);
      });
    });
    
    it(`should have consistent terminology in ${locale}`, async () => {
      const page = await renderPage(`/characters/${charId}?locale=${locale}`);
      const terminology = extractTerminology(page);
      
      terminology.forEach(term => {
        expect(glossary[term][locale]).toBeDefined();
      });
    });
  });
});
```

**Visual regression tests:**
- Test layout cho từng locale (text length khác nhau)
- Test font rendering cho các script khác nhau
- Test RTL languages (nếu có thêm trong tương lai)

### 11. Context-Aware Translation

**Nâng cao chất lượng:**
- **Context information** cho từng string (nơi sử dụng, context)
- **Character-specific style** (ví dụ: nhân vật hài hước vs nghiêm túc)
- **Lore-aware translation** (tôn trọng cốt truyện game)

**Context metadata structure:**
```json
{
  "key": "character.kazuha.description",
  "context": {
    "location": "character_detail_page",
    "character": "Kazuha",
    "tone": "poetic",
    "length_limit": 200,
    "notes": "Kazuha speaks in a poetic, elegant manner"
  }
}
```

### 12. Local-Specific Optimization

**Tùy chỉnh theo ngôn ngữ:**
- **Text length optimization** cho UI (nhật bản ngắn hơn, Đức dài hơn)
- **Font considerations** cho các script khác nhau
- **Cultural adaptation** cho humor/references

**CSS adjustments per locale:**
```css
/* Tailwind config with locale-specific font sizes */
.text-locale-ja { font-size: 0.9em; } /* Japanese text often needs smaller size */
.text-locale-de { font-size: 1.1em; } /* German text is longer */
```

---

## Kế Hoạch Triển Khai Ưu Tiên

### Phase 1 (Ngắn hạn - 1-2 tuần)

**Mục tiêu: Stabilize hệ thống hiện có**

1. **Tích hợp consistency checker vào CI/CD**
   - Thêm vào `.github/workflows/ci.yml`
   - Setup automatic blocking khi có nhiều lỗi

2. **Mở rộng glossary với terminology còn thiếu**
   - Bổ sung character names cho it/tr
   - Thêm skill/talent terminology
   - Thêm weapon passive terminology

3. **Tạo CONTRIBUTING.md cho translation**
   - Quy trình contribute
   - Style guide cơ bản
   - Link đến Crowdin/Weblate

4. **Thêm "Report translation error" button**
   - UI component feedback
   - GitHub issue integration
   - Dashboard tracking

### Phase 2 (Trung hạn - 1-2 tháng)

**Mục tiêu: Community-driven translation**

1. **Tích hợp Crowdin/Weblate**
   - Setup project
   - Import current translations
   - Configure workflow

2. **Tích hợp review system vào workflow**
   - Connect Crowdin với GitHub
   - Automated PR creation
   - Review approval process

3. **Recruit native speakers cho it/tr**
   - Community outreach
   - Contributor onboarding
   - Review process setup

4. **Tạo translation dashboard**
   - Metrics visualization
   - Review queue management
   - Quality tracking

### Phase 3 (Dài hạn - 3-6 tháng)

**Mục tiêu: Fully automated, high-quality system**

1. **Hoàn thiện automated workflow cho game updates**
   - Auto-detect new game version
   - Auto-trigger translation workflow
   - Auto-apply approved translations

2. **Tạo community translation team**
   - Language maintainers per locale
   - Contributor recognition
   - Quality metrics

3. **Professional translation cho critical content**
   - Priority content identification
   - Professional service integration
   - Quality assurance

4. **Monitoring và alerting system**
   - Real-time quality monitoring
   - Automated alerts
   - Trend analysis

---

## Metrics Thành Công

### Quantitative Metrics

**Coverage:**
- Target: 95%+ translation coverage cho tất cả locales
- Current: ~85% (it/tr thấp hơn)

**Quality:**
- Target: <1% error rate cho 13 ngôn ngữ chính thức
- Target: <3% error rate cho it/tr
- Current: Không có measurement

**Community Engagement:**
- Target: 5+ active contributors per locale
- Target: 48h review time cho high-priority languages

### Qualitative Metrics

**User Satisfaction:**
- Translation error reports giảm 80%
- Positive feedback về translation quality tăng
- Community contribution rate tăng

**System Efficiency:**
- Time to translate new game version: < 7 ngày
- Automated vs manual translation ratio: 80% automated
- Review queue processing time: < 24h

---

## Kết Luận

Với hệ thống hiện tại đã khá tốt (đặc biệt là quyết định dùng genshin-db cho 13 ngôn ngữ), việc bổ sung các bước trên sẽ nâng chất lượng dịch thuật từ **7.5/10** lên **9.5/10**.

**Key Success Factors:**
1. Duy trì ưu tiên nguồn chính thức từ game cho 13 ngôn ngữ
2. Community-driven approach cho it/tr và UI text
3. Automated quality control trong CI/CD
4. Continuous feedback loop từ người dùng
5. Clear documentation và contribution guidelines

**Timeline Estimate:**
- Phase 1: 2 tuần
- Phase 2: 6-8 tuần  
- Phase 3: 12-16 tuần

**Total: 4-6 tháng để đạt chất lượng dịch thuật hoàn hảo.**