# LEIBO Wiki — Design System & UI/UX Guidelines (DESIGN.md)

> Hệ thống quy chuẩn giao diện người dùng (UI), trải nghiệm (UX) và kiến trúc thông tin (Information Architecture) cho LEIBO Genshin Impact Wiki & Tactical Tools.
> Được tổng hợp và tối ưu từ **UI/UX Pro Max**, **Awesome DESIGN.md**, **React Bits** và **Emil Kowalski Skills**.

---

## 1. Triết Lý Cốt Lõi (Core Principles)

1. **Information Density with High Legibility (Mật độ thông tin cao nhưng dễ đọc):**
   * Người dùng đến wiki để tra cứu dữ liệu game, build, sát thương và thời gian. Không làm loãng màn hình bằng các khối khoảng trắng thừa thãi hoặc các banner trùng lặp.
2. **Single Source of Truth / No Duplication (Tuyệt đối không trùng lặp chức năng):**
   * Mỗi tính năng chỉ xuất hiện tại đúng vị trí có ý nghĩa nhất trong luồng người dùng (User Flow).
   * Không tạo nhiều khối khác nhau trên cùng một trang chỉ để dẫn tới cùng 1 URL (ví dụ: cấm việc `/calendar` xuất hiện ở cả Banner, Tools Hub, Beginner Guides và Compendium).
3. **Game Authenticity (Chất game Teyvat nguyên bản):**
   * Sử dụng 100% hình ảnh, art và icon chính thức từ game (HoYoverse). Tuyệt đối không dùng icon tự chế lạc quẻ (ví dụ: cấm dùng icon Đá Sáng Thế / Genesis Crystal nạp tiền để đại diện cho Phản Ứng Nguyên Tố).
4. **Resilient Imagery (Ảnh không bao giờ vỡ):**
   * Mọi thẻ hình ảnh đều phải dùng `SafeImage` hoặc có hàm xử lý `onError` dự phòng. Tuyệt đối không để hiện biểu tượng ảnh lỗi (broken image placeholder).

---

## 2. Kiến Trúc Thông Tin Trang Chủ (Homepage Architecture)

Trang chủ được cấu trúc thành **5 tầng phân cấp logic (5 Tiers)** từ trên xuống dưới:

```
┌────────────────────────────────────────────────────────┐
│ 1. HERO & TÌM KIẾM NHANH (WikiHero)                    │ -> Gõ tên nhân vật/vũ khí tra cứu ngay
├────────────────────────────────────────────────────────┤
│ 2. HUD THỜI GIAN THỰC (ServerTimers)                   │ -> Reset server Asia/EU/NA, La Hoàn, Nhà Hát
├────────────────────────────────────────────────────────┤
│ 3. BỘ CÔNG CỤ CHIẾN THUẬT (WikiToolsHub - Bento Box)   │ -> DPS Calculator (Flagship), Team Builder, UID Sync...
├────────────────────────────────────────────────────────┤
│ 4. DÒNG THỜI GIAN PHIÊN BẢN (VersionHub)               │ -> Điểm tin bản hiện tại, nhân vật & vũ khí mới
├────────────────────────────────────────────────────────┤
│ 5. BÁCH KHOA TOÀN THƯ TEYVAT (TeyvatCompendium)        │ -> Trung tâm tra cứu 21 danh mục (Chiến đấu / Thế giới / Hồ sơ)
└────────────────────────────────────────────────────────┘
```

---

## 3. Hệ Thống Màu Sắc & Nhận Diện Nguyên Tố (Design Tokens)

### 3.1 Bảng Màu 7 Nguyên Tố Teyvat
Mọi thẻ nhân vật, vũ khí, hiệu ứng và chỉ số thuộc nguyên tố nào **bắt buộc** dùng accent color tương ứng:

