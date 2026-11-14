/**
 * src/core/game/version-art.ts
 *
 * Quản lý Key Art / Banner nghệ thuật độc quyền chính thức theo từng phiên bản Genshin Impact.
 * Cung cấp background art cho VersionHub, /versions và trang chi tiết phiên bản /versions/[version].
 *
 * CHIẾN LƯỢC NGHỆ THUẬT:
 * Sử dụng 100% hình ảnh Key Visual / Splashscreen quảng bá chính thức mỗi khi miHoYo phát sóng
 * chương trình đặc biệt (Special Program Livestream) của từng phiên bản.
 * KHÔNG sử dụng splash art nhân vật đơn lẻ thay thế cho background phiên bản.
 */

/**
 * Bản đồ Key Art độc quyền chính thức theo từng phiên bản (miHoYo Special Program Key Visuals)
 */
export const VERSION_KEY_ART_MAP: Record<string, string> = {
  // ── 7.x Snezhnaya / Nod-Krai ──
  "7.2": "/images/versions/7.2.jpg", // Official Version 7.2 Key Visual (Hour of Ruin)
  "7.1": "/images/versions/7.2.jpg", // Snezhnaya default key art
  "7.0": "/images/versions/7.2.jpg", // Snezhnaya default key art

  // ── 5.x Natlan ──
  "5.4": "/images/versions/5.4.jpg", // Embrace of Enchanting Dreams
  "5.3": "/images/versions/5.3.jpg", // Incandescent Ode of Resurrection
  "5.2": "/images/versions/5.2.jpg", // Tapestry of Spirit and Flame
  "5.1": "/images/versions/5.1.jpg", // The Rainbow Destined to Burn
  "5.0": "/images/versions/5.0.jpg", // Flowers Resplendent on the Sun-Drenched Track

  // ── 4.x Fontaine ──
  "4.8": "/images/versions/4.8.jpg", // Summertide Scales and Tales
  "4.7": "/images/versions/4.7.jpg", // An Everlasting Dream Intertwined
  "4.6": "/images/versions/4.6.jpg", // Two Worlds Aflame, the Crimson Night's Fade
  "4.5": "/images/versions/4.5.jpg", // Blades Weaving Betwixt the Brocade
  "4.4": "/images/versions/4.4.jpg", // Vibrant Harriers Aloft in Spring Breeze
  "4.3": "/images/versions/4.3.jpg", // Roses and Muskets
  "4.2": "/images/versions/4.2.jpg", // Masquerade of the Guilty
  "4.1": "/images/versions/4.1.jpg", // To the Stars Shining in the Depths
  "4.0": "/images/versions/4.0.jpg", // As Light Rain Falls Without Reason

  // ── 3.x Sumeru ──
  "3.8": "/images/versions/3.8.jpg", // Secret Summer Paradise
  "3.7": "/images/versions/3.7.jpg", // Duel! The Summoners' Summit!
  "3.6": "/images/versions/3.6.jpg", // A Parade of Providence
  "3.5": "/images/versions/3.5.jpg", // Windblume's Breath
  "3.4": "/images/versions/3.4.jpg", // The Exquisite Night Chimes
  "3.3": "/images/versions/3.3.jpg", // All Senses Clear, All Existence Void
  "3.2": "/images/versions/3.2.jpg", // Akasha Pulses, the Kalpa Flame Rises
  "3.1": "/images/versions/3.1.jpg", // King Deshret and the Three Magi
  "3.0": "/images/versions/3.0.jpg", // The Morn a Thousand Roses Brings

  // ── 2.x Inazuma ──
  "2.8": "/images/versions/2.8.jpg", // Summer Fantasia
  "2.7": "/images/versions/2.7.jpg", // Hidden Dreams in the Depths
  "2.6": "/images/versions/2.6.jpg", // Zephyr of the Violet Garden
  "2.5": "/images/versions/2.5.jpg", // When the Sakura Bloom
  "2.4": "/images/versions/2.4.jpg", // Fleeting Colors in Flight
  "2.3": "/images/versions/2.3.jpg", // Shadows Amidst Snowstorms
  "2.2": "/images/versions/2.2.jpg", // Into the Perilous Labyrinth of Fog
  "2.1": "/images/versions/2.1.jpg", // Floating World Under the Moonlight
  "2.0": "/images/versions/2.0.jpg", // The Immovable God and the Eternal Euthymia

  // ── 1.x Mondstadt / Liyue ──
  "1.6": "/images/versions/1.6.jpg", // Midsummer Island Adventure
  "1.5": "/images/versions/1.5.jpg", // Beneath the Light of Jadeite
  "1.4": "/images/versions/1.4.jpg", // Invitation of Windblume
  "1.3": "/images/versions/1.3.jpg", // All That Glitters
  "1.2": "/images/versions/1.2.jpg", // The Chalk Prince and the Dragon
  "1.1": "/images/versions/1.1.jpg", // A New Star Approaches
  "1.0": "/images/versions/1.0.jpg", // Welcome to Teyvat
};

