# Hướng dẫn Sử dụng Component UI Nâng Cao - LEIBO

## 📋 Tổng quan

Các component mới được thêm vào để nâng cấp giao diện web lên chuẩn 100% Genshin Impact với các hiệu ứng visual chính xác như trong game. Tất cả đều sử dụng **dữ liệu thật** từ database Genshin Impact thông qua Prisma ORM.

## 🎨 Các Component Mới

### 1. RarityStars Component
**File**: `src/components/ui/RarityStars.tsx`

Hiển thị sao phẩm cấp với hiệu ứng 3D glow chuẩn game.

```tsx
import { RarityStars } from "@/components/ui/RarityStars";

// Basic usage
<RarityStars count={5} />

// With custom size and animation
<RarityStars count={5} size="lg" animated={true} />

// Sizes: sm (16px), md (20px), lg (28px)
```

**Props**:
- `count`: Số sao (1-5)
- `size`: Kích thước icon ("sm" | "md" | "lg")
- `animated`: Bật/tắt animation glow (default: true)
- `className`: Class CSS bổ sung

### 2. Enhanced ElementIcon Component
**File**: `src/components/character/ElementIcon.tsx`

Icon nguyên tố với animation và glow effects.

```tsx
import { ElementIcon } from "@/components/character/ElementIcon";

// Basic usage
<ElementIcon vision="Pyro" iconUrl="/icons/pyro.png" size={20} />

// Enhanced with animation and glow
<ElementIcon 
  vision="Pyro" 
  iconUrl="/icons/pyro.png" 
  size={32} 
  animated={true}
  glow={true}
/>
```

**Props**:
- `vision`: Tên nguyên tố (Pyro, Hydro, Anemo, Electro, Dendro, Cryo, Geo)
- `iconUrl`: URL icon từ DB
- `size`: Kích thước icon (default: 20px)
- `animated`: Bật/tắt animation pulse (default: false)
- `glow`: Bật/tắt glow effect (default: true)
- `className`: Class CSS bổ sung

### 3. ElementalFrame Component
**File**: `src/components/ui/ElementalFrame.tsx`

Frame trang trí theo nguyên tố với các style khác nhau.

```tsx
import { ElementalFrame } from "@/components/ui/ElementalFrame";

// Simple frame
<ElementalFrame element="Pyro" variant="simple">
  <div>Content</div>
</ElementalFrame>

// Ornate frame with animation
<ElementalFrame element="Pyro" variant="ornate" animated={true}>
  <div>Content</div>
</ElementalFrame>

// Premium frame
<ElementalFrame element="Pyro" variant="premium" animated={true}>
  <div>Content</div>
</ElementalFrame>
```

**Props**:
- `element`: Tên nguyên tố
- `variant`: Kiểu frame ("simple" | "ornate" | "premium")
- `animated`: Bật/tắt animation glow
- `children`: Nội dung bên trong frame
- `className`: Class CSS bổ sung

### 4. Enhanced EntityCard Component
**File**: `src/components/ui/EntityCard.tsx`

Card nhân vật/vũ khí với các tính năng nâng cao.

```tsx
import { EntityCard } from "@/components/ui/EntityCard";

// Basic enhanced card
<EntityCard
  href="/characters/kazuha"
  name="Kazuha"
  subtitle="Sword"
  rarity={5}
  imageSrc="/icons/kazuha.png"
  element="Anemo"
  frameStyle="ornate"
  backgroundType="elemental-gradient"
  useEnhancedStars={true}
/>
```

**Props mới**:
- `frameStyle`: Kiểu frame ("none" | "simple" | "ornate" | "premium")
- `backgroundType`: Loại background ("none" | "elemental-gradient" | "solid")
- `element`: Tên nguyên tố cho styling
- `useEnhancedStars`: Sử dụng RarityStars component thay vì text

### 5. ParticleSystem Component
**File**: `src/components/ui/ParticleSystem.tsx`

Hệ thống particle effects cho tương tác nguyên tố.

```tsx
import { ParticleSystem } from "@/components/ui/ParticleSystem";

// Basic usage
<ParticleSystem element="Pyro" intensity="medium" trigger="hover" />
```

**Props**:
- `element`: Tên nguyên tố
- `intensity`: Cường độ particle ("low" | "medium" | "high")
- `trigger`: Kích hoạt ("hover" | "click" | "auto")
- `className`: Class CSS bổ sung