| Nguyên Tố | CSS Variable | Hex Color | Glow Effect (`React Bits` style) |
| :--- | :--- | :--- | :--- |
| **Pyro (Hỏa)** | `--el-pyro` | `#EF4444` | `shadow-[0_0_20px_rgba(239,68,68,0.25)]` |
| **Hydro (Thủy)** | `--el-hydro` | `#06B6D4` | `shadow-[0_0_20px_rgba(6,182,212,0.25)]` |
| **Anemo (Phong)** | `--el-anemo` | `#10B981` | `shadow-[0_0_20px_rgba(16,185,129,0.25)]` |
| **Electro (Lôi)** | `--el-electro` | `#A855F7` | `shadow-[0_0_20px_rgba(168,85,247,0.25)]` |
| **Dendro (Thảo)** | `--el-dendro` | `#84CC16` | `shadow-[0_0_20px_rgba(132,204,22,0.25)]` |
| **Cryo (Băng)** | `--el-cryo` | `#38BDF8` | `shadow-[0_0_20px_rgba(56,189,248,0.25)]` |
| **Geo (Nham)** | `--el-geo` | `#F59E0B` | `shadow-[0_0_20px_rgba(245,158,11,0.25)]` |

### 3.2 Bảng Màu Độ Hiếm (Rarity)
* **5 Sao (5★):** Vàng kim (`#EAB308` / `#F59E0B` gradient).
* **4 Sao (4★):** Tím thạch anh (`#A855F7` / `#9333EA` gradient).
* **3 Sao (3★):** Lam ngọc (`#3B82F6`).

---

## 4. Quy Chuẩn Bo Góc & Icon (Radii & Icon Standards)

1. **Avatar nhân vật / Quái vật tròn:**
   * Bắt buộc: `rounded-full border border-border/80 overflow-hidden`.
2. **Icon vật phẩm / Vũ khí / Thánh Di Vật:**
   * Kích thước chuẩn: `24x24px` (trong dòng), `40x40px` (trong card danh mục), `56x56px` hoặc `64x64px` (trang chi tiết).
   * Bo góc chuẩn: `rounded-xl` (12px) hoặc `rounded-2xl` (16px). Tuyệt đối không để góc nhọn 90 độ.
3. **Thẻ Bento Card / Container:**
   * Bo góc: `rounded-2xl` (16px) hoặc `rounded-3xl` (24px trên màn hình lớn).
   * Nền: `bg-bg-card/80 backdrop-blur-md border border-border/80`.
   * Viền hover: `hover:border-accent-500/80 transition-all duration-300`.

---

## 5. Quy Chuẩn Trải Nghiệm Vi Mô (Emil Kowalski Micro-Interactions)

1. **Tabs Chuyển Đổi (Segmented Controls):**
   * Khi chuyển qua lại giữa các tab (Build / Thánh di vật / Thiên phú / Đội hình), sử dụng hiệu ứng trượt êm ái, không nhảy giật layout.
2. **Tooltips (Chú thích chỉ số & Buff):**
   * Tooltip chỉ số phải có nền tối `bg-slate-900/95 border border-slate-700/80 backdrop-blur-md`.
   * Luôn kiểm tra `z-index` (tối thiểu `z-50`) và tự động lật vị trí nếu sát viền màn hình (không bao giờ bị cắt cụt ngoài viewport di động).
3. **Phản hồi tương tác (Button Feedback):**
   * Mọi nút bấm, link thẻ card đều có `active:scale-[0.98]` và `hover:-translate-y-0.5` nhẹ để tạo cảm giác bấm vật lý chân thực.

---

## 6. Danh Mục Kiểm Tra Tránh "Lỗi AI Giao Diện" (AI Slop Checklist)

Trước khi commit bất kỳ thay đổi UI nào, bắt buộc kiểm tra:
- [ ] Không có 2 thành phần trên cùng một trang dẫn về cùng một link.
- [ ] Không có ảnh nào bị lỗi mà hiện icon vỡ ảnh của trình duyệt.
- [ ] Mọi icon chức năng đều phản ánh đúng bản chất game (không nhầm Primogem với Achievement, không nhầm Resin với Calendar).
- [ ] Trên màn hình di động (dưới 640px), không có chữ nào bị tràn mép ngang hoặc dính sát viền màn hình (padding tối thiểu `px-4`).