/**
 * Tên chủ đề chính thức của các phiên bản (Việt - Anh)
 */
export const VERSION_THEMES: Record<string, { vi: string; en: string }> = {
  // 7.x
  "7.2": { vi: "Giờ Khắc Diệt Vong", en: "Hour of Ruin" },
  "7.1": { vi: "Vũ Điệu Băng Tuyết", en: "The Winter Queen's Waltz" },
  "7.0": { vi: "Khúc Ca Snezhnaya", en: "The Snezhnayan Prelude" },

  // 5.x
  "5.4": { vi: "Giấc Mộng Mê Đắm", en: "Embrace of Enchanting Dreams" },
  "5.3": { vi: "Khúc Khải Hoàn Hồi Sinh", en: "Incandescent Ode of Resurrection" },
  "5.2": { vi: "Dệt Nên Linh Hồn Và Hỏa", en: "Tapestry of Spirit and Flame" },
  "5.1": { vi: "Cầu Vồng Rực Cháy", en: "The Rainbow Destined to Burn" },
  "5.0": { vi: "Dạo Bước Dưới Ánh Mặt Trời", en: "Flowers Resplendent on the Sun-Drenched Track" },

  // 4.x
  "4.8": { vi: "Mùa Hè! Rồng Cổ Tích? Thiên Đường!", en: "Summertide Scales and Tales" },
  "4.7": { vi: "Mộng Vĩnh Hằng Đan Cài", en: "An Everlasting Dream Intertwined" },
  "4.6": { vi: "Hai Thế Giới Rực Cháy, Màn Đêm Đỏ Dần Phai", en: "Two Worlds Aflame, the Crimson Night's Fade" },
  "4.5": { vi: "Dệt Dải Gấm Hoa", en: "Blades Weaving Betwixt the Brocade" },
  "4.4": { vi: "Gió Xuân Lướt Cánh Diều", en: "Vibrant Harriers Aloft in Spring Breeze" },
  "4.3": { vi: "Hoa Hồng Và Xạ Thủ", en: "Roses and Muskets" },
  "4.2": { vi: "Vũ Điệu Của Kẻ Tội Đồ", en: "Masquerade of the Guilty" },
  "4.1": { vi: "Hướng Về Những Vì Sao Trong Đáy Biển", en: "To the Stars Shining in the Depths" },
  "4.0": { vi: "Như Mưa Nhẹ Rơi Không Lý Do", en: "As Light Rain Falls Without Reason" },

  // 3.x
  "3.8": { vi: "Thiên Đường Mùa Hè Bí Mật", en: "Secret Summer Paradise" },
  "3.7": { vi: "Quyết Đấu! Đỉnh Cao Triệu Hồi!", en: "Duel! The Summoners' Summit!" },
  "3.6": { vi: "Lễ Hội Trí Tuệ", en: "A Parade of Providence" },
  "3.5": { vi: "Hơi Thở Hoa Gió", en: "Windblume's Breath" },
  "3.4": { vi: "Đêm Huyền Diệu", en: "The Exquisite Night Chimes" },
  "3.3": { vi: "Lục Căn Thanh Tịnh, Vạn Sở Tiêu Hao", en: "All Senses Clear, All Existence Void" },
  "3.2": { vi: "Akasha Bừng Sáng, Ngọn Lửa Kalpa Bùng Cháy", en: "Akasha Pulses, the Kalpa Flame Rises" },
  "3.1": { vi: "Vua Deshret và Ba Nhà Chiêm Tinh", en: "King Deshret and the Three Magi" },
  "3.0": { vi: "Buổi Sáng Ngàn Bông Hồng Mang Lại", en: "The Morn a Thousand Roses Brings" },

  // 2.x
  "2.8": { vi: "Khúc Ca Mùa Hè", en: "Summer Fantasia" },
  "2.7": { vi: "Ảo Mộng Nơi Đáy Vực", en: "Hidden Dreams in the Depths" },
  "2.6": { vi: "Sắc Tím Vườn Thơ", en: "Zephyr of the Violet Garden" },
  "2.5": { vi: "Khi Hoa Anh Đào Nở", en: "When the Sakura Bloom" },
  "2.4": { vi: "Muôn Sắc Hoa Đăng", en: "Fleeting Colors in Flight" },
  "2.3": { vi: "Ảo Ảnh Giữa Bão Tuyết", en: "Shadows Amidst Snowstorms" },
  "2.2": { vi: "Bí Ẩn Biển Sương Mù", en: "Into the Perilous Labyrinth of Fog" },
  "2.1": { vi: "Trăng Nước Soi Bóng", en: "Floating World Under the Moonlight" },
  "2.0": { vi: "Lôi Thần Uy Nghiêm, Địa Đàng Vĩnh Hằng", en: "The Immovable God and the Eternal Euthymia" },

  // 1.x
  "1.6": { vi: "Mùa Hè! Hải Đảo? Cuộc Phiêu Lưu!", en: "Midsummer Island Adventure" },
  "1.5": { vi: "Dưới Ánh Ngọc Bích", en: "Beneath the Light of Jadeite" },
  "1.4": { vi: "Lời Mời Hoa Gió", en: "Invitation of Windblume" },
  "1.3": { vi: "Tết Hải Đăng", en: "All That Glitters" },
  "1.2": { vi: "Vôi Trắng và Rồng Đen", en: "The Chalk Prince and the Dragon" },
  "1.1": { vi: "Ngôi Sao Đang Đến", en: "A New Star Approaches" },
  "1.0": { vi: "Khởi Hành Teyvat", en: "Welcome to Teyvat" },
};

/**
 * Trả về chủ đề song ngữ của phiên bản — tự động sinh fallback cho các bản tương lai
 */
export function getVersionTheme(version: string): { vi: string; en: string } {
  if (VERSION_THEMES[version]) {
    return VERSION_THEMES[version];
  }
  return {
    vi: `Cập Nhật Phiên Bản ${version}`,
    en: `Version ${version} Update`,
  };
}

/**
 * Trả về đường dẫn ảnh nền Key Visual độc quyền chính thức cho phiên bản tương ứng
 */
export function resolveVersionBackgroundArt(
  version: string,
  _featuredCharacters: Array<{ id: string; meta?: string | null }> = []
): string {
  // 1. Ưu tiên map Key Visual chính thức của phiên bản
  if (VERSION_KEY_ART_MAP[version]) {
    return VERSION_KEY_ART_MAP[version];
  }

  // 2. Với các phiên bản thuộc arc 7.x hoặc 6.x chưa có key visual riêng
  const major = version.split(".")[0];
  if (major === "7") {
    return "/images/versions/7.2.jpg";
  }

  // 3. Fallback mặc định
  return "/images/home-cards/versions.webp";
}