## 🚀 Đã Áp Dụng Vào Trang Thật (Sử Dữ Liệu Thật)

### ✅ Character Detail Page
- Thay thế text sao bằng RarityStars component
- Bọc hero section trong ElementalFrame variant "premium"
- Áp dụng game-title-glow cho tên nhân vật
- Áp dụng enhanced ElementIcon với animation và glow

### ✅ Character Listing Page
- EntityCard với frameStyle="simple", backgroundType="elemental-gradient"
- useEnhancedStars=true cho hiển thị sao
- Enhanced ElementIcon với animation và glow

### ✅ Home Page
- Featured character card với frameStyle="premium"
- Các card khác với frameStyle="ornate"
- useEnhancedStars=true cho tất cả
- Enhanced ElementIcon với animation và glow
- Game title với glow effect
- Stats với rarity-text-glow

### ✅ Weapons Page
- EntityCard với frameStyle="simple", backgroundType="solid"
- useEnhancedStars=true
- RarityStars trong filter bar thay vì text
- ElementColor dựa trên rarity thay vì nguyên tố

### ✅ Artifacts Page
- EntityCard với frameStyle="simple", backgroundType="solid"
- useEnhancedStars=true
- ElementColor dựa trên rarity

### ✅ Domains Page
- Domain detail hero section trong ElementalFrame
- Game-title-glow cho tên domain
- Game-subtitle cho description

## 🎯 Best Practices

### 1. Performance
- ParticleSystem chỉ nên dùng cho hero sections hoặc featured cards
- Animation nên tắt ở mobile devices khi cần tối ưu performance
- Sử dụng `prefers-reduced-motion` cho accessibility

### 2. Accessibility
- Tất cả animation đều tắt khi người dùng bật `prefers-reduced-motion`
- Component vẫn hoạt động khi JavaScript bị tắt (graceful degradation)
- Focus indicators vẫn hoạt động với các component mới

### 3. Responsive Design
- Frame styles nên điều chỉnh theo breakpoint
- Particle intensity nên giảm trên mobile
- Icon sizes nên scale theo device

## 🔧 Troubleshooting

### TypeScript Errors
Nếu gặp lỗi TypeScript sau khi thêm các component mới:

```bash
npm run typecheck
```

### Lint Errors
Nếu gặp lỗi ESLint:

```bash
npm run lint
```

### Performance Issues
Nếu web chậm sau khi thêm particle effects:

1. Giảm intensity từ "high" xuống "medium" hoặc "low"
2. Chỉ dùng particle effects cho featured sections
3. Tắt animation trên mobile devices

## 📝 Migration Checklist (Đã Hoàn Thành)

- [x] Thay thế text sao bằng RarityStars component trong character detail
- [x] Thêm frameStyle và backgroundType vào EntityCard
- [x] Cập nhật ElementIcon với animation và glow
- [x] Cập nhật typography với game-style classes
- [x] Áp dụng ElementalFrame vào hero sections
- [x] Test accessibility với keyboard navigation
- [x] Performance test với Lighthouse

## 🎨 Color Palette Reference

### Elemental Colors
```css
--el-pyro: #ff7043;
--el-hydro: #35b8ea;
--el-anemo: #5fd6be;
--el-electro: #b17ae0;
--el-dendro: #a4d24a;
--el-cryo: #8fe6ee;
--el-geo: #e0b64c;
```

### Glow Variants
```css
--el-pyro-glow: rgba(255, 112, 67, 0.8);
--el-pyro-glow-soft: rgba(255, 112, 67, 0.4);
--el-pyro-glow-strong: rgba(255, 112, 67, 1);
/* ... tương tự cho các nguyên tố khác */
```

### Rarity Colors
```css
--rarity-5: #f0c95e;
--rarity-4: #b18cd9;
--rarity-3: #7fa8c9;
```

## 🚀 Next Steps

1. **Test trang thật**: Mở http://localhost:3001 để xem các trang với dữ liệu thật
2. **Performance optimization**: Monitor và điều chỉnh nếu cần
3. **User testing**: Thu thập feedback và tinh chỉnh
4. **Documentation**: Cập nhật docs cho các developer khác

---

**Được tạo**: 2026-09-19  
**Version**: 2.0  
**Status**: Production Ready - 100% Real Data