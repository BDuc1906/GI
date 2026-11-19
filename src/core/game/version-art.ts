import { resolveValidatedAsset } from "@/core/assets/asset-resolver";
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
  "7.2": "/images/versions/.webp", // Official Version 7.2 Key Visual (Hour of Ruin)
  "7.1": "/images/versions/.webp", // Official Version 7.1 Key Visual (Where Kristall Roots Run Deep)
  "7.0": "/images/versions/.webp", // Official Version 7.0 Key Visual (A Traveler on a Winter's Night)

  // ── 6.x Luna / Khaenri'ah Arc ──
  "6.7": "/images/versions/.webp",
  "6.6": "/images/versions/.webp",
  "6.5": "/images/versions/.webp",
  "6.4": "/images/versions/.webp",
  "6.3": "/images/versions/.webp",
  "6.2": "/images/versions/.webp", // Song of the Welkin Moon - Columbina
  "6.1": "/images/versions/.webp", // Song of the Welkin Moon - Harbingers
  "6.0": "/images/versions/.webp", // 5-Year Anniversary - 7 Archons Key Visual

  // ── 5.x Natlan ──
  "5.8": "/images/versions/.webp",
  "5.4": "/images/versions/.webp", // Embrace of Enchanting Dreams
  "5.3": "/images/versions/.webp", // Incandescent Ode of Resurrection
  "5.2": "/images/versions/.webp", // Tapestry of Spirit and Flame
  "5.1": "/images/versions/.webp", // The Rainbow Destined to Burn
  "5.0": "/images/versions/.webp", // Flowers Resplendent on the Sun-Drenched Track

  // ── 4.x Fontaine ──
  "4.8": "/images/versions/.webp", // Summertide Scales and Tales
  "4.7": "/images/versions/.webp", // An Everlasting Dream Intertwined
  "4.6": "/images/versions/.webp", // Two Worlds Aflame, the Crimson Night's Fade
  "4.5": "/images/versions/.webp", // Blades Weaving Betwixt the Brocade
  "4.4": "/images/versions/.webp", // Vibrant Harriers Aloft in Spring Breeze
  "4.3": "/images/versions/.webp", // Roses and Muskets
  "4.2": "/images/versions/.webp", // Masquerade of the Guilty
  "4.1": "/images/versions/.webp", // To the Stars Shining in the Depths
  "4.0": "/images/versions/.webp", // As Light Rain Falls Without Reason

  // ── 3.x Sumeru ──
  "3.8": "/images/versions/.webp", // Secret Summer Paradise
  "3.7": "/images/versions/.webp", // Duel! The Summoners' Summit!
  "3.6": "/images/versions/.webp", // A Parade of Providence
  "3.5": "/images/versions/.webp", // Windblume's Breath
  "3.4": "/images/versions/.webp", // The Exquisite Night Chimes
  "3.3": "/images/versions/.webp", // All Senses Clear, All Existence Void
  "3.2": "/images/versions/.webp", // Akasha Pulses, the Kalpa Flame Rises
  "3.1": "/images/versions/.webp", // King Deshret and the Three Magi
  "3.0": "/images/versions/.webp", // The Morn a Thousand Roses Brings

  // ── 2.x Inazuma ──
  "2.8": "/images/versions/.webp", // Summer Fantasia
  "2.7": "/images/versions/.webp", // Hidden Dreams in the Depths
  "2.6": "/images/versions/.webp", // Zephyr of the Violet Garden
  "2.5": "/images/versions/.webp", // When the Sakura Bloom
  "2.4": "/images/versions/.webp", // Fleeting Colors in Flight
  "2.3": "/images/versions/.webp", // Shadows Amidst Snowstorms
  "2.2": "/images/versions/.webp", // Into the Perilous Labyrinth of Fog
  "2.1": "/images/versions/.webp", // Floating World Under the Moonlight
  "2.0": "/images/versions/.webp", // The Immovable God and the Eternal Euthymia

  // ── 1.x Mondstadt / Liyue ──
  "1.6": "/images/versions/.webp", // Midsummer Island Adventure
  "1.5": "/images/versions/.webp", // Beneath the Light of Jadeite
  "1.4": "/images/versions/.webp", // Invitation of Windblume
  "1.3": "/images/versions/.webp", // All That Glitters
  "1.2": "/images/versions/.webp", // The Chalk Prince and the Dragon
  "1.1": "/images/versions/.webp", // A New Star Approaches
  "1.0": "/images/versions/.webp", // Welcome to Teyvat
};

/**
 * Tên chủ đề chính thức của các phiên bản (Việt - Anh)
 */
export const VERSION_THEMES: Record<string, { vi: string; en: string }> = {
  // 7.x
  "7.2": { vi: "Giờ Khắc Diệt Vong", en: "Hour of Ruin" },
  "7.1": { vi: "Nơi Gốc Rễ Pha Lê Lan Rộng", en: "Where Kristall Roots Run Deep" },
  "7.0": { vi: "Lữ Khách Đêm Đông", en: "A Traveler on a Winter's Night" },

  // 6.x
  "6.7": { vi: "Khúc Ca Băng Giá", en: "The Frozen Symphony" },
  "6.6": { vi: "Bóng Đêm Sắp Tàn", en: "Twilight of the Eclipse" },
  "6.5": { vi: "Hồi Ức Khaenri'ah", en: "Echoes of the Underground" },
  "6.4": { vi: "Tiếng Gió Phương Bắc", en: "The Northerly Wind" },
  "6.3": { vi: "Màn Đêm Tỉnh Giấc", en: "Waking the Starlit Sleep" },
  "6.2": { vi: "Bài Ca Chúc Phúc Của Mặt Trăng II", en: "Song of the Welkin Moon II" },
  "6.1": { vi: "Bài Ca Chúc Phúc Của Mặt Trăng I", en: "Song of the Welkin Moon I" },
  "6.0": { vi: "Khúc Hát Năm Thứ 5 — Bảy Vị Thần Tụ Hội", en: "5th Anniversary — Gathering of the Seven" },

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
  // 1. Uu tien bo phan giai Asset da qua kiem dinh (Asset Validation)
  const resolved = resolveValidatedAsset("version", version, "keyArt");
  if (resolved.src && !resolved.isPlaceholder) {
    return resolved.src;
  }

  // 2. Voi cac phien ban cung Arc
  const major = version.split(".")[0];
  if (major === "7") {
    return "/images/versions/7.2.webp";
  }
  if (major === "6") {
    return "/images/versions/6.1.webp";
  }
  if (major === "5") {
    return "/images/versions/5.4.webp";
  }

  // 3. Fallback mac dinh (TUYET DOI KHONG DUNG SPLASH ART NHAN VAT)
  return "/images/home-cards/versions.webp";
}
